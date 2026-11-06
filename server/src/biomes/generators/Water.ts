import { configs } from "../../configs";
import { handlers } from "../../handlers";
import {
  MARSH_HERONS,
  MARSH_RING,
  MARSH_RIVER_REACH,
  WATER_BEACH_RING,
  WATER_BED_REACH,
  WATER_CREEK_MIN,
  WATER_CREEK_REEDS,
  WATER_LAKE_RADIUS,
  WATER_LAKES,
  WATER_RIVER_GROW,
  WATER_RIVER_SLOPE,
  WATER_RIVER_WIDTH,
  WATER_RIVERS,
  WATERFALL_LIP,
} from "../../globals";
import { ComponentName, EntityName, FishName, TextureConfig, ZoneName } from "../../types";
import { Entity, TerrainName } from "../../types/generation";
import { MarshGenerator } from "./Marsh";

export type WaterKind = "lake" | "river" | "creek" | "marsh";

export interface WaterBody {
  kind: WaterKind;
  cells: number[];
}

export interface WaterResult {
  bodies: WaterBody[];
  owner: Int16Array;
  bed: Uint8Array;
  dry: Uint8Array;
  hidden: Map<number, number>;
  overhang: Map<number, number>;
  falls: { x: number; y: number; width: number; height: number }[];
}

export interface WaterRelief {
  ledges: number[];
  overlay: number[];
  rock: Uint8Array;
  elevation: Uint8Array;
  ledge: number;
}

interface Fall {
  c: number;
  r: number;
  upper: number;
  lower: number;
  patch: number;
}

interface Lake {
  x: number;
  y: number;
  r: number;
}

interface Point {
  x: number;
  y: number;
  w: number;
}

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const CATTAILS = [
  EntityName.CATTAIL1,
  EntityName.CATTAIL2,
  EntityName.CATTAIL3,
  EntityName.CATTAIL4,
];
const SEDGES = [
  EntityName.SEDGE1,
  EntityName.SEDGE2,
  EntityName.SEDGE3,
  EntityName.SEDGE4,
  EntityName.SEDGE5,
];
const PEBBLES = [
  EntityName.PEBBLE1,
  EntityName.PEBBLE2,
  EntityName.PEBBLE3,
  EntityName.PEBBLE4,
  EntityName.PEBBLE5,
];
const PLANTS = [...CATTAILS, ...CATTAILS, ...CATTAILS, ...SEDGES, ...SEDGES];
const LILIES = [EntityName.WATER_LILY1, EntityName.WATER_LILY2, EntityName.WATER_LILY2];
const BOULDERS = [EntityName.MOSSY_ROCK1, EntityName.MOSSY_ROCK2, EntityName.MOSSY_ROCK3];
const MOSSY = [
  EntityName.MOSSY_ROCK3,
  EntityName.MOSSY_ROCK4,
  EntityName.MOSSY_ROCK5,
  EntityName.MOSSY_ROCK5,
];
const BANK = [
  ...PEBBLES,
  ...PEBBLES,
  EntityName.ROCK13,
  EntityName.ROCK14,
  EntityName.ROCK15,
  EntityName.ROCK16,
  EntityName.ROCK17,
  EntityName.ROCK18,
  EntityName.ROCK19,
  EntityName.ROCK9,
  EntityName.ROCK10,
  EntityName.ROCK12,
];
const SHORE = [
  EntityName.MOSSY_ROCK3,
  EntityName.MOSSY_ROCK4,
  EntityName.MOSSY_ROCK5,
  EntityName.PEBBLE1,
  EntityName.PEBBLE3,
  EntityName.ROCK15,
];
const UNDERS = 3;
const HERONS = [1, 3];
const STRETCH = 24;
const LEAP = 4;
const FISH: Record<Exclude<WaterKind, "creek">, FishName[]> = {
  lake: [FishName.PERCH, FishName.CARP, FishName.PIKE],
  river: [FishName.PERCH, FishName.PIKE],
  marsh: [FishName.TENCH, FishName.PIKE],
};
const RIM = 51;
const BASES = [147, 162];
const FOOTED = [15, 16, 63, 64, 72, 73, 78, 147, 162, 195];
const APPROACH = 6;
const SPRING = 11;
const FOOT = 5;
const STREAM = 3;
const CLEARING = 8;

export class WaterGenerator {
  private width: number;
  private height: number;
  private top: number;
  private seed: string;
  private marsh?: number;
  private marshy!: Uint8Array;
  private random: () => number;
  private relief!: WaterRelief;
  private core!: Uint8Array;
  private dry!: Uint8Array;
  private calm!: Uint8Array;
  private hidden = new Map<number, number>();
  private overhang = new Map<number, number>();
  private falls: WaterResult["falls"] = [];

  constructor(width: number, height: number, top: number, seed: string, marsh?: number) {
    this.width = width;
    this.height = height;
    this.top = top;
    this.seed = seed;
    this.marsh = marsh;
    this.random = handlers.generation.seededRandom(
      handlers.generation.hash(`${seed}-water`),
    );
  }

  generate(grid: TerrainName[], relief: WaterRelief): WaterResult {
    const { ledges } = relief;
    const owner = new Int16Array(this.width * this.height);
    this.relief = relief;
    this.core = new Uint8Array(this.width * this.height);
    this.dry = new Uint8Array(this.width * this.height);
    this.calm = new Uint8Array(this.width * this.height);

    const lakes = this.lakes(grid, owner);
    this.rivers(grid, owner, lakes);
    this.marshy =
      this.marsh === undefined
        ? new Uint8Array(this.width * this.height)
        : new MarshGenerator(this.width, this.height, this.marsh, this.seed).generate(grid);
    this.prune(grid);
    this.smooth(grid, ledges);

    const bodies = this.classify(grid, owner);
    this.rings(grid, ledges, bodies);
    this.tidy(grid, ledges, bodies);

    const bed = this.bed(grid);
    for (let i = 0; i < bed.length; i++) {
      if (this.core[i]) bed[i] = 0;
      if (ledges[i] && grid[i] !== TerrainName.WATER) this.dry[i] = 1;
    }

    return {
      bodies,
      owner,
      bed,
      dry: this.dry,
      hidden: this.hidden,
      overhang: this.overhang,
      falls: this.falls,
    };
  }

  flatten(
    local: Uint8Array,
    grid: TerrainName[],
    offset: number,
    height: number,
    seed: string,
    earth: number,
    levels: number,
  ): { level: number; from: number; to: number }[] {
    const { width } = this;
    const random = handlers.generation.seededRandom(handlers.generation.hash(`${seed}-falls`));
    const top = (x: number, level: number) => {
      let y = 0;
      while (y < height && local[y * width + x] >= level) y++;
      return y;
    };
    const write = (x: number, tops: number[]) => {
      for (let y = 0; y < height; y++) {
        let level = 0;
        while (level < levels && y < tops[level]) level++;

        const i = y * width + x;
        local[i] = level;
        grid[offset + i] =
          level === 0 ? TerrainName.GRASS : level > earth ? TerrainName.SNOW : TerrainName.EARTH;
      }
    };
    const sites: number[] = [];

    for (let t = 0; t < 300 && sites.length < WATER_RIVERS; t++) {
      const c = 20 + Math.floor(random() * (width - 47));
      if (sites.some((s) => Math.abs(s - c) < 40)) continue;

      const columns = Array.from({ length: 7 }, (_, k) => c - 2 + k);
      const r = columns.map((x) => top(x, 1)).sort((a, b) => a - b)[3];
      if (r < SPRING + 6 || r > height - 2) continue;
      if (columns.some((x) => Math.abs(top(x, 1) - r) > 3)) continue;

      const limits = [r];
      for (let level = 2; level <= levels; level++)
        limits.push(limits[level - 2] - (level === 2 ? SPRING + 2 : 4));

      const notched = columns.map((x) => {
        const tops = Array.from({ length: levels }, (_, k) => top(x, k + 1));
        return tops.map((v, k) => (k === 0 ? r : v > 0 ? Math.min(v, limits[k]) : v));
      });
      if (notched.some((tops) => tops.some((v, k) => v < 2 && top(columns[0], k + 1) > 0))) continue;

      columns.forEach((x, k) => write(x, notched[k]));

      for (const [from, step] of [
        [c - 3, -1],
        [c + 5, 1],
      ]) {
        const edge = notched[step < 0 ? 0 : 6];
        for (let k = 0, x = from; k < 3 && x > 0 && x < width - 1; k++, x += step) {
          const tops = Array.from({ length: levels }, (_, l) => top(x, l + 1));
          const outer = Array.from({ length: levels }, (_, l) => top(x + step, l + 1));
          const lone = tops.map(
            (v, l) => v !== edge[l] && Math.sign(v - edge[l]) === Math.sign(v - outer[l]),
          );
          if (!lone.some(Boolean)) break;

          write(
            x,
            tops.map((v, l) => (lone[l] ? edge[l] : v)),
          );
        }
      }

      sites.push(c);
    }

    return sites.map((c) => ({ level: 1, from: c - 6, to: c + 8 }));
  }

  decorate(grid: TerrainName[], result: WaterResult, entities: Entity[]): Entity[] {
    const { width, height } = this;
    const depth = this.depths(grid);
    const solid = new Uint8Array(width * height);
    const unders = Array.from({ length: UNDERS }, () => new Uint8Array(width * height));
    const bases = new Set<number>();
    const placed: Entity[] = [];
    const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height;
    const water = (x: number, y: number) => grid[y * width + x] === TerrainName.WATER;
    const river = (i: number) => result.owner[i] < 0;
    const plant = (name: EntityName) => CATTAILS.includes(name) || SEDGES.includes(name);

    for (const entity of entities) {
      const box = this.footprint(entity.name);
      if (!box) continue;

      const left = Math.round((entity.x - box.w * 8) / 16);
      const top = Math.round((entity.y - box.h * 8) / 16);
      for (let r = 0; r < box.h; r++)
        for (let c = 0; c < box.w; c++)
          if (inside(left + c, top + r)) solid[(top + r) * width + left + c] = 1;
    }

    const free = (layer: Uint8Array, left: number, top: number, w: number, h: number, under: boolean) => {
      for (let r = 0; r < h; r++)
        for (let c = 0; c < w; c++) {
          const x = left + c;
          const y = top + r;
          if (!inside(x, y) || layer[y * width + x]) return false;
          if (under && solid[y * width + x] === 1) return false;
        }

      return true;
    };

    const place = (name: EntityName, bx: number, by: number, ok: (x: number, y: number) => boolean) => {
      const box = this.footprint(name);
      if (!box) return false;

      const left = bx - Math.floor((box.w - 1) / 2);
      const top = by - box.h + 1;
      const base = by * width + bx;
      if (plant(name) && bases.has(base)) return false;

      let layer: Uint8Array | undefined = free(solid, left, top, box.w, box.h, false) ? solid : undefined;
      if (!layer && plant(name))
        layer = unders.find((u) => free(u, left, top, box.w, box.h, true));
      if (!layer) return false;

      for (let r = 0; r < box.h; r++)
        for (let c = 0; c < box.w; c++)
          if (inside(left + c, top + r) && result.dry[(top + r) * width + left + c]) return false;

      const rows = LILIES.includes(name) ? box.h : 1;
      for (let c = 0; c < box.w; c++)
        for (let r = 0; r < rows; r++) if (!ok(left + c, by - r)) return false;

      bases.add(base);
      for (let r = 0; r < box.h; r++)
        for (let c = 0; c < box.w; c++)
          layer[(top + r) * width + left + c] = layer === solid && plant(name) ? 2 : 1;

      placed.push({ name, x: left * 16 + box.w * 8, y: top * 16 + box.h * 8 });
      return true;
    };

    const bank = (x: number, y: number, reach: number) => {
      if (water(x, y)) return false;

      for (let dy = -reach; dy <= reach; dy++)
        for (let dx = -reach; dx <= reach; dx++)
          if (inside(x + dx, y + dy) && water(x + dx, y + dy)) return true;

      return false;
    };

    const scatter = (
      seeds: number[],
      per: [number, number],
      spread: number,
      pick: () => EntityName,
      ok: (x: number, y: number) => boolean,
      tries = 30,
    ) => {
      for (const seed of seeds) {
        let n = per[0] + Math.floor(this.random() * (per[1] - per[0] + 1));
        const sx = seed % width;
        const sy = (seed - sx) / width;

        for (let t = 0; t < tries && n > 0; t++) {
          const x = sx + Math.round(this.gauss() * spread);
          const y = sy + Math.round(this.gauss() * spread);
          if (inside(x, y) && place(pick(), x, y, ok)) n--;
        }
      }
    };

    const at = (x: number, y: number) => depth[y * width + x];
    const shallow = (x: number, y: number) =>
      inside(x, y) && ((at(x, y) >= 1 && at(x, y) <= 3) || (bank(x, y, 1) && this.random() < 0.15));
    const open = (x: number, y: number) =>
      inside(x, y) && at(x, y) >= 2 && !river(y * width + x);
    const wet = (x: number, y: number) =>
      inside(x, y) && ((at(x, y) >= 1 && at(x, y) <= 3) || bank(x, y, 1));
    const stony = (x: number, y: number) => inside(x, y) && bank(x, y, 2);

    for (const body of result.bodies) {
      const { cells } = body;
      const edge = cells.filter((i) => depth[i] === 1);
      if (!edge.length) continue;

      const calm =
        body.kind !== "creek" || cells.length >= WATER_CREEK_REEDS
          ? edge.filter((i) => !river(i))
          : [];
      const flowing = edge.filter(river);
      const beds = Math.floor(calm.length / 24) || (calm.length && this.random() < 0.6 ? 1 : 0);
      scatter(
        [...this.sample(calm, beds), ...this.sample(flowing, Math.floor(flowing.length / 260))],
        [7, 12],
        0.7,
        () => this.pick(PLANTS),
        shallow,
        160,
      );

      const pond = cells.filter((i) => depth[i] >= 3 && !river(i));
      if (body.kind !== "river" && pond.length) {
        const colonies = Math.max(
          body.kind === "creek" && cells.length >= 30 ? 1 : 0,
          Math.floor(pond.length / 260),
        );
        scatter(this.sample(pond, colonies), [3, 6], 1.5, () => this.pick(LILIES), open, 60);
      }

      const flow = cells.filter((i) => river(i) && depth[i] <= 3);
      if (flow.length) {
        scatter(this.sample(flow, Math.floor(flow.length / 900)), [1, 1], 2, () => this.pick(BOULDERS), wet);
        scatter(this.sample(flow, Math.floor(flow.length / 400)), [1, 2], 1.5, () => this.pick(MOSSY), wet);
      }

      const reach = body.kind === "river" || edge.some(river) ? 2 : 1;
      const banks = new Set<number>();
      for (const i of edge) {
        if (reach === 2 && !river(i)) continue;

        const x = i % width;
        const y = (i - x) / width;
        for (let dy = -reach; dy <= reach; dy++)
          for (let dx = -reach; dx <= reach; dx++)
            if (inside(x + dx, y + dy) && !water(x + dx, y + dy))
              banks.add((y + dy) * width + x + dx);
      }

      const shore = [...banks];
      if (reach === 2)
        scatter(this.sample(shore, Math.floor(shore.length / 120)), [2, 4], 1.2, () => this.pick(BANK), stony);
      else
        scatter(this.sample(shore, Math.floor(shore.length / 300)), [1, 2], 1.2, () => this.pick(SHORE), stony);
    }

    const wading = (kind: WaterKind, [lo, hi]: number[]) =>
      this.sample(
        result.bodies
          .filter((b) => b.kind === kind)
          .flatMap((b) => b.cells.filter((i) => depth[i] >= 1 && depth[i] <= 2 && !river(i) && !result.dry[i])),
        lo + Math.floor(this.random() * (hi - lo + 1)),
      );
    const offset = configs.entities[EntityName.HERON]?.offset;
    for (const i of [...wading("lake", HERONS), ...wading("marsh", MARSH_HERONS)]) {
      const x = i % width;
      const y = (i - x) / width;
      placed.push({
        name: EntityName.HERON,
        x: (x + 0.5) * 16 + (offset?.x ?? 0),
        y: (y + 0.5) * 16 + (offset?.y ?? 0),
      });
    }

    for (const body of result.bodies) {
      if (body.kind === "creek") continue;

      const groups = new Map<number, number[]>();
      for (const i of body.cells) {
        if (depth[i] < 2 || this.calm[i]) continue;

        const kind = river(i) ? "river" : body.kind;
        const y = Math.floor(i / width);
        const key = kind === "river" ? Math.floor(y / STRETCH) : -1;
        groups.set(key, [...(groups.get(key) ?? []), i]);
      }

      for (const [key, cells] of groups) {
        const fish = FISH[key < 0 ? body.kind : "river"];
        let x0 = width;
        let y0 = height;
        let x1 = 0;
        let y1 = 0;
        let deep = cells[0];

        for (const i of cells) {
          const x = i % width;
          const y = (i - x) / width;
          x0 = Math.min(x0, x);
          y0 = Math.min(y0, y);
          x1 = Math.max(x1, x);
          y1 = Math.max(y1, y);
          if (depth[i] > depth[deep]) deep = i;
        }

        placed.push({
          name: EntityName.ZONE,
          x: ((x0 + x1 + 1) / 2) * 16,
          y: ((y0 + y1 + 1) / 2) * 16,
          zone: { type: ZoneName.FISH, width: (x1 - x0 + 1) * 16, height: (y1 - y0 + 1) * 16, fish },
        });
        if (depth[deep] < LEAP) continue;

        placed.push({
          name: EntityName.TEXTURE_SPAWNER,
          x: ((deep % width) + 0.5) * 16,
          y: (Math.floor(deep / width) + 0.5) * 16,
          textureSpawner: {
            sprites: fish,
            duration: 15000,
            radius: Math.min(48, (depth[deep] - LEAP) * 16),
            frames: 9,
            frameRate: 12,
          },
        });
      }
    }

    return placed;
  }

  private lakes(grid: TerrainName[], owner: Int16Array): Lake[] {
    const { width, top } = this;
    const height = this.marsh ?? this.height;
    const lakes: Lake[] = [];

    for (let tries = 0; lakes.length < WATER_LAKES && tries < 500; tries++) {
      const r = this.uniform(WATER_LAKE_RADIUS[0], WATER_LAKE_RADIUS[1]);
      const cx = this.uniform(r + 6, width - r - 6);
      const cy = this.uniform(top + r + 30, height - r - 8);
      if (cy > height - r - 8) continue;
      if (lakes.some((l) => Math.hypot(cx - l.x, cy - l.y) < r + l.r + 30)) continue;

      lakes.push({ x: cx, y: cy, r });
      for (const [x, y] of this.blob(cx, cy, r)) {
        if (x < 0 || x >= width || y < top || y >= height) continue;

        const i = y * width + x;
        grid[i] = TerrainName.WATER;
        if (!owner[i]) owner[i] = lakes.length;
      }
    }

    return lakes;
  }

  private blob(cx: number, cy: number, r: number): [number, number][] {
    const waves = [2, 3, 5].map((k) => [
      this.uniform(0, 6.28),
      k,
      (this.uniform(0.05, 0.16) / k) * 2,
    ]);
    const cells: [number, number][] = [];

    for (let y = Math.trunc(cy - r * 1.5); y <= Math.trunc(cy + r * 1.5); y++)
      for (let x = Math.trunc(cx - r * 1.5); x <= Math.trunc(cx + r * 1.5); x++) {
        const a = Math.atan2(y - cy, x - cx);
        const edge = r * (1 + waves.reduce((s, [ph, k, amp]) => s + amp * Math.sin(k * a + ph), 0));
        if (Math.hypot(x - cx, (y - cy) * 1.15) <= edge) cells.push([x, y]);
      }

    return cells;
  }

  private source(grid: TerrainName[], x: number): number | null {
    const { width, top } = this;
    const { ledges, overlay } = this.relief;
    if (!top) return 0;

    let last = -1;
    for (let y = 0; y < top; y++) {
      const i = y * width + x;
      if (ledges[i] || (overlay[i] && grid[i] === TerrainName.EARTH)) last = y;
    }
    if (last < 0) return null;

    const y0 = last + 3;
    for (let d = 0; d < 4; d++) {
      const t = grid[(y0 + d) * width + x];
      if (t !== TerrainName.GRASS && t !== TerrainName.GROUND) return null;
    }

    return y0;
  }

  private path(x0: number, y0: number, end: Lake | null, from = 0): Point[] {
    const { width, height } = this;
    const x1 = end ? end.x : this.uniform(40, width - 40);
    const y1 = end ? Math.trunc(end.y) : this.marsh !== undefined ? this.marsh + MARSH_RIVER_REACH : height + 4;
    const slow = this.noise(512);
    const fast = this.noise(512);
    const swell = this.noise(512);
    const [lo, hi] = WATER_RIVER_WIDTH;
    const path: Point[] = [];
    let x = x0;

    for (let y = y0; y <= y1; y++) {
      const left = Math.max(12, y1 - y);
      const pull = (x1 - x) / left;
      const wall = Math.max(0, 28 - x) - Math.max(0, x - (width - 28));
      let slope = 1.3 * slow((y - y0) / 34) + 0.7 * fast((y - y0) / 11) + pull + wall * 0.08;
      slope = WATER_RIVER_SLOPE * Math.tanh(slope / WATER_RIVER_SLOPE);
      if (y > y0) x += slope;
      x = Math.max(4, Math.min(width - 5, x));

      const grow = Math.min(1, (y - y0) / WATER_RIVER_GROW);
      const w = lo + (hi - 2 - lo) * grow + 2.2 * Math.max(0, swell((y - y0) / 21)) * grow;
      path.push({ x, y, w: Math.max(w, from - (y - y0) * 0.5) });
    }

    return path;
  }

  private carve(grid: TerrainName[], owner: Int16Array, path: Point[], id: number) {
    const { width, height } = this;

    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];

      for (let k = 0; k < 4; k++) {
        const f = k / 4;
        const cx = a.x + (b.x - a.x) * f;
        const cy = a.y + (b.y - a.y) * f;
        const r = (a.w + (b.w - a.w) * f) / 2;

        for (let y = Math.trunc(cy - r) - 1; y <= Math.trunc(cy + r) + 1; y++)
          for (let x = Math.trunc(cx - r) - 1; x <= Math.trunc(cx + r) + 1; x++) {
            if (x < 0 || y < 0 || x >= width || y >= height) continue;
            if (y < path[0].y || y > path[path.length - 1].y) continue;
            if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 > r * r) continue;

            const n = y * width + x;
            grid[n] = TerrainName.WATER;
            if (!owner[n]) owner[n] = -id;
          }
      }
    }
  }

  private rivers(grid: TerrainName[], owner: Int16Array, lakes: Lake[]) {
    const { width } = this;
    const ends = [...lakes];
    this.shuffle(ends);
    const targets = [ends[0] ?? null, null].slice(0, WATER_RIVERS);
    const carved: Point[][] = [];
    const candidates = this.candidates(grid);

    for (const end of targets) {
      const found: { best: { score: number; path: Point[]; chain: Fall[] } | null } = { best: null };
      const consider = (path: Point[], chain: Fall[]) => {
        let apart = 99;
        for (const other of carved)
          for (const p of path)
            for (const o of other) if (o.y === p.y) apart = Math.min(apart, Math.abs(p.x - o.x));

        let travel = 0;
        for (let i = 0; i < path.length - 1; i++) travel += Math.abs(path[i + 1].x - path[i].x);
        travel /= path.length;

        const dry = path.every((p) => !this.relief.rock[p.y * width + Math.round(p.x)]);
        const score = dry ? Math.min(83, apart - 40, (travel - 0.45) * 60) + chain.length * 20 : -999;
        if (!found.best || score > found.best.score) found.best = { score, path, chain };
        return score > chain.length * 20;
      };

      const bottoms = this.ranked(
        candidates.filter((f) => f.lower === 0 && (!end || Math.abs(f.c + 1.5 - end.x) <= 70)),
      ).slice(0, 60);
      for (const f of bottoms) {
        const above = candidates.filter(
          (u) =>
            u.lower === f.upper &&
            f.r - APPROACH - 1 - (u.r + FOOT) >= STREAM &&
            Math.abs(u.c - f.c) <= 10,
        );
        const upper = this.ranked(above).find((u) => this.stream(grid, u, f));
        const chain = upper ? [upper, f] : [f];
        if (!this.spring(grid, chain[0])) continue;
        if (chain.some((c) => this.taken(c, carved))) continue;
        if (consider(this.path(f.c + 1.5, f.r + FOOT, end, 6), chain)) break;
      }

      for (let t = 0; t < 400 && (!found.best || found.best.score <= 0); t++) {
        const x0 = 25 + Math.floor(this.random() * (width - 50));
        if (end && Math.abs(x0 - end.x) > 70) continue;

        const y0 = this.source(grid, x0);
        if (y0 === null) continue;
        if (consider(this.path(x0, y0, end), [])) break;
      }

      const chosen = found.best;
      if (!chosen) continue;

      carved.push(chosen.path);
      const id = carved.length;
      this.carve(grid, owner, chosen.path, id);

      chosen.chain.forEach((fall, k) => {
        if (k === 0) this.pool(grid, owner, fall, id);
        else this.link(grid, owner, chosen.chain[k - 1], fall, id);
        this.fall(grid, owner, fall, id, k === 0 ? SPRING : APPROACH);
      });
    }
  }

  private ranked(falls: Fall[]): Fall[] {
    return this.sample(falls, falls.length).sort((a, b) => a.patch - b.patch);
  }

  private taken(fall: Fall, carved: Point[][]): boolean {
    return carved.some((path) => path.some((p) => Math.abs(p.x - fall.c) < 40 && Math.abs(p.y - fall.r) < 40));
  }

  private open(grid: TerrainName[], x0: number, x1: number, y0: number, y1: number, level: number): boolean {
    const { width, height } = this;
    const { rock, elevation } = this.relief;

    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        if (x < 0 || y < 0 || x >= width || y >= height) return false;

        const i = y * width + x;
        if (rock[i] || elevation[i] !== level) return false;
        if (grid[i] === TerrainName.SNOW || grid[i] === TerrainName.WATER) return false;
      }

    return true;
  }

  private candidates(grid: TerrainName[]): Fall[] {
    const { width, top } = this;
    const { ledges, elevation, ledge } = this.relief;
    const falls: Fall[] = [];

    for (let r = SPRING; r < top - FOOT - 1; r++)
      for (let c = 4; c < width - 10; c++) {
        let straight = true;
        for (let x = c - 1; x <= c + 3 && straight; x++)
          straight =
            ledges[r * width + x] === ledge + RIM &&
            BASES.some((b) => ledges[(r + 1) * width + x] === ledge + b);
        if (!straight) continue;

        const upper = elevation[(r - 1) * width + c + 1];
        const lower = elevation[(r + 2) * width + c + 1];
        if (upper !== lower + 1) continue;
        if (!this.open(grid, c - 1, c + 3, r - APPROACH, r - 2, upper)) continue;
        if (!this.open(grid, c, c + 2, r - 1, r - 1, upper)) continue;
        if (!this.open(grid, c - 1, c + 3, r + 2, r + FOOT - 1, lower)) continue;

        let patch = 0;
        for (let y = r - SPRING - 1; y < r; y++)
          for (let x = c - 3; x <= c + 5; x++) if (this.relief.overlay[y * width + x]) patch++;

        falls.push({ c, r, upper, lower, patch });
      }

    return falls;
  }

  private spring(grid: TerrainName[], fall: Fall): boolean {
    return this.open(grid, fall.c - 1, fall.c + 3, fall.r - SPRING, fall.r - APPROACH - 1, fall.upper);
  }

  private stream(grid: TerrainName[], from: Fall, to: Fall): boolean {
    for (const [x, y] of this.channel(from, to))
      if (!this.open(grid, x - 1, x + 1, y, y, from.lower)) return false;

    return true;
  }

  private channel(from: Fall, to: Fall): [number, number][] {
    const y0 = from.r + FOOT + 1;
    const y1 = to.r - APPROACH;
    const cells: [number, number][] = [];

    for (let y = y0; y < y1; y++) {
      const s = (y - y0) / Math.max(1, y1 - 1 - y0);
      const x = from.c + 1 + Math.round((to.c - from.c) * s * s * (3 - 2 * s));
      for (let dx = -2; dx <= 2; dx++) cells.push([x + dx, y]);
    }

    return cells;
  }

  private wet(grid: TerrainName[], owner: Int16Array, x: number, y: number, id: number, core = false) {
    const i = y * this.width + x;
    grid[i] = TerrainName.WATER;
    if (!owner[i]) owner[i] = -id;
    if (core) this.core[i] = 1;
  }

  private soak(grid: TerrainName[], owner: Int16Array, x: number, y: number, id: number, level: number) {
    const { width, height } = this;
    const { rock, elevation } = this.relief;
    if (x < 0 || y < 0 || x >= width || y >= height) return;

    const i = y * width + x;
    if (rock[i] || elevation[i] !== level || grid[i] === TerrainName.SNOW) return;

    grid[i] = TerrainName.WATER;
    if (!owner[i]) owner[i] = -id;
  }

  private pool(grid: TerrainName[], owner: Int16Array, fall: Fall, id: number) {
    const { c, r } = fall;
    const rows: [number, number, number][] = [
      [r - 11, c, c + 2],
      [r - 10, c - 2, c + 4],
      [r - 9, c - 3, c + 5],
      [r - 8, c - 3, c + 5],
      [r - 7, c - 2, c + 4],
    ];

    for (const [y, a, b] of rows) for (let x = a; x <= b; x++) this.soak(grid, owner, x, y, id, fall.upper);
  }

  private link(grid: TerrainName[], owner: Int16Array, from: Fall, to: Fall, id: number) {
    const y0 = from.r + FOOT;
    const y1 = to.r - APPROACH - 1;
    const path: Point[] = [];

    for (let y = y0; y <= y1; y++) {
      const s = (y - y0) / Math.max(1, y1 - y0);
      path.push({ x: from.c + 1.5 + (to.c - from.c) * s * s * (3 - 2 * s), y, w: 5 });
    }

    this.carve(grid, owner, path, id);
  }

  private fall(grid: TerrainName[], owner: Int16Array, fall: Fall, id: number, reach: number) {
    const { width } = this;
    const { ledges, ledge } = this.relief;
    const { c, r } = fall;

    for (let y = r - APPROACH; y < r; y++)
      for (let x = c - 1; x <= c + 3; x++)
        if (x >= c && x <= c + 2) this.wet(grid, owner, x, y, id, true);
        else if (!this.relief.rock[y * width + x]) this.wet(grid, owner, x, y, id);

    for (let y = r; y <= r + 1; y++)
      for (let x = c; x <= c + 2; x++) {
        const i = y * width + x;
        this.hidden.set(i, ledges[i]);
        ledges[i] = 0;
        this.wet(grid, owner, x, y, id, true);
      }

    const lake: [number, number, number][] = [
      [r + 2, c - 3, c + 6],
      [r + 3, c - 4, c + 7],
      [r + 4, c - 3, c + 6],
      [r + 5, c - 2, c + 5],
    ];
    for (const [y, a, b] of lake) for (let x = a; x <= b; x++) this.soak(grid, owner, x, y, id, fall.lower);

    for (const [x, y] of fall.lower ? [] : this.blob(c + 1.5, r + FOOT, CLEARING)) {
      if (x < 0 || y < r || x >= width || y >= this.height) continue;

      const i = y * width + x;
      if (grid[i] === TerrainName.GRASS && !this.relief.rock[i] && this.relief.elevation[i] === fall.lower)
        grid[i] = TerrainName.GROUND;
    }

    const at = (x: number, y: number) => grid[y * width + x] === TerrainName.WATER;
    const footed = (i: number) => FOOTED.some((t) => ledges[i] === ledge + t);

    for (let grown = true; grown; ) {
      grown = false;
      for (let y = r; y <= r + FOOT; y++)
        for (let x = c - 3; x <= c + 6; x++) {
          const i = y * width + x;
          if (at(x, y)) continue;

          const sunk = y > r && ledges[i] && !ledges[i + width] && at(x, y + 1);
          if (!sunk) {
            if (!NEIGHBOURS.some(([dx, dy]) => dy >= 0 && at(x + dx, y + dy))) continue;
            if (ledges[i] ? !footed(i) : y < r + 1) continue;
          }

          this.wet(grid, owner, x, y, id);
          grown = true;
        }
    }

    const open = (x: number, y: number) => !at(x, y) && !ledges[y * width + x];
    for (let pruned = true; pruned; ) {
      pruned = false;
      for (let y = r; y <= r + FOOT; y++)
        for (let x = c - 3; x <= c + 6; x++) {
          const i = y * width + x;
          if (!at(x, y) || !ledges[i] || (x >= c && x <= c + 2)) continue;
          if (!open(x - 1, y) && !open(x + 1, y)) continue;

          grid[i] = this.relief.elevation[i] ? TerrainName.EARTH : TerrainName.GRASS;
          if (owner[i] === -id) owner[i] = 0;
          pruned = true;
        }
    }

    for (const x of [c - 2, c + 4]) {
      const i = r * width + x;
      if (!at(x, r) || !ledges[i]) continue;

      this.overhang.set(i, ledges[i]);
      this.core[i] = 1;
    }

    for (let y = r - reach - 1; y <= r + FOOT + 1; y++)
      for (let x = c - 5; x <= c + 8; x++) {
        this.dry[y * width + x] = 1;
        if (y <= r + 2) this.calm[y * width + x] = 1;
      }

    for (let y = r; y <= r + 2; y++)
      for (let x = c - 3; x <= c + 6; x++)
        if (at(x, y) && at(x - 1, y) && at(x + 1, y)) this.core[y * width + x] = 1;

    this.falls.push({
      x: (c - 0.5) * 16,
      y: r * 16 - WATERFALL_LIP,
      width: 64,
      height: 40,
    });
  }

  private prune(grid: TerrainName[]) {
    const { width, height } = this;
    const { overlay, rock, elevation } = this.relief;
    const seen = new Uint8Array(width * height);
    const patch = (i: number) => grid[i] === TerrainName.GRASS && elevation[i] > 0;

    for (let start = 0; start < grid.length; start++) {
      if (seen[start] || !patch(start)) continue;

      const cells = [start];
      let wet = false;
      seen[start] = 1;
      for (let q = 0; q < cells.length; q++) {
        const x = cells[q] % width;
        const y = (cells[q] - x) / width;

        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < width && ny < height && grid[ny * width + nx] === TerrainName.WATER)
              wet = true;
          }

        for (const [dx, dy] of NEIGHBOURS) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

          const n = ny * width + nx;
          if (seen[n] || !patch(n)) continue;

          seen[n] = 1;
          cells.push(n);
        }
      }
      if (!wet) continue;

      for (const i of cells) {
        grid[i] = TerrainName.EARTH;
        const x = i % width;
        const y = (i - x) / width;

        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const n = (y + dy) * width + x + dx;
            if (x + dx >= 0 && y + dy >= 0 && x + dx < width && y + dy < height && !rock[n]) overlay[n] = 0;
          }
      }
    }

    for (let i = 0; i < grid.length; i++) {
      if (!overlay[i] || rock[i] || !elevation[i] || grid[i] === TerrainName.WATER) continue;

      const x = i % width;
      const y = (i - x) / width;
      if (
        NEIGHBOURS.some(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          return nx >= 0 && ny >= 0 && nx < width && ny < height && grid[ny * width + nx] === TerrainName.WATER;
        })
      )
        overlay[i] = 0;
    }
  }

  private smooth(grid: TerrainName[], ledges: number[]) {
    const { width, height } = this;

    for (let pass = 0; pass < 3; pass++) {
      const change: number[] = [];

      for (let y = 1; y < height - 1; y++)
        for (let x = 1; x < width - 1; x++) {
          const i = y * width + x;
          if (grid[i] === TerrainName.WATER || ledges[i] || this.calm[i]) continue;

          let wet = 0;
          for (const [dx, dy] of NEIGHBOURS)
            if (grid[(y + dy) * width + x + dx] === TerrainName.WATER) wet++;
          if (wet >= 5) change.push(i);
        }

      for (const i of change) grid[i] = TerrainName.WATER;
    }
  }

  private classify(grid: TerrainName[], owner: Int16Array): WaterBody[] {
    const { width, height } = this;
    const seen = new Uint8Array(width * height);
    const bodies: WaterBody[] = [];

    for (let start = 0; start < grid.length; start++) {
      if (seen[start] || grid[start] !== TerrainName.WATER) continue;

      const cells = [start];
      seen[start] = 1;
      for (let q = 0; q < cells.length; q++) {
        const x = cells[q] % width;
        const y = (cells[q] - x) / width;

        for (const [dx, dy] of NEIGHBOURS) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

          const n = ny * width + nx;
          if (seen[n] || grid[n] !== TerrainName.WATER) continue;

          seen[n] = 1;
          cells.push(n);
        }
      }

      const kind: WaterKind = cells.some((i) => owner[i] > 0)
        ? "lake"
        : cells.some((i) => this.marshy[i])
          ? "marsh"
          : cells.some((i) => owner[i] < 0)
            ? "river"
            : "creek";

      if (kind === "creek" && cells.length < WATER_CREEK_MIN) {
        for (const i of cells) grid[i] = TerrainName.GROUND;
        continue;
      }

      bodies.push({ kind, cells });
    }

    return bodies;
  }

  private distance(grid: TerrainName[], seeds: number[], limit: number): Map<number, number> {
    const { width, height } = this;
    const dist = new Map<number, number>();
    for (const i of seeds) dist.set(i, 0);

    const queue = [...seeds];
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q];
      const d = dist.get(i)!;
      if (d >= limit) continue;

      const x = i % width;
      const y = (i - x) / width;
      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

        const n = ny * width + nx;
        if (dist.has(n) || grid[n] === TerrainName.WATER) continue;

        dist.set(n, d + 1);
        queue.push(n);
      }
    }

    return dist;
  }

  private rings(grid: TerrainName[], ledges: number[], bodies: WaterBody[]) {
    const { width } = this;
    const noise = this.noise(4096);

    for (const body of bodies)
      for (const [i, d] of this.distance(grid, body.cells, WATER_BEACH_RING[1])) {
        const t = grid[i];
        if (!d || t === TerrainName.EARTH || t === TerrainName.SNOW || ledges[i] || this.relief.elevation[i])
          continue;

        const x = i % width;
        const y = (i - x) / width;
        const [lo, hi] = this.marsh !== undefined && y >= this.marsh ? MARSH_RING : WATER_BEACH_RING;
        const reach = lo + (hi - lo) * (0.5 + 0.5 * noise((x * 0.37 + y * 0.61) / 3.1));
        if (d <= reach) grid[i] = TerrainName.GROUND;
      }
  }

  private tidy(grid: TerrainName[], ledges: number[], bodies: WaterBody[]) {
    const { width, height } = this;
    const zone = this.distance(
      grid,
      bodies.flatMap((b) => b.cells),
      WATER_BEACH_RING[1] + 2,
    );

    for (let pass = 0; pass < 2; pass++)
      for (const i of zone.keys()) {
        if (grid[i] !== TerrainName.GRASS || ledges[i] || this.relief.elevation[i]) continue;

        const x = i % width;
        const y = (i - x) / width;
        if (!handlers.generation.isInBlock(x, y, width, height, grid, TerrainName.GRASS))
          grid[i] = TerrainName.GROUND;
      }

    const open = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < width && y < height &&
      (grid[y * width + x] === TerrainName.GROUND || grid[y * width + x] === TerrainName.WATER);

    for (let pass = 0; pass < 2; pass++)
      for (const i of zone.keys()) {
        if (grid[i] !== TerrainName.GROUND || ledges[i] || this.relief.elevation[i]) continue;

        const x = i % width;
        const y = (i - x) / width;
        const block = [
          [-1, -1],
          [0, -1],
          [-1, 0],
          [0, 0],
        ].some(([ox, oy]) => open(x + ox, y + oy) && open(x + ox + 1, y + oy) && open(x + ox, y + oy + 1) && open(x + ox + 1, y + oy + 1));
        if (!block) grid[i] = TerrainName.GRASS;
      }
  }

  private bed(grid: TerrainName[]): Uint8Array {
    const bed = new Uint8Array(grid.length);
    const shallows: number[] = [];

    for (let i = 0; i < grid.length; i++) if (grid[i] === TerrainName.WATER) shallows.push(i);
    for (const i of this.distance(grid, shallows, WATER_BED_REACH).keys()) bed[i] = 1;

    return bed;
  }

  private depths(grid: TerrainName[]): Int32Array {
    const { width, height } = this;
    const out = new Int32Array(width * height);
    const queue: number[] = [];

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== TerrainName.WATER) continue;

      const x = i % width;
      const y = (i - x) / width;
      if (
        NEIGHBOURS.some(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          return nx >= 0 && ny >= 0 && nx < width && ny < height && grid[ny * width + nx] !== TerrainName.WATER;
        })
      ) {
        out[i] = 1;
        queue.push(i);
      }
    }

    for (let q = 0; q < queue.length; q++) {
      const i = queue[q];
      const x = i % width;
      const y = (i - x) / width;

      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

        const n = ny * width + nx;
        if (grid[n] !== TerrainName.WATER || out[n]) continue;

        out[n] = out[i] + 1;
        queue.push(n);
      }
    }

    return out;
  }

  private footprint(name: EntityName): { w: number; h: number } | null {
    const texture = configs.entities[name]?.components.find(
      (c) => c.name === ComponentName.TEXTURE || c.name === ComponentName.TEXTURE_ANIMATION,
    )?.config as Pick<TextureConfig, "tileSize" | "tiles"> | undefined;
    if (!texture || texture.tileSize !== 16) return null;

    return {
      w: Math.max(...texture.tiles.map((t) => t.end - t.start + 1)),
      h: texture.tiles.length,
    };
  }

  private noise(size: number): (t: number) => number {
    const values = Array.from({ length: size }, () => this.uniform(-1, 1));

    return (t: number) => {
      const i = Math.floor(t);
      let f = t - i;
      f = f * f * (3 - 2 * f);
      const a = values[((i % size) + size) % size];
      const b = values[(((i + 1) % size) + size) % size];
      return a + (b - a) * f;
    };
  }

  private uniform(a: number, b: number): number {
    return a + (b - a) * this.random();
  }

  private gauss(): number {
    const u = 1 - this.random();
    const v = this.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  private pick<T>(list: T[]): T {
    return list[Math.floor(this.random() * list.length)];
  }

  private sample<T>(list: T[], count: number): T[] {
    const copy = [...list];
    this.shuffle(copy);
    return copy.slice(0, Math.min(count, copy.length));
  }

  private shuffle<T>(list: T[]) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
}
