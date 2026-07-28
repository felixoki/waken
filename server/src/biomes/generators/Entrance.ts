import { configs } from "../../configs";
import { handlers } from "../../handlers";
import {
  BiomeConfig,
  EntranceDef,
  Entity,
  TerrainName,
} from "../../types/generation";

export class EntranceGenerator {
  private config: BiomeConfig;
  private seed: string;
  private def: EntranceDef;

  constructor(config: BiomeConfig, seed: string, def: EntranceDef) {
    this.config = config;
    this.seed = seed;
    this.def = def;
  }

  generate(
    terrain: TerrainName[],
    spawn: { x: number; y: number },
    salt = 0,
    taken: { x: number; y: number }[] = [],
  ): {
    entities: Entity[];
    origin: { x: number; y: number };
  } | null {
    const { tileWidth, tileHeight } = this.config;
    const { width: fw, height: fh, entity } = this.def;

    const origin = this._origin(terrain, spawn, salt, taken);
    if (!origin) return null;

    const entities: Entity[] = [];

    const offset = configs.entities[entity]?.offset;
    const centerX = (origin.x + fw / 2) * tileWidth;
    const centerY = (origin.y + fh / 2) * tileHeight;

    entities.push({
      name: entity,
      x: centerX + (offset?.x ?? 0),
      y: centerY + (offset?.y ?? 0),
    });

    if (this.def.guards) {
      const guardY = (origin.y + fh) * tileHeight;
      const guards = [
        { x: (origin.x - 1) * tileWidth, y: guardY },
        { x: (origin.x + fw) * tileWidth, y: guardY },
        { x: centerX, y: guardY + 2 * tileHeight },
      ];

      for (const g of guards)
        entities.push({ name: this.def.guards, x: g.x, y: g.y });
    }

    return { entities, origin };
  }

  private _origin(
    terrain: TerrainName[],
    spawn: { x: number; y: number },
    salt: number,
    taken: { x: number; y: number }[],
  ): { x: number; y: number } | null {
    const { width, height, tileWidth, tileHeight } = this.config;
    const gen = handlers.generation;

    const fw = this.def.width;
    const fh = this.def.height;
    const margin = 3;
    const min = this.def.minDistance ?? 40;
    const spacing = this.def.spacing ?? 16;

    const spawnTile = {
      x: Math.floor(spawn.x / tileWidth),
      y: Math.floor(spawn.y / tileHeight),
    };

    const fits = (ox: number, oy: number): boolean => {
      for (let dy = -margin; dy < fh + margin; dy++)
        for (let dx = -margin; dx < fw + margin; dx++) {
          const x = ox + dx;
          const y = oy + dy;

          if (x < 0 || y < 0 || x >= width || y >= height) return false;
          if (!this.config.terrain.includes(terrain[gen.toIndex(x, y, width)]))
            return false;
        }

      return true;
    };

    const candidates: { x: number; y: number }[] = [];

    for (let y = margin; y < height - fh - margin; y++)
      for (let x = margin; x < width - fw - margin; x++) {
        const distance = Math.abs(x - spawnTile.x) + Math.abs(y - spawnTile.y);

        if (distance < min) continue;
        if (taken.some((t) => Math.abs(x - t.x) + Math.abs(y - t.y) < spacing))
          continue;
        if (fits(x, y)) candidates.push({ x, y });
      }

    if (!candidates.length) return null;

    const hash = gen.spatialHash(
      candidates.length,
      7 + this.def.entity.length + salt,
      this.seed.length,
    );
    return candidates[hash % candidates.length];
  }
}
