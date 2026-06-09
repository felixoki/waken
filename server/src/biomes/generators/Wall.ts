import { handlers } from "../../handlers";
import { TilesetLoader } from "../../loaders/Tileset";
import {
  BorderPosition,
  GridDimensions,
  TerrainName,
  TileRole,
  WallMatch,
} from "../../types/generation";

export class WallGenerator {
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
  ): { below: number[]; above: number[] } {
    const below = new Array(this.width * this.height).fill(0);
    const above = new Array(this.width * this.height).fill(0);

    this._place(terrain, tileset, firstgid, below, above, true);
    this._place(terrain, tileset, firstgid, below, above, false);

    return { below, above };
  }

  private _place(
    terrain: TerrainName[],
    tileset: string,
    firstgid: number,
    below: number[],
    above: number[],
    cornersOnly: boolean,
  ) {
    const columns = this.loader.load(tileset).columns;

    for (let y = this.height - 1; y >= 0; y--)
      for (let x = 0; x < this.width; x++) {
        const i = handlers.generation.toIndex(x, y, this.width);
        const cell = terrain[i];

        if (cell !== TerrainName.VOID && cell !== TerrainName.WALL_BASE)
          continue;
        if (below[i] !== 0 || above[i] !== 0) continue;

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
        const pw = props.width ?? match.placement.width;
        const ph = props.height ?? match.placement.height;
        const anchor = {
          x: props.anchor_x ?? match.placement.anchor.x,
          y: props.anchor_y ?? match.placement.anchor.y,
        };
        const baseTile = tile.id - anchor.y * columns - anchor.x;

        const rendersAbove = this._rendersAbove(match);

        for (let by = 0; by < ph; by++)
          for (let bx = 0; bx < pw; bx++) {
            const wx = x - anchor.x + bx;
            const wy = y - anchor.y + by;

            if (wx < 0 || wx >= this.width || wy < 0 || wy >= this.height)
              continue;

            const wi = handlers.generation.toIndex(wx, wy, this.width);
            const target = rendersAbove ? above : below;
            if (target[wi] !== 0) continue;

            target[wi] = firstgid + baseTile + bx + by * columns;
          }
      }
  }

  private _rendersAbove(match: WallMatch): boolean {
    if (
      match.role === TileRole.WALL_OUTER &&
      (match.position === BorderPosition.TOP ||
        match.position === BorderPosition.TOP_LEFT ||
        match.position === BorderPosition.TOP_RIGHT)
    )
      return true;

    if (
      match.role === TileRole.WALL_INNER &&
      (match.position === BorderPosition.BOTTOM_LEFT ||
        match.position === BorderPosition.BOTTOM_RIGHT)
    )
      return true;

    return false;
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
        return null;

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

    /** Outer corners: wall_base with floor S + cardinal side + diagonal */
    if (cell === TerrainName.WALL_BASE && fl(south)) {
      if (fl(east) && fl(southeast))
        return {
          role: TileRole.WALL_OUTER,
          position: BorderPosition.BOTTOM_RIGHT,
          placement: { width: 1, height: 3, anchor: { x: 0, y: 2 } },
        };

      if (fl(west) && fl(southwest))
        return {
          role: TileRole.WALL_OUTER,
          position: BorderPosition.BOTTOM_LEFT,
          placement: { width: 1, height: 3, anchor: { x: 0, y: 2 } },
        };

      /** Horizontal straight top */
      return {
        role: TileRole.WALL_OUTER,
        position: BorderPosition.BOTTOM,
        placement: { width: 1, height: 3, anchor: { x: 0, y: 2 } },
      };
    }

    /** Outer corners: void with floor N + cardinal side + diagonal */
    if (cell === TerrainName.VOID && fl(north)) {
      if (fl(east) && fl(northeast))
        return {
          role: TileRole.WALL_OUTER,
          position: BorderPosition.TOP_RIGHT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };

      if (fl(west) && fl(northwest))
        return {
          role: TileRole.WALL_OUTER,
          position: BorderPosition.TOP_LEFT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };

      /** Horizontal straight bottom */
      return {
        role: TileRole.WALL_OUTER,
        position: BorderPosition.TOP,
        placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
      };
    }

    /** Vertical straights */
    if (cell === TerrainName.VOID) {
      if (fl(east))
        return {
          role: TileRole.WALL_OUTER,
          position: BorderPosition.LEFT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };

      if (fl(west))
        return {
          role: TileRole.WALL_OUTER,
          position: BorderPosition.RIGHT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };
    }

    /** Inner corners: void with 0 cardinal floor + 1 diagonal floor */
    if (cell === TerrainName.VOID) {
      if (fl(north) || fl(south) || fl(east) || fl(west)) return null;

      if (fl(northwest))
        return {
          role: TileRole.WALL_INNER,
          position: BorderPosition.BOTTOM_RIGHT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };

      if (fl(northeast))
        return {
          role: TileRole.WALL_INNER,
          position: BorderPosition.BOTTOM_LEFT,
          placement: { width: 1, height: 1, anchor: { x: 0, y: 0 } },
        };

      if (fl(southwest))
        return {
          role: TileRole.WALL_INNER,
          position: BorderPosition.TOP_RIGHT,
          placement: { width: 1, height: 3, anchor: { x: 0, y: 2 } },
        };

      if (fl(southeast))
        return {
          role: TileRole.WALL_INNER,
          position: BorderPosition.TOP_LEFT,
          placement: { width: 1, height: 3, anchor: { x: 0, y: 2 } },
        };
    }

    return null;
  }
}
