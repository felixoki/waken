import { handlers } from "../../handlers";
import { CONTOUR_GONE, STAIR_SPACING } from "../../globals";
import { TilesetLoader } from "../../loaders/Tileset";
import {
  BiomeConfig,
  FacePiece,
  FacePosition,
  TerrainName,
  TileRole,
} from "../../types/generation";

type Put = (x: number, y: number, piece: FacePiece) => void;
type Side = FacePosition.EAST | FacePosition.WEST;

export class FaceGenerator {
  private config: BiomeConfig;
  private loader: TilesetLoader;
  private firstgid: (tileset: string) => number;
  private seed: string;
  private pieces = new Map<string, FacePiece>();

  constructor(
    config: BiomeConfig,
    loader: TilesetLoader,
    firstgid: (tileset: string) => number,
    seed: string,
  ) {
    this.config = config;
    this.loader = loader;
    this.firstgid = firstgid;
    this.seed = seed;
  }

  generate(elevation: Uint8Array): {
    data: number[];
    stairs: number[];
    under: Map<number, TerrainName>;
  } {
    const { width: w, height: h, terraces } = this.config;
    const data = new Array(w * h).fill(0);
    const stairs = new Array(w * h).fill(0);
    const under = new Map<number, TerrainName>();

    if (!terraces) return { data, stairs, under };

    const levels = terraces.earth + terraces.snow;
    const tops = this.tops(elevation, levels);

    const put: Put = (x, y, piece) => {
      if (x < 0 || x >= w) return;

      for (let k = 0; k < piece.height; k++) {
        const row = y - piece.anchor + k;
        if (row >= 0 && row < h) data[row * w + x] = piece.gid + k * piece.columns;
      }
    };

    const bare = (x: number, y: number) => {
      if (y >= 0 && y < h) under.set(y * w + x, TerrainName.EARTH);
    };

    for (let level = 1; level <= levels; level++) {
      const t = tops[level - 1];
      const snow = level > terraces.earth;
      const lower =
        level > terraces.earth + 1
          ? TerrainName.SNOW
          : level > 1
            ? TerrainName.EARTH
            : TerrainName.GRASS;

      for (let x = 0; x < w; x++) {
        const c = t[x];
        const tl = x > 0 ? t[x - 1] : c;
        const tr = x < w - 1 ? t[x + 1] : c;

        if (snow)
          this.snow(x, c, tl, tr, lower, put, (y) =>
            level === terraces.earth + 1 ? bare(x, y) : undefined,
          );
        else {
          this.earth(x, c, tl, tr, lower, put);
          if (lower === TerrainName.GRASS && c > CONTOUR_GONE) bare(x, c);
        }
      }
    }

    this.stairs(tops, data, stairs);

    return { data, stairs, under };
  }

  private stairs(tops: number[][], data: number[], stairs: number[]): void {
    const { width: w, height: h, terraces } = this.config;
    if (!terraces) return;

    const { every, tilesets } = terraces.stairs;
    const levels = terraces.earth + terraces.snow;
    const rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${this.seed}-stairs`),
    );

    const flat = (t: number[], x: number, from: number, to: number) => {
      for (let d = from; d <= to; d++) if (t[x + d] !== t[x]) return false;
      return true;
    };


    const spots: [number, number][] = [];

    for (let level = 1; level <= levels; level++) {
      const t = tops[level - 1];
      let start = -1;
      let wide: number[] = [];
      let narrow: number[] = [];

      const close = (end: number) => {
        for (let from = start; start >= 0 && from <= end; from += every) {
          const within = (x: number) => x >= from && x < from + every;
          const best = wide.filter(within);
          const pick = best.length ? best : narrow.filter(within);

          if (pick.length) spots.push([level, pick[Math.floor(rng() * pick.length)]]);
        }

        start = -1;
        wide = [];
        narrow = [];
      };

      for (let x = 0; x < w; x++) {
        const c = t[x];

        if (c <= CONTOUR_GONE) {
          close(x - 1);
          continue;
        }

        if (start < 0) start = x;
        if (x < 1 || x > w - 3 || c + 2 >= h) continue;

        if (x >= 3 && x <= w - 4 && flat(t, x, -2, 3)) wide.push(x);
        else if (flat(t, x, -1, 2)) narrow.push(x);
      }

      close(w - 1);
    }

    const stamps = new Map<string, number[][]>();

    const stamp = (upper: TerrainName, over: TerrainName): number[][] => {
      const key = `${upper}:${over}`;
      const cached = stamps.get(key);
      if (cached) return cached;

      for (const tileset of tilesets) {
        const built = this.stamp(tileset, upper, over);
        if (!built) continue;

        stamps.set(key, built);
        return built;
      }

      throw new Error(`No ${upper} stair over ${over} in ${tilesets.join(", ")}`);
    };

    const placed: [number, number][] = [];

    const place = (level: number, x: number) => {
      if (placed.some(([l, px]) => l === level && Math.abs(px - x) < STAIR_SPACING))
        return;

      const c = tops[level - 1][x];
      const rows = stamp(
        level > terraces.earth ? TerrainName.SNOW : TerrainName.EARTH,
        level > terraces.earth + 1
          ? TerrainName.SNOW
          : level > 1
            ? TerrainName.EARTH
            : TerrainName.GRASS,
      );

      for (let dy = 0; dy < rows.length; dy++)
        for (let dx = 0; dx < 2; dx++) {
          const i = (c + dy) * w + x + dx;
          data[i] = 0;
          stairs[i] = rows[dy][dx];
        }

      placed.push([level, x]);
    };

    for (const [level, x] of spots) place(level, x);
  }

  private stamp(
    tileset: string,
    upper: TerrainName,
    over: TerrainName,
  ): number[][] | null {
    const gid = this.firstgid(tileset);
    const rows = [
      [FacePosition.TOP_LEFT, FacePosition.TOP_RIGHT],
      [FacePosition.LEFT, FacePosition.RIGHT],
      [FacePosition.BOTTOM_LEFT, FacePosition.BOTTOM_RIGHT],
    ];

    const built: number[][] = [];

    for (const row of rows) {
      const entries = row.map((position) =>
        this.loader.queryOne(
          tileset,
          { role: TileRole.STAIR, position, terrain: upper, over },
          0,
        ),
      );

      if (entries.some((entry) => !entry)) break;
      built.push(entries.map((entry) => gid + entry!.id));
    }

    return built.length >= 2 ? built : null;
  }

  private tops(elevation: Uint8Array, levels: number): number[][] {
    const { width: w, height: h } = this.config;
    const tops: number[][] = [];

    for (let level = 1; level <= levels; level++) {
      const row: number[] = [];

      for (let x = 0; x < w; x++) {
        let y = 0;
        while (y < h && elevation[y * w + x] >= level) y++;
        row.push(y > 0 ? y : CONTOUR_GONE);
      }

      tops.push(row);
    }

    return tops;
  }

  private earth(
    x: number,
    c: number,
    tl: number,
    tr: number,
    lower: TerrainName,
    put: Put,
  ): void {
    const piece = (role: TileRole, position: FacePosition, over?: TerrainName) =>
      this.piece(TerrainName.EARTH, role, position, over);

    if (c > CONTOUR_GONE) {
      const rim =
        tl > c ? FacePosition.LEFT : tr > c ? FacePosition.RIGHT : FacePosition.FLAT;
      put(x, c, piece(TileRole.RIM, rim));

      const base =
        tl === c + 1
          ? FacePosition.JUNCTION_LEFT
          : tl > c
            ? FacePosition.INNER_WEST
            : tr === c + 1
              ? FacePosition.JUNCTION_RIGHT
              : tr > c
                ? FacePosition.INNER_EAST
                : FacePosition.FLAT;
      put(x, c + 1, piece(TileRole.BASE, base, lower));
    }

    const risers: [Side, number][] = [
      [FacePosition.EAST, tl],
      [FacePosition.WEST, tr],
    ];

    for (const [side, n] of risers) {
      if (n <= c) continue;

      const cap =
        side === FacePosition.EAST ? FacePosition.CAP_RIGHT : FacePosition.CAP_LEFT;

      for (let y = Math.max(0, c + 2); y < n; y++)
        put(x, y, piece(TileRole.CRACK, side));

      if (n > c + 1) put(x, n, piece(TileRole.RIM, cap));
      put(x, n + 1, piece(TileRole.BASE, cap, lower));
    }
  }

  private snow(
    x: number,
    c: number,
    tl: number,
    tr: number,
    lower: TerrainName,
    put: Put,
    bare: (y: number) => void,
  ): void {
    const piece = (role: TileRole, position: FacePosition, over?: TerrainName) =>
      this.piece(TerrainName.SNOW, role, position, over);

    if (c > CONTOUR_GONE) {
      if (tl <= c - 2 || tr <= c - 2) {
        const side = tl <= c - 2 ? FacePosition.WEST : FacePosition.EAST;
        const n = side === FacePosition.WEST ? tl : tr;
        const top = Math.max(0, n);

        put(x, c, piece(TileRole.END, side, lower));

        for (let y = top; y < c; y++) {
          put(
            x,
            y,
            y === top
              ? piece(TileRole.CORNER, side)
              : piece(TileRole.WALL, side, lower),
          );
          bare(y);
        }
      } else if (tr === c - 1 || tl === c - 1) {
        const face = tr === c - 1 ? FacePosition.UP_RIGHT : FacePosition.UP_LEFT;
        put(x, c, piece(TileRole.FACE, face, lower));
        bare(c - 1);
      } else put(x, c, piece(TileRole.FACE, FacePosition.FLAT, lower));

      bare(c);
      bare(c + 1);
    }

    const risers: [Side, number][] = [
      [FacePosition.EAST, tl],
      [FacePosition.WEST, tr],
    ];

    for (const [side, n] of risers) {
      if (n < c + 2) continue;

      for (let y = Math.max(0, c + 2); y < n; y++)
        put(x, y, piece(TileRole.WALL_SHADOW, side, lower));

      put(x, n, piece(TileRole.END_SHADOW, side, lower));
    }
  }

  private piece(
    material: TerrainName,
    role: TileRole,
    position: FacePosition,
    over?: TerrainName,
  ): FacePiece {
    const key = `${material}:${role}:${position}:${over ?? ""}`;
    const cached = this.pieces.get(key);
    if (cached) return cached;

    const tileset = this.config.layers.find((l) => l.terrain === material)?.tileset;
    if (!tileset) throw new Error(`No ${material} layer in ${this.config.id}`);

    const entry = this.loader.queryOne(tileset, { role, position, over }, 0);
    if (!entry)
      throw new Error(
        `No ${role}/${position}${over ? ` over ${over}` : ""} tile in ${tileset}`,
      );

    const props = handlers.generation.parseProperties(entry.properties);
    const piece: FacePiece = {
      gid: this.firstgid(tileset) + entry.id,
      columns: this.loader.load(tileset).columns,
      height: props.height ?? 1,
      anchor: props.anchor_y ?? 0,
    };

    this.pieces.set(key, piece);
    return piece;
  }
}
