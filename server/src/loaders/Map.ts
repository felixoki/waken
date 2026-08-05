import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import {
  EntityConfig,
  EntityName,
  FishName,
  Item,
  MapName,
  SpawnerConfig,
  TextureSpawnerConfig,
  TiledMap,
  ZoneConfig,
  ZoneName,
} from "../types/index.js";
import { randomUUID } from "crypto";
import { configs } from "../configs/index.js";
import { MAX_HEALTH } from "../globals.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
const __maps = "../../../client/public/assets/maps";

export class MapLoader {
  load(map: string): TiledMap {
    const path = join(__dirname, __maps, map);
    const content = readFileSync(path, "utf-8");
    return JSON.parse(content) as TiledMap;
  }

  parseEntities(id: MapName, data: TiledMap): EntityConfig[] {
    const entities: EntityConfig[] = [];

    const layers = data.layers.filter((layer) => layer.type === "objectgroup");

    for (const layer of layers) {
      if (!layer.objects) continue;

      for (const obj of layer.objects) {
        const config = this._createEntity(id, obj);
        if (config) entities.push(config);
      }
    }

    return entities;
  }

  private _createEntity(id: MapName, obj: any): EntityConfig | null {
    const name = EntityName[obj.name.toUpperCase() as keyof typeof EntityName];

    if (!name) return null;

    const maxHealth = configs.entities[name]?.maxHealth ?? MAX_HEALTH;

    return {
      id: randomUUID(),
      name,
      health: maxHealth,
      maxHealth,
      map: id,
      x: obj.x,
      y: obj.y,
      createdAt: Date.now(),
      isLocked: false,
      loot: this._parseContents(obj),
      spawner: this._parseSpawner(obj),
      textureSpawner: this._parseTextureSpawner(obj),
      zone: this._parseZone(obj),
    };
  }

  private _parseContents(obj: any): (Item & { chance: number })[] | undefined {
    const prop = obj.properties?.find((p: any) => p.name === "contents");
    if (!prop?.value) return undefined;

    const items = JSON.parse(prop.value) as {
      name: EntityName;
      quantity: number;
    }[];

    return items.map((item) => ({
      ...item,
      stackable: configs.entities[item.name]?.metadata?.stackable ?? false,
      chance: 1,
    }));
  }

  private _parseSpawner(obj: any): SpawnerConfig | undefined {
    const prop = obj.properties?.find((p: any) => p.name === "spawner");
    return prop?.value ? (JSON.parse(prop.value) as SpawnerConfig) : undefined;
  }

  private _parseTextureSpawner(obj: any): TextureSpawnerConfig | undefined {
    const prop = obj.properties?.find((p: any) => p.name === "textureSpawner");
    return prop?.value
      ? (JSON.parse(prop.value) as TextureSpawnerConfig)
      : undefined;
  }

  private _parseZone(obj: any): ZoneConfig | undefined {
    const prop = obj.properties?.find((p: any) => p.name === "zone");
    if (!prop?.value) return undefined;

    const parsed = JSON.parse(prop.value) as {
      type?: string;
      fish?: string[];
      width?: number;
      height?: number;
    };

    if (
      !parsed.type ||
      !(Object.values(ZoneName) as string[]).includes(parsed.type)
    )
      return undefined;

    const type = parsed.type as ZoneName;
    const width = parsed.width ?? (obj.width > 1 ? obj.width : 64);
    const height = parsed.height ?? (obj.height > 1 ? obj.height : 64);

    const config: ZoneConfig = { type, width, height };

    if (type === ZoneName.FISH) {
      const valid = Object.values(FishName) as string[];
      const fish = (parsed.fish ?? []).filter((name): name is FishName =>
        valid.includes(name),
      );

      if (!fish.length) return undefined;

      config.fish = fish;
    }

    return config;
  }
}
