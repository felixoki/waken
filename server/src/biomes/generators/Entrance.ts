import { handlers } from "../../handlers";
import { EntityName } from "../../types";
import { BiomeConfig, Entity, TerrainName } from "../../types/generation";

type FacadeCell = readonly [string, number] | null;

const W = "dungeon_walls_floor";
const C = "dungeon_decorative_cracks_floor";

const FACADE: readonly (readonly FacadeCell[])[] = [
  [[C, 33], [C, 3], [C, 2], [C, 3], [W, 121], [C, 30]],
  [[C, 10], [W, 138], [W, 138], [W, 138], [W, 246], [C, 15]],
  [[C, 8], [W, 245], [W, 138], [W, 138], [W, 138], [C, 12]],
  [[C, 41], [C, 4], [W, 180], [W, 181], [C, 5], [C, 47]],
  [[W, 171], [W, 172], [W, 197], [W, 198], [W, 172], [W, 173]],
  [null, null, [W, 214], [W, 215], null, null],
];

const DOOR = { col: 2, row: 1 } as const;

export class EntranceGenerator {
  private config: BiomeConfig;
  private seed: string;

  constructor(config: BiomeConfig, seed: string) {
    this.config = config;
    this.seed = seed;
  }

  generate(
    terrain: TerrainName[],
    firstgids: Map<string, number>,
    spawn: { x: number; y: number },
  ): { layer: number[]; entities: Entity[] } | null {
    const { width, tileWidth, tileHeight } = this.config;
    const gen = handlers.generation;

    const origin = this._origin(terrain, spawn);
    if (!origin) return null;

    const layer = new Array(width * this.config.height).fill(0);

    for (let row = 0; row < FACADE.length; row++)
      for (let col = 0; col < FACADE[row].length; col++) {
        const cell = FACADE[row][col];
        if (!cell) continue;

        const gid = firstgids.get(cell[0]);
        if (gid === undefined) continue;

        const index = gen.toIndex(origin.x + col, origin.y + row, width);
        layer[index] = gid + cell[1];
      }

    const entities: Entity[] = [];

    const doorX = (origin.x + DOOR.col + 1) * tileWidth;
    const doorY = (origin.y + DOOR.row + 1) * tileHeight;

    entities.push({ name: EntityName.DUNGEON_ENTRANCE, x: doorX, y: doorY });

    const guardY = (origin.y + FACADE.length) * tileHeight;
    const guards = [
      { x: (origin.x - 1) * tileWidth, y: guardY },
      { x: (origin.x + FACADE[0].length) * tileWidth, y: guardY },
      { x: doorX, y: guardY + 2 * tileHeight },
    ];

    for (const g of guards)
      entities.push({ name: EntityName.ORC1, x: g.x, y: g.y });

    return { layer, entities };
  }

  private _origin(
    terrain: TerrainName[],
    spawn: { x: number; y: number },
  ): { x: number; y: number } | null {
    const { width, height, tileWidth, tileHeight } = this.config;
    const gen = handlers.generation;

    const fw = FACADE[0].length;
    const fh = FACADE.length;
    const margin = 3;
    const min = 40;

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
        if (fits(x, y)) candidates.push({ x, y });
      }

    if (!candidates.length) return null;

    const hash = gen.spatialHash(candidates.length, 7, this.seed.length);
    return candidates[hash % candidates.length];
  }
}
