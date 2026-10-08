import { handlers } from "../../handlers";
import { DUNGEON_CANDLE_CHANCE, DUNGEON_CANDLE_GAP } from "../../globals";
import { TilesetLoader } from "../../loaders/Tileset";
import {
  ArchConfig,
  BorderPosition,
  GridDimensions,
  TerrainName,
  TileRole,
  WallMatch,
} from "../../types/generation";

const TOP = 53;
const MID = 70;
const BOTTOM = 87;
const END_LEFT = 52;
const END_RIGHT = 54;
const VOID_LEFT = 26;
const VOID_RIGHT = 28;
const STEP_LEFT = [43, 46];
const STEP_RIGHT = [45, 49];
const NICHE = 444;
const NICHE_INSET = 4;
const NICHE_RUN = 24;
const INNER_LEFT = 22;
const INNER_RIGHT = 24;
const FLAT = 309;
const FLAT_END = 310;
const DOOR_LEFT = 301;
const DOOR_RIGHT = 299;

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

    for (let y = this.height - 1; y >= 0; y--) {
      this._place(terrain, tileset, firstgid, below, above, y, "corners");
      this._place(terrain, tileset, firstgid, below, above, y, "faces");
    }

    for (let y = this.height - 1; y >= 0; y--)
      this._place(terrain, tileset, firstgid, below, above, y, "sides");

    this._steps(tileset, firstgid, below, above);

    return { below, above };
  }

  doors(
    tileset: string,
    firstgid: number,
    walls: number[],
    doors: number[],
  ) {
    const columns = this.loader.load(tileset).columns;
    const size = this.width * this.height;

    for (let i = 0; i < size - this.width * 2; i++) {
      if (doors[i] === 0 || walls[i] === 0) continue;

      const end = walls[i] - firstgid;
      if (end !== END_RIGHT && end !== END_LEFT) continue;

      const rise = doors[i + this.width] !== 0 ? 1 : 2;
      const anchor = (end === END_RIGHT ? STEP_LEFT : STEP_RIGHT)[rise - 1];

      for (let r = 0; r < 3; r++) {
        walls[i + r * this.width] = firstgid + anchor + r * columns;
        if (r < 3 - rise) doors[i + r * this.width] = 0;
      }
    }
  }

  flatten(
    terrain: TerrainName[],
    firstgid: number,
    walls: number[],
    above: number[],
    doors?: number[],
  ) {
    const flat = (i: number) =>
      above[i] === firstgid + FLAT || above[i] === firstgid + FLAT_END;

    for (let i = 0; i < walls.length; i++) {
      if (terrain[i] !== TerrainName.FLOOR || above[i] !== 0) continue;

      const id = walls[i] - firstgid;
      if (id !== TOP && id !== INNER_LEFT && id !== INNER_RIGHT) continue;

      walls[i] = 0;
      above[i] = firstgid + (id === INNER_RIGHT ? FLAT_END : FLAT);
    }

    if (!doors) return;

    for (let i = 1; i < doors.length - 1; i++) {
      const id = doors[i] - firstgid;

      if (id === DOOR_RIGHT && flat(i + 1)) doors[i] = firstgid + FLAT;
      if (id === DOOR_LEFT && flat(i - 1)) doors[i] = firstgid + FLAT;
    }
  }

  niches(
    tileset: string,
    firstgid: number,
    walls: number[],
    windows: number[],
    obstacles: { minX: number; minY: number; maxX: number; maxY: number }[],
    tileWidth: number,
    tileHeight: number,
    seed: string,
  ): { x: number; y: number; size: number }[] {
    const columns = this.loader.load(tileset).columns;
    const { width, height } = this;
    const rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${seed}-candles`),
    );
    const niches: { x: number; y: number; size: number }[] = [];

    const plain = (x: number, y: number) =>
      walls[(y - 1) * width + x] === firstgid + TOP &&
      walls[y * width + x] === firstgid + MID &&
      walls[(y + 1) * width + x] === firstgid + BOTTOM;

    for (let y = 1; y < height - 1; y++) {
      let last = -DUNGEON_CANDLE_GAP;
      let lit = -1;

      for (let x = 1; x < width - 2; x++) {
        if (x - last < DUNGEON_CANDLE_GAP) continue;
        if (!plain(x - 1, y) || !plain(x, y) || !plain(x + 1, y)) continue;
        if (!plain(x + 2, y)) continue;

        let from = x;
        let to = x;

        while (from > 0 && walls[y * width + from - 1] !== 0) from--;
        while (to < width - 1 && walls[y * width + to + 1] !== 0) to++;

        if (to - from < NICHE_RUN && lit === from) continue;

        const niche = {
          minX: x * tileWidth + NICHE_INSET,
          minY: y * tileHeight + NICHE_INSET,
          maxX: (x + 2) * tileWidth - NICHE_INSET,
          maxY: (y + 2) * tileHeight - NICHE_INSET,
        };

        if (obstacles.some((o) => handlers.generation.rooms.overlaps(o, niche)))
          continue;
        if (rng() > DUNGEON_CANDLE_CHANCE) continue;

        const roll = rng();
        const i = y * width + x;

        windows[i] = firstgid + NICHE;
        windows[i + 1] = firstgid + NICHE + 1;
        windows[i + width] = firstgid + NICHE + columns;
        windows[i + width + 1] = firstgid + NICHE + columns + 1;

        niches.push({ x, y, size: roll < 0.5 ? 1 : roll < 0.8 ? 2 : 3 });
        last = x;
        lit = from;
      }
    }

    return niches;
  }

  arches(
    config: ArchConfig,
    walls: number[],
    wallsGid: number,
    archGid: number,
    obstacles: { minX: number; minY: number; maxX: number; maxY: number }[],
    occupied: number[],
    tileWidth: number,
    tileHeight: number,
    seed: string,
  ): { data: number[]; spots: { x: number; y: number }[] } {
    const { width, height } = this;
    const rows = config.tiles.length;
    const columns = config.tiles[0].length;
    const rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${seed}-arches`),
    );
    const data = new Array(width * height).fill(0);
    const spots: { x: number; y: number }[] = [];
    const faces = [TOP, MID, BOTTOM];

    const plain = (x: number, y: number) =>
      faces.every(
        (id, r) =>
          walls[(y + r) * width + x] === wallsGid + id &&
          occupied[(y + r) * width + x] === 0,
      );

    for (let y = 0; y <= height - rows; y++) {
      let last = -config.gap;

      for (let x = 1; x < width - columns; x++) {
        if (x - last < config.gap) continue;

        let free = true;
        for (let dx = -1; dx <= columns && free; dx++) free = plain(x + dx, y);
        if (!free) continue;

        const box = {
          minX: (x - 1) * tileWidth,
          minY: y * tileHeight,
          maxX: (x + columns + 1) * tileWidth,
          maxY: (y + rows + 1) * tileHeight,
        };

        if (obstacles.some((o) => handlers.generation.rooms.overlaps(o, box)))
          continue;
        if (rng() > config.chance) continue;

        for (let r = 0; r < rows; r++)
          for (let c = 0; c < columns; c++) {
            const i = (y + r) * width + x + c;

            walls[i] = 0;
            data[i] = archGid + config.tiles[r][c];
          }

        spots.push({ x, y });
        last = x;
      }
    }

    return { data, spots };
  }

  private _steps(
    tileset: string,
    firstgid: number,
    below: number[],
    above: number[],
  ) {
    const columns = this.loader.load(tileset).columns;
    const { width, height } = this;

    const at = (x: number, y: number) =>
      x < 0 || x >= width || y < 0 || y >= height
        ? -1
        : below[y * width + x] - firstgid;

    const fill = (x: number, y: number, id: number) => {
      const i = y * width + x;
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      if (below[i] !== 0 || above[i] !== 0) return;

      below[i] = firstgid + id;
    };

    const swap = (x: number, y: number, from: number, id: number) => {
      if (at(x, y) === from) below[y * width + x] = firstgid + id;
    };

    for (let y = 2; y < height - 2; y++)
      for (let x = 1; x < width - 1; x++) {
        const end = at(x, y);
        if (end !== END_RIGHT && end !== END_LEFT) continue;

        const left = end === END_RIGHT;
        const hx = left ? x + 1 : x - 1;
        const rise = at(hx, y - 1) === TOP ? 1 : at(hx, y - 2) === TOP ? 2 : 0;
        if (!rise) continue;

        const anchor = (left ? STEP_LEFT : STEP_RIGHT)[rise - 1];
        const corner = left ? VOID_LEFT : VOID_RIGHT;

        for (let r = 0; r < 3; r++)
          below[(y + r) * width + x] = firstgid + anchor + r * columns;

        fill(x, y - rise, corner);
        if (rise === 2) fill(x, y - 1, anchor - columns);

        if (left) {
          swap(hx, y - rise, TOP, corner + 1);
          swap(hx, y - rise + 1, MID, anchor + 1 - (rise - 1) * columns);
          swap(hx, y - rise + 2, BOTTOM, anchor + 1 + (2 - rise) * columns);
        } else if (rise === 2) {
          swap(hx, y - 1, MID, anchor - 1 - columns);
          swap(hx, y, BOTTOM, anchor - 1);
        }
      }
  }

  private _place(
    terrain: TerrainName[],
    tileset: string,
    firstgid: number,
    below: number[],
    above: number[],
    y: number,
    pass: "corners" | "faces" | "sides",
  ) {
    const columns = this.loader.load(tileset).columns;

    for (let x = 0; x < this.width; x++) {
      const i = handlers.generation.toIndex(x, y, this.width);
      const cell = terrain[i];

      if (cell !== TerrainName.VOID && cell !== TerrainName.WALL_BASE)
        continue;
      if (pass !== "corners") {
        if (below[i] !== 0 || above[i] !== 0) continue;
        if ((pass === "faces") !== (cell === TerrainName.WALL_BASE)) continue;
      }

      const match = this._classify(terrain, cell, x, y);
      if (!match) continue;

      const isCorner =
        match.position !== BorderPosition.TOP &&
        match.position !== BorderPosition.BOTTOM &&
        match.position !== BorderPosition.LEFT &&
        match.position !== BorderPosition.RIGHT;

      if ((pass === "corners") !== isCorner) continue;

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

    const fl = (t: TerrainName | null) =>
      t !== null &&
      t !== TerrainName.VOID &&
      t !== TerrainName.WALL_BASE &&
      t !== TerrainName.WALL_MID &&
      t !== TerrainName.WALL_TOP;

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
