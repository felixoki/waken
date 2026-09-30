import { handlers } from "../../handlers";
import { CONTOUR_GONE, CONTOUR_REACH } from "../../globals";
import {
  BiomeConfig,
  Entity,
  Summit,
  TerraceConfig,
  TerrainName,
} from "../../types/generation";

export class TerraceGenerator {
  private config: BiomeConfig;
  private rng: () => number;

  constructor(config: BiomeConfig, seed: string) {
    this.config = config;
    this.rng = handlers.generation.seededRandom(
      handlers.generation.hash(`${seed}-terraces`),
    );
  }

  generate(): {
    terrain: TerrainName[];
    elevation: Uint8Array;
    entities: Entity[];
  } {
    const { width, height, terraces } = this.config;
    const terrain: TerrainName[] = new Array(width * height).fill(
      TerrainName.GRASS,
    );
    const elevation = new Uint8Array(width * height);

    if (!terraces) return { terrain, elevation, entities: [] };

    const tops = this.contours(this.field(terraces), terraces);

    for (let level = 1; level <= tops.length; level++) {
      const top = tops[level - 1];
      const material =
        level > terraces.earth ? TerrainName.SNOW : TerrainName.EARTH;

      for (let x = 0; x < width; x++)
        for (let y = 0; y < top[x]; y++) {
          const idx = y * width + x;
          elevation[idx] = level;
          terrain[idx] = material;
        }
    }

    return { terrain, elevation, entities: [] };
  }

  private uniform(min: number, max: number): number {
    return min + this.rng() * (max - min);
  }

  private randint(min: number, max: number): number {
    return min + Math.floor(this.rng() * (max - min + 1));
  }

  private sign(): number {
    return this.rng() < 0.5 ? -1 : 1;
  }

  private field(t: TerraceConfig): Float64Array {
    const { width: w, height: h } = this.config;
    const levels = t.earth + t.snow;
    const depth = h - t.foot;
    const slope = levels / depth;
    const peak = levels + t.summit * slope + 0.7;
    const tau = Math.PI * 2;

    const summits: Summit[] = [];
    const count = this.randint(3, 5);

    for (let i = 0; i < count; i++) {
      const rx = this.uniform(0.2, 0.34) * w;
      const lo = rx * 0.75;
      const hi = w - 1 - rx * 0.75;
      const band = (hi - lo) / count;

      summits.push({
        x: this.uniform(lo + band * i, lo + band * (i + 1)),
        y:
          i === 0
            ? this.uniform(-0.05, -0.01) * depth
            : this.uniform(-0.34, -0.02) * depth,
        height: peak * (i === 0 ? 1 : this.uniform(0.78, 0.97)),
        rx,
        ry: this.uniform(0.95, 1.25) * depth,
      });
    }

    const fit = { height: 1, reach: 1 };
    const crest = t.ridge + 0.6;
    const reach = (0.75 * depth) / (1 - 1 / crest);
    const ridgeAt = (y: number) => Math.max(0, crest * (1 - y / reach));

    const baseAt = (x: number, y: number): number => {
      let best = ridgeAt(y);

      for (const s of summits) {
        const d = Math.hypot(
          (x - s.x) / (s.rx * fit.reach),
          (y - s.y) / (s.ry * fit.reach),
        );
        const v = s.height * fit.height * (1 - d ** t.dome);
        if (v > best) best = v;
      }

      return best;
    };

    const outline = Array.from({ length: 3 }, () => ({
      amp: this.uniform(4, 13),
      length: this.uniform(70, 300),
      phase: this.uniform(0, 6.3),
    }));

    const octaves: { value: number; length: number }[] = [];
    for (let length = 11, i = 0; i < 5; i++, length *= 1.75)
      octaves.push({ value: length ** 0.75, length });

    const total = octaves.reduce((sum, o) => sum + o.value, 0);
    const ripple = octaves.map((o) => ({
      amp: (t.rough * o.value) / total,
      length: o.length,
      phase: this.uniform(0, 6.3),
    }));

    const rippleAt = (x: number): number => {
      let fast = 0;
      for (const r of ripple)
        fast += r.amp * Math.sin((tau * x) / r.length + r.phase);

      return fast;
    };

    const edgeNoise = (x: number): number => {
      let slow = 0;
      for (const o of outline) slow += o.amp * Math.sin(x / o.length + o.phase);

      return slow * slope + rippleAt(x);
    };

    const waves: {
      amp: number;
      lx: number;
      ly: number;
      phase: number;
      sign: number;
    }[] = [];

    for (let i = 0; i < 2; i++) {
      const mu = this.uniform(150, 420);
      waves.push({
        amp: this.uniform(0.1, 0.15) * mu * slope,
        lx: this.uniform(180, 700),
        ly: mu,
        phase: this.uniform(0, 6.3),
        sign: this.sign(),
      });
    }

    for (let i = 0; i < 3; i++) {
      const mu = this.uniform(12, 34);
      waves.push({
        amp: this.uniform(0.2, 0.28) * mu * slope,
        lx: this.uniform(60, 240),
        ly: mu,
        phase: this.uniform(0, 6.3),
        sign: this.sign(),
      });
    }

    const scarps = Array.from({ length: t.scarps }, () => ({
      x: this.uniform(w * 0.12, w * 0.88),
      half: this.uniform(26, 70),
      y: this.uniform(0.18, 0.8) * depth,
      amp: this.uniform(1.15, 1.55),
    }));

    const blobs: { x: number; y: number; sx: number; sy: number; amp: number }[] =
      [];

    const density = w / 800;
    const scaled = (min: number, max: number) =>
      Math.max(1, Math.round(this.randint(min, max) * density));

    for (let i = scaled(24, 34); i > 0; i--) {
      const sy = this.uniform(45, 95);
      blobs.push({
        x: this.uniform(w * 0.04, w * 0.96),
        y: this.uniform(-20, depth),
        sx: this.uniform(70, 280),
        sy,
        amp: this.sign() * 0.02 * sy,
      });
    }

    for (let i = scaled(40, 65); i > 0; i--) {
      const sy = this.uniform(16, 42);
      blobs.push({
        x: this.uniform(w * 0.04, w * 0.96),
        y: this.uniform(-20, depth),
        sx: this.uniform(48, 150),
        sy,
        amp: this.sign() * 0.026 * sy,
      });
    }

    const noiseX = Array.from({ length: w }, (_, x) => edgeNoise(x));
    const rippleX = Array.from({ length: w }, (_, x) => rippleAt(x));

    const make = (): Float64Array => {
      const field = new Float64Array(w * h);
      const local = new Float64Array(w * h);

      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const b = baseAt(x, y);

          field[i] = b + noiseX[x];
          if (b < 0.35) field[i] = Math.min(field[i], 0.95);
          local[i] = Math.min(1, Math.max(0, b / peak)) ** 0.6;
        }

      for (const wave of waves) {
        const sx = noiseX.map((_, x) => Math.sin(x / wave.lx + wave.phase));
        const cx = noiseX.map((_, x) => Math.cos(x / wave.lx + wave.phase));

        for (let y = 0; y < h; y++) {
          const sy = Math.sin((wave.sign * y) / wave.ly);
          const cy = Math.cos((wave.sign * y) / wave.ly);

          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            field[i] += local[i] * wave.amp * (sx[x] * cy + cx[x] * sy);
          }
        }
      }

      for (const scarp of scarps) {
        const x0 = Math.max(0, Math.floor(scarp.x - scarp.half));
        const x1 = Math.min(w, Math.floor(scarp.x + scarp.half) + 1);

        for (let y = 0; y < h; y++) {
          const drop = scarp.amp / (1 + Math.exp(-(y - scarp.y) / 0.7));

          for (let x = x0; x < x1; x++) {
            const taper =
              0.5 * (1 + Math.cos((Math.PI * (x - scarp.x)) / scarp.half));
            const i = y * w + x;
            field[i] -= drop * taper * local[i];
          }
        }
      }

      for (const blob of blobs) {
        const x0 = Math.max(0, Math.floor(blob.x - 3 * blob.sx));
        const x1 = Math.min(w, Math.floor(blob.x + 3 * blob.sx) + 1);
        const y0 = Math.max(0, Math.floor(blob.y - 3 * blob.sy));
        const y1 = Math.min(h, Math.floor(blob.y + 3 * blob.sy) + 1);

        for (let y = y0; y < y1; y++) {
          const fy = ((y - blob.y) / blob.sy) ** 2;

          for (let x = x0; x < x1; x++) {
            const i = y * w + x;
            const fx = ((x - blob.x) / blob.sx) ** 2;
            field[i] += local[i] * blob.amp * Math.exp(-0.5 * (fx + fy));
          }
        }
      }

      for (let y = 0; y < h; y++) {
        const floor = ridgeAt(y) / 2;
        if (floor <= 0) break;

        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          field[i] = Math.max(field[i], floor + rippleX[x]);
        }
      }

      const minDrop = slope * 0.3;

      for (let x = 0; x < w; x++)
        for (let y = 1; y < h; y++) {
          const ceiling = field[(y - 1) * w + x] - minDrop;
          if (field[y * w + x] > ceiling) field[y * w + x] = ceiling;
        }

      return field;
    };

    const want = levels + t.summit * slope;

    let field = make();

    for (let attempt = 0; attempt < 8; attempt++) {
      if (attempt) field = make();

      let highest = -Infinity;
      let foot = 0;

      for (let x = 0; x < w; x++) {
        highest = Math.max(highest, field[x]);

        let y = 0;
        while (y < h && field[y * w + x] >= 1) y++;
        foot = Math.max(foot, y);
      }

      if (Math.abs(highest - want) < 0.12 && 0.85 * depth <= foot && foot <= depth)
        break;

      if (highest > 0.5)
        fit.height *= Math.min(1.4, Math.max(0.7, want / highest));

      if (foot > depth) fit.reach *= Math.max(0.8, depth / foot);
      else if (foot < 0.85 * depth) {
        const grow = Math.min(1.25, (0.95 * depth) / Math.max(foot, 1));
        fit.reach *= grow;
      }
    }

    return field;
  }

  private below(lower: number[], gap: number): (x: number) => number {
    return (x) => {
      let top = lower[x];

      for (let dx = -CONTOUR_REACH; dx <= CONTOUR_REACH; dx++)
        top = Math.min(top, lower[x + dx] ?? top);

      return top - gap;
    };
  }

  private contours(field: Float64Array, t: TerraceConfig): number[][] {
    const { width: w, height: h } = this.config;
    const { contours } = handlers.generation;
    const levels = t.earth + t.snow;
    const depth = h - t.foot;
    const tops: number[][] = [];

    for (let level = 1; level <= levels; level++) {
      const previous = tops[tops.length - 1];
      const limit = previous ? this.below(previous, t.gap) : () => depth;

      let row: number[] = [];

      for (let x = 0; x < w; x++) {
        let y = 0;
        while (y < h && field[y * w + x] >= level) y++;

        const top = y > 0 ? Math.min(y, limit(x)) : CONTOUR_GONE;
        row.push(top >= 1 ? top : CONTOUR_GONE);
      }

      row = contours.deneedle(row, limit);
      row = contours.fillGaps(row, limit);
      row = contours.smooth(row, limit);
      row = contours.treads(row, t.tread);

      if (level > t.earth) {
        for (let pass = 0; pass < 3; pass++) {
          row = contours.despike(row, limit);
          row = contours.smooth(row, limit);
        }

        row = contours.bridge(row, limit);
        row = contours.smooth(row, limit);
        row = contours.treads(row, t.tread);

        for (let pass = 0; pass < 3; pass++) {
          row = contours.despike(row, limit);
          row = contours.smooth(row, limit);
        }
      }

      tops.push(row.map((v) => (v >= 1 ? v : CONTOUR_GONE)));
    }

    return tops;
  }
}
