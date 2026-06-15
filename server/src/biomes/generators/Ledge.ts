import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import {
  BorderPosition,
  GridDimensions,
  TerrainName,
  TileRole,
  WallMatch,
} from "../../types/generation";

export class LedgeGenerator {
  private width: number;
  private height: number;
  private loader: TilesetLoader;

  constructor(dimensions: GridDimensions, loader: TilesetLoader) {
    this.width = dimensions.width;
    this.height = dimensions.height;
    this.loader = loader;
  }

  generate(
    terrain: TerrainName[],
    tileset: string,
    firstgid: number,
  ): number[] {
    const data = new Array(this.width * this.height).fill(0);

    this._place(terrain, tileset, firstgid, data, true);
    this._place(terrain, tileset, firstgid, data, false);

    return data;
  }

  private _place(
    terrain: TerrainName[],
    tileset: string,
    firstgid: number,
    data: number[],
    cornersOnly: boolean,
  ) {
    const columns = this.loader.load(tileset).columns;

    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++) {
        const idx = handlers.generation.toIndex(x, y, this.width);
        const cell = terrain[idx];

        if (cell !== TerrainName.ELEVATED && cell !== TerrainName.RECESSED)
          continue;
        if (data[idx] !== 0) continue;

        const match = this._classify(terrain, cell, x, y);
        if (!match) continue;

        const isCorner =
          match.position !== BorderPosition.TOP &&
          match.position !== BorderPosition.BOTTOM &&
          match.position !== BorderPosition.LEFT &&
          match.position !== BorderPosition.RIGHT;

        if (cornersOnly !== isCorner) continue;

        const tile = this.loader.queryOne(tileset, {
          role: match.role,
          position: match.position,
        });
        if (!tile) continue;

        const props = handlers.generation.parseProperties(tile.properties);
        const ph = props.height ?? match.placement.height;
        const baseTile = tile.id;

        data[idx] = firstgid + baseTile;

        if (ph === 2) {
          const baseIdx = (y + 1) * this.width + x;

          if (
            baseIdx < this.width * this.height &&
            data[baseIdx] === 0 &&
            !this._hasFloorNeighbor(terrain, x, y + 1, cell)
          )
            data[baseIdx] = firstgid + baseTile + columns;
        }
      }
  }

  private _classify(
    terrain: TerrainName[],
    cell: TerrainName,
    x: number,
    y: number,
  ): WallMatch | null {
    const get = (dx: number, dy: number): TerrainName | null => {
      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height)
        return TerrainName.FLOOR;
      return terrain[handlers.generation.toIndex(nx, ny, this.width)];
    };

    const north = get(0, -1);
    const south = get(0, 1);
    const east = get(1, 0);
    const west = get(-1, 0);
    const northeast = get(1, -1);
    const northwest = get(-1, -1);
    const southeast = get(1, 1);
    const southwest = get(-1, 1);

    const fl = (t: TerrainName | null) => t === TerrainName.FLOOR;

    const outerRole =
      cell === TerrainName.ELEVATED
        ? TileRole.LEDGE_OUTER
        : TileRole.LEDGE_INNER;
    const innerRole =
      cell === TerrainName.ELEVATED
        ? TileRole.LEDGE_INNER
        : TileRole.LEDGE_OUTER;

    /** North edge (convex) */
    if (fl(north)) {
      if (fl(east) && fl(northeast))
        return {
          role: outerRole,
          position: BorderPosition.TOP_RIGHT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };

      if (fl(west) && fl(northwest))
        return {
          role: outerRole,
          position: BorderPosition.TOP_LEFT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };

      return {
        role: outerRole,
        position: BorderPosition.TOP,
        placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
      };
    }

    /** South edge (convex, visible face — 2 tiles high) */
    if (fl(south)) {
      if (fl(east) && fl(southeast))
        return {
          role: outerRole,
          position: BorderPosition.BOTTOM_RIGHT,
          placement: { width: 1, height: 2, anchor: { x: 0, y: 0 } },
        };

      if (fl(west) && fl(southwest))
        return {
          role: outerRole,
          position: BorderPosition.BOTTOM_LEFT,
          placement: { width: 1, height: 2, anchor: { x: 0, y: 0 } },
        };

      return {
        role: outerRole,
        position: BorderPosition.BOTTOM,
        placement: { width: 1, height: 2, anchor: { x: 0, y: 0 } },
      };
    }

    /** Sides (convex) */
    if (fl(east))
      return {
        role: outerRole,
        position: BorderPosition.RIGHT,
        placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
      };

    if (fl(west))
      return {
        role: outerRole,
        position: BorderPosition.LEFT,
        placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
      };

    /** Diagonal-only corners (concave) — north-facing inner = 2 tiles */
    if (fl(northwest))
      return {
        role: innerRole,
        position: BorderPosition.BOTTOM_RIGHT,
        placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
      };

    if (fl(northeast))
      return {
        role: innerRole,
        position: BorderPosition.BOTTOM_LEFT,
        placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
      };

    if (fl(southwest))
      return {
        role: innerRole,
        position: BorderPosition.TOP_RIGHT,
        placement: { width: 1, height: 2, anchor: { x: 0, y: 0 } },
      };

    if (fl(southeast))
      return {
        role: innerRole,
        position: BorderPosition.TOP_LEFT,
        placement: { width: 1, height: 2, anchor: { x: 0, y: 0 } },
      };

    return null;
  }

  private _hasFloorNeighbor(
    terrain: TerrainName[],
    x: number,
    y: number,
    cell: TerrainName,
  ): boolean {
    if (terrain[y * this.width + x] !== cell) return false;

    for (let oy = -1; oy <= 1; oy++)
      for (let ox = -1; ox <= 1; ox++) {
        if (ox === 0 && oy === 0) continue;

        const nx = x + ox;
        const ny = y + oy;

        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        if (terrain[ny * this.width + nx] === TerrainName.FLOOR) return true;
      }

    return false;
  }
}
