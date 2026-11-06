import { handlers } from "../../handlers";
import {
  MARSH_ATTEMPTS,
  MARSH_BEND,
  MARSH_EDGE,
  MARSH_GAP,
  MARSH_HUMMOCK_RADIUS,
  MARSH_HUMMOCKS,
  MARSH_LEAST_LAND,
  MARSH_LENGTH,
  MARSH_LINKS,
  MARSH_NECK,
  MARSH_OPEN,
  MARSH_PACE,
  MARSH_RADIUS,
  MARSH_SPACING,
  MARSH_WATER,
} from "../../globals";
import { TerrainName } from "../../types/generation";

const SIDES = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];
const AROUND = [...SIDES, [-1, -1], [1, -1], [-1, 1], [1, 1]];
const WAVES = [
  [0.07, 1],
  [0.16, 0.6],
  [0.33, 0.3],
];

export class MarshGenerator {
  private width: number;
  private height: number;
  private top: number;
  private random: () => number;
  private reserved!: Uint8Array;

  constructor(width: number, height: number, top: number, seed: string) {
    this.width = width;
    this.height = height - top;
    this.top = top;
    this.random = handlers.generation.seededRandom(
      handlers.generation.hash(`${seed}-marsh`),
    );
  }

  generate(grid: TerrainName[]): Uint8Array {
    const { width, height, top } = this;
    const size = width * height;
    const river = new Uint8Array(size);
    for (let i = 0; i < size; i++)
      if (grid[top * width + i] === TerrainName.WATER) river[i] = 1;

    const shore = this.edge();
    this.reserved = this.hummocks(shore);

    const water = new Uint8Array(size);
    const halo = new Uint8Array(size);
    const forbidden = (i: number) =>
      this.reserved[i] || Math.floor(i / width) < shore[i % width];
    for (const i of this.around(this.cells(river), MARSH_SPACING)) halo[i] = 1;

    const target = MARSH_WATER * size;
    const mark = new Int32Array(size);
    let count = 0;

    for (let attempt = 1; attempt <= MARSH_ATTEMPTS && count < target; attempt++) {
      const piece = this.creek(
        this.uniform(-2, width + 2),
        this.uniform(-2, height + 2),
        this.uniform(0, Math.PI * 2),
        MARSH_LENGTH[0] + Math.floor(this.random() * (MARSH_LENGTH[1] - MARSH_LENGTH[0] + 1)),
        this.uniform(MARSH_RADIUS[0], MARSH_RADIUS[1]),
        mark,
        attempt,
      );
      if (!piece.length || piece.some((i) => halo[i] || forbidden(i))) continue;

      for (const i of piece) {
        if (!water[i]) count++;
        water[i] = 1;
      }
      for (const i of this.around(piece, MARSH_SPACING)) halo[i] = 1;
    }

    const opened = this.opening(water);
    for (let i = 0; i < size; i++) water[i] = opened[i] || river[i];
    this.necks(water);
    this.settle(water, river);

    const marsh = new Uint8Array(grid.length);
    for (let i = 0; i < size; i++) {
      const g = top * width + i;
      if (water[i]) {
        grid[g] = TerrainName.WATER;
        if (!river[i]) marsh[g] = 1;
      } else if (grid[g] === TerrainName.WATER) grid[g] = TerrainName.GROUND;
    }

    return marsh;
  }

  private edge(): number[] {
    const [lo, hi] = MARSH_EDGE;
    const wave = this.wave();
    return Array.from({ length: this.width }, (_, x) =>
      Math.round(lo + (hi - lo) * (0.5 + 0.5 * wave(x * 0.6))),
    );
  }

  private hummocks(shore: number[]): Uint8Array {
    const { width, height } = this;
    const reserved = new Uint8Array(width * height);
    const placed: { x: number; y: number; r: number }[] = [];

    for (let tries = 0; placed.length < MARSH_HUMMOCKS && tries < 400; tries++) {
      const r = this.uniform(MARSH_HUMMOCK_RADIUS[0], MARSH_HUMMOCK_RADIUS[1]);
      const x = this.uniform(r + 4, width - r - 4);
      const y = this.uniform(Math.max(shore[Math.floor(x)] + r + 6, placed.length ? 0 : height / 2), height - r - 4);
      if (y >= height - r - 4) continue;
      if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < (p.r + r) * 2)) continue;

      placed.push({ x, y, r });
      for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++)
        for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++)
          if (this.inside(xx, yy) && Math.hypot(xx + 0.5 - x, yy + 0.5 - y) <= r)
            reserved[yy * width + xx] = 1;
    }

    return reserved;
  }

  private creek(
    x: number,
    y: number,
    heading: number,
    length: number,
    radius: number,
    mark: Int32Array,
    id: number,
  ): number[] {
    const { width, height } = this;
    const bend = this.wave();
    const swell = this.wave();
    const cells: number[] = [];

    for (let step = 0; step < length; step++) {
      const a = heading + bend(step * MARSH_PACE) * MARSH_BEND;
      x += Math.cos(a);
      y += Math.sin(a);
      if (x < -2 || x >= width + 2 || y < -2 || y >= height + 2) break;

      const r = radius + swell(step) * 0.45;
      for (let yy = Math.floor(y - r) - 1; yy <= Math.floor(y + r) + 1; yy++)
        for (let xx = Math.floor(x - r) - 1; xx <= Math.floor(x + r) + 1; xx++) {
          if (!this.inside(xx, yy)) continue;
          if ((xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2 > r * r) continue;

          const i = yy * width + xx;
          if (mark[i] === id) continue;

          mark[i] = id;
          cells.push(i);
        }
    }

    return cells;
  }

  private opening(water: Uint8Array): Uint8Array {
    const land: number[] = [];
    for (let i = 0; i < water.length; i++) if (!water[i]) land.push(i);

    const depth = this.distance(land, () => true, 99, AROUND);
    const core: number[] = [];
    for (let i = 0; i < water.length; i++)
      if (water[i] && (depth.get(i) ?? 99) > MARSH_OPEN) core.push(i);

    const opened = new Uint8Array(water.length);
    for (const i of this.distance(core, (n) => !!water[n], Math.ceil(MARSH_OPEN), AROUND).keys())
      opened[i] = 1;

    return opened;
  }

  private necks(water: Uint8Array) {
    const { width } = this;
    const bodies = this.components(water);
    const edges = bodies.map((cells) => {
      const set = new Set(cells);
      const edge: [number, number][] = [];
      for (const i of cells) {
        const x = i % width;
        const y = (i - x) / width;
        if (SIDES.some(([dx, dy]) => this.inside(x + dx, y + dy) && !set.has((y + dy) * width + x + dx)))
          edge.push([x, y]);
      }
      return edge.filter((_, k) => k % 2 === 0);
    });
    const boxes = edges.map((edge) =>
      edge.reduce(
        (b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)],
        [Infinity, Infinity, -Infinity, -Infinity],
      ),
    );

    for (let a = 0; a < edges.length; a++)
      for (let b = a + 1; b < edges.length; b++) {
        const [ax0, ay0, ax1, ay1] = boxes[a];
        const [bx0, by0, bx1, by1] = boxes[b];
        if (bx0 > ax1 + MARSH_GAP || ax0 > bx1 + MARSH_GAP || by0 > ay1 + MARSH_GAP || ay0 > by1 + MARSH_GAP)
          continue;

        let best: [number, number, number, number, number] | null = null;
        for (const [ax, ay] of edges[a])
          for (const [bx, by] of edges[b]) {
            const d = Math.hypot(ax - bx, ay - by);
            if (d <= MARSH_GAP && (!best || d < best[0])) best = [d, ax, ay, bx, by];
          }
        if (!best || this.random() > MARSH_LINKS) continue;

        const [d, ax, ay, bx, by] = best;
        const steps = Math.max(1, Math.floor(d * 2));
        const cells: number[] = [];
        for (let k = 0; k <= steps; k++) {
          const t = k / steps;
          cells.push(...this.disc(ax + (bx - ax) * t + 0.5, ay + (by - ay) * t + 0.5, MARSH_NECK));
        }
        if (cells.some((i) => this.reserved[i])) continue;
        for (const i of cells) water[i] = 1;
      }
  }

  private settle(water: Uint8Array, river: Uint8Array) {
    const size = water.length;

    for (let pass = 0; pass < 20; pass++) {
      for (
        let thin = this.thin(water, true).filter((i) => !river[i]);
        thin.length;
        thin = this.thin(water, true).filter((i) => !river[i])
      )
        for (const i of thin) water[i] = 0;

      const land = new Uint8Array(size);
      for (let i = 0; i < size; i++) land[i] = water[i] ? 0 : 1;

      const spurs = this.thin(land, false).filter((i) => !this.reserved[i]);
      for (const cells of this.components(land))
        if (cells.length < MARSH_LEAST_LAND && !cells.some((i) => i < this.width))
          spurs.push(...cells);
      if (!spurs.length) return;

      for (const i of spurs) water[i] = 1;
    }
  }

  private thin(mask: Uint8Array, wet: boolean): number[] {
    const { width } = this;
    const has = (x: number, y: number) => {
      if (y < 0) return !wet;
      if (!this.inside(x, y)) return true;
      return !!mask[y * width + x];
    };
    const out: number[] = [];

    for (let i = 0; i < mask.length; i++) {
      if (!mask[i]) continue;

      const x = i % width;
      const y = (i - x) / width;
      if ((!has(x, y - 1) && !has(x, y + 1)) || (!has(x - 1, y) && !has(x + 1, y))) out.push(i);
    }

    return out;
  }

  private components(mask: Uint8Array): number[][] {
    const { width } = this;
    const seen = new Uint8Array(mask.length);
    const out: number[][] = [];

    for (let start = 0; start < mask.length; start++) {
      if (!mask[start] || seen[start]) continue;

      const cells = [start];
      seen[start] = 1;
      for (let q = 0; q < cells.length; q++) {
        const x = cells[q] % width;
        const y = (cells[q] - x) / width;
        for (const [dx, dy] of SIDES) {
          if (!this.inside(x + dx, y + dy)) continue;

          const n = (y + dy) * width + x + dx;
          if (!mask[n] || seen[n]) continue;

          seen[n] = 1;
          cells.push(n);
        }
      }
      out.push(cells);
    }

    return out;
  }

  private around(seeds: number[], reach: number): number[] {
    return [...this.distance(seeds, () => true, reach, AROUND).keys()];
  }

  private distance(
    seeds: number[],
    open: (i: number) => boolean,
    limit: number,
    steps: number[][],
  ): Map<number, number> {
    const { width } = this;
    const dist = new Map<number, number>();
    for (const i of seeds) dist.set(i, 0);

    const queue = [...seeds];
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q];
      const d = dist.get(i)!;
      if (d >= limit) continue;

      const x = i % width;
      const y = (i - x) / width;
      for (const [dx, dy] of steps) {
        if (!this.inside(x + dx, y + dy)) continue;

        const n = (y + dy) * width + x + dx;
        if (dist.has(n) || !open(n)) continue;

        dist.set(n, d + 1);
        queue.push(n);
      }
    }

    return dist;
  }

  private disc(cx: number, cy: number, r: number): number[] {
    const cells: number[] = [];
    for (let y = Math.floor(cy - r) - 1; y <= Math.floor(cy + r) + 1; y++)
      for (let x = Math.floor(cx - r) - 1; x <= Math.floor(cx + r) + 1; x++)
        if (this.inside(x, y) && (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r)
          cells.push(y * this.width + x);
    return cells;
  }

  private cells(mask: Uint8Array): number[] {
    const out: number[] = [];
    for (let i = 0; i < mask.length; i++) if (mask[i]) out.push(i);
    return out;
  }

  private wave(): (t: number) => number {
    const waves = WAVES.map(([f, a]) => [this.uniform(0.6, 1.6) * f, this.uniform(0, Math.PI * 2), a]);
    return (t: number) => waves.reduce((s, [f, p, a]) => s + a * Math.sin(f * t + p), 0) / 1.9;
  }

  private inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  private uniform(a: number, b: number): number {
    return a + (b - a) * this.random();
  }
}
