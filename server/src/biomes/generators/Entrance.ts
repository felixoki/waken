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
    firstgids: Map<string, number>,
    spawn: { x: number; y: number },
    salt = 0,
    taken: { x: number; y: number }[] = [],
  ): {
    layer: number[];
    entities: Entity[];
    origin: { x: number; y: number };
  } | null {
    const { width, tileWidth, tileHeight } = this.config;
    const { facade, door } = this.def;
    const gen = handlers.generation;

    const origin = this._origin(terrain, spawn, salt, taken);
    if (!origin) return null;

    const layer = new Array(width * this.config.height).fill(0);

    for (let row = 0; row < facade.length; row++)
      for (let col = 0; col < facade[row].length; col++) {
        const cell = facade[row][col];
        if (!cell) continue;

        const gid = firstgids.get(cell[0]);
        if (gid === undefined) continue;

        const index = gen.toIndex(origin.x + col, origin.y + row, width);
        layer[index] = gid + cell[1];
      }

    const entities: Entity[] = [];

    const doorX = (origin.x + door.col + 1) * tileWidth;
    const doorY = (origin.y + door.row + 1) * tileHeight;

    entities.push({ name: this.def.entity, x: doorX, y: doorY });

    if (this.def.guards) {
      const guardY = (origin.y + facade.length) * tileHeight;
      const guards = [
        { x: (origin.x - 1) * tileWidth, y: guardY },
        { x: (origin.x + facade[0].length) * tileWidth, y: guardY },
        { x: doorX, y: guardY + 2 * tileHeight },
      ];

      for (const g of guards)
        entities.push({ name: this.def.guards, x: g.x, y: g.y });
    }

    return { layer, entities, origin };
  }

  private _origin(
    terrain: TerrainName[],
    spawn: { x: number; y: number },
    salt: number,
    taken: { x: number; y: number }[],
  ): { x: number; y: number } | null {
    const { width, height, tileWidth, tileHeight } = this.config;
    const gen = handlers.generation;

    const fw = this.def.facade[0].length;
    const fh = this.def.facade.length;
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
