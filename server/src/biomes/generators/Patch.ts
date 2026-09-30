import { handlers } from "../../handlers";
import { PATCH_GAP, PATCH_MAX_HOLE, PATCH_MIN_SIZE } from "../../globals";
import { TilesetLoader } from "../../loaders/Tileset";
import { BiomeConfig, TerrainName } from "../../types/generation";
import { BorderGenerator } from "./Border";

export class PatchGenerator {
  private config: BiomeConfig;
  private loader: TilesetLoader;
  private firstgid: (tileset: string) => number;
  private rng: () => number;

  constructor(
    config: BiomeConfig,
    loader: TilesetLoader,
    firstgid: (tileset: string) => number,
    seed: string,
  ) {
    this.config = config;
    this.loader = loader;
    this.firstgid = firstgid;
    this.rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${seed}-patches`),
    );
  }

  generate(
    elevation: Uint8Array,
    ledges: number[],
  ): { grass: number[]; data: number[] } {
    const { width: w, height: h, terraces, layers } = this.config;
    const tileset = layers.find((l) => l.terrain === TerrainName.EARTH)?.tileset;

    if (!terraces || !terraces.patches || !tileset)
      return { grass: [], data: new Array(w * h).fill(0) };

    const eligible = this.eligible(elevation, ledges);
    const area = eligible.reduce((sum, cell) => sum + cell, 0);
    const outline = this.outline(
      eligible,
      Math.round((area * terraces.patches) / 1000),
    );

    const inner = this.drawable(this.interior(outline));
    const grass: number[] = [];
    const terrain: TerrainName[] = new Array(w * h).fill(TerrainName.EARTH);

    for (let i = 0; i < inner.length; i++) {
      if (!inner[i]) continue;

      grass.push(i);
      terrain[i] = TerrainName.GRASS;
    }

    const data = new BorderGenerator({ width: w, height: h }, this.loader).generate(
      terrain,
      { from: TerrainName.GRASS, to: TerrainName.EARTH, tileset },
      this.firstgid(tileset),
    );

    return { grass, data };
  }

  private interior(outline: Uint8Array): Uint8Array {
    const { width: w, height: h } = this.config;
    const inner = new Uint8Array(w * h);

    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let inside = true;

        for (let dy = -1; dy <= 1 && inside; dy++)
          for (let dx = -1; dx <= 1 && inside; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            inside =
              nx >= 0 && ny >= 0 && nx < w && ny < h && outline[ny * w + nx] === 1;
          }

        if (inside) inner[y * w + x] = 1;
      }

    return inner;
  }

  private drawable(inner: Uint8Array): Uint8Array {
    const { width: w, height: h } = this.config;
    const at = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < w && y < h && inner[y * w + x] === 1;

    let changed = true;

    while (changed) {
      changed = false;

      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          if (at(x, y)) continue;

          const n = at(x, y - 1);
          const s = at(x, y + 1);
          const e = at(x + 1, y);
          const west = at(x - 1, y);
          const diagonals: [number, number, boolean][] = [
            [-1, -1, !n && !west],
            [1, -1, !n && !e],
            [-1, 1, !s && !west],
            [1, 1, !s && !e],
          ];
          const corners = diagonals.filter(
            ([dx, dy, free]) => free && at(x + dx, y + dy),
          );

          const sides = +n + +s + +e + +west;
          if (corners.length < 2 && !(corners.length && sides)) continue;

          for (const [dx, dy] of corners) inner[(y + dy) * w + x + dx] = 0;

          changed = true;
        }
    }

    return inner;
  }

  private eligible(elevation: Uint8Array, ledges: number[]): Uint8Array {
    const { width: w, height: h, terraces } = this.config;
    const eligible = new Uint8Array(w * h);

    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const e = elevation[y * w + x];
        if (e < 1 || e > terraces!.earth) continue;

        let clear = true;

        for (let dy = -1; dy <= 1 && clear; dy++)
          for (let dx = -1; dx <= 1 && clear; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h && ledges[ny * w + nx])
              clear = false;
          }

        if (clear) eligible[y * w + x] = 1;
      }

    return eligible;
  }

  private outline(eligible: Uint8Array, count: number): Uint8Array {
    const { width: w, height: h } = this.config;
    const { masks } = handlers.generation;
    const cells: number[] = [];

    for (let i = 0; i < eligible.length; i++) if (eligible[i]) cells.push(i);

    let mask: Uint8Array = new Uint8Array(w * h);
    if (!cells.length) return mask;

    const near = new Uint8Array(w * h);

    const uniform = (min: number, max: number) => min + this.rng() * (max - min);

    for (let n = 0; n < count; n++) {
      const center = cells[Math.floor(this.rng() * cells.length)];
      const cx = center % w;
      const cy = (center / w) | 0;
      const rx = uniform(7, 30);
      const ry = uniform(4.5, 15);
      const harmonics = Array.from({ length: 3 }, () => ({
        amp: uniform(0.1, 0.3),
        k: 2 + Math.floor(this.rng() * 4),
        phase: uniform(0, 6.3),
      }));

      const blob: number[] = [];
      const reachX = Math.floor(rx * 1.5) + 1;
      const reachY = Math.floor(ry * 1.5) + 1;

      for (let dy = -reachY; dy <= reachY; dy++)
        for (let dx = -reachX; dx <= reachX; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= w || y >= h || !eligible[y * w + x]) continue;

          const angle = Math.atan2(dy / ry, dx / rx);
          let edge = 1;
          for (const hm of harmonics) edge += hm.amp * Math.sin(hm.k * angle + hm.phase);

          if ((dx / rx) ** 2 + (dy / ry) ** 2 <= edge * edge && !near[y * w + x])
            blob.push(y * w + x);
        }

      for (const i of blob) {
        mask[i] = 1;

        const x = i % w;
        const y = (i / w) | 0;

        for (let dy = -PATCH_GAP; dy <= PATCH_GAP; dy++)
          for (let dx = -PATCH_GAP; dx <= PATCH_GAP; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h) near[ny * w + nx] = 1;
          }
      }
    }

    for (let round = 0; round < 6; round++) {
      const filled = masks.fillHoles(mask, eligible, w, h, PATCH_MAX_HOLE);
      const eroded = masks.erode(filled, w, h);
      const changed = eroded.some((v, i) => v !== mask[i]);

      mask = eroded;
      if (!changed) break;
    }

    mask = masks.erode(masks.fillHoles(mask, eligible, w, h, PATCH_MAX_HOLE), w, h);
    mask = masks.erode(masks.slivers(mask, w, h, PATCH_MIN_SIZE), w, h);

    return mask;
  }
}
