import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { EntityConfig, EntityName, MapName, TiledMap } from "../types.js";
import { randomUUID } from "crypto";

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

    return {
      id: randomUUID(),
      name,
      health: 100,
      map: id,
      x: obj.x,
      y: obj.y,
    };
  }
}
