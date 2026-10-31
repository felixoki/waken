import {
  PLUNGE_COLORS,
  PLUNGE_DROPS,
  PLUNGE_DURATION,
  PLUNGE_GAP,
  PLUNGE_GRAVITY,
  PLUNGE_LARGE,
  PLUNGE_LEAP,
  PLUNGE_REACH,
  PLUNGE_RINGS,
  PLUNGE_SPEED,
  PLUNGE_SPREAD,
  SINK_BOB,
  SINK_BOB_SPEED,
  SINK_EASE,
  SINK_MAX,
  SINK_RATIO,
  SINK_START,
  SWIM_BOB,
  SWIM_DEPTH,
  SWIM_EXIT,
  SWIM_RATIO,
  WAKE_ENTRY,
  WAKE_LENGTH,
  WAKE_POINTS,
  WAKE_RETRACT,
  WAKE_RING,
  WAKE_RIPPLE_PERIOD,
  WAKE_RIPPLE_REACH,
  WAKE_RIPPLES,
  WAKE_SPACING,
  WAKE_SPREAD,
  WAKE_STILL,
  WAKE_WIDTH,
  WATER_FALLOFF,
  WATER_LAND,
  WATER_SHORE,
  WATER_WADE,
  BEACH_BLUR,
  BEACH_INSET,
  BEACH_REACH,
  BEACH_RESOLUTION,
  type WaterPalette,
} from "@server/globals";
import { EntityName, PipelineName } from "@server/types";
import { configs } from "@server/configs";
import type { Scene } from "../scenes/Scene";
import type { Entity } from "../Entity";

export interface Wake {
  xs: Float32Array;
  ys: Float32Array;
  count: number;
  px: number;
  py: number;
  seed: number;
  airborne: boolean;
  seen: boolean;
}

export interface Splash {
  x: number;
  y: number;
  rx: number;
  ry: number;
  start: number;
  force: number;
}

export interface Wading {
  depth: number;
  feet: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  swimming: boolean;
  seen: boolean;
}

export interface Water {
  palette: WaterPalette;
  depth: Phaser.Textures.Texture;
  shore: Phaser.Textures.Texture;
  distance: Float32Array;
  columns: number;
  rows: number;
  tile: number;
  width: number;
  height: number;
  wake: Phaser.Textures.DynamicTexture;
  graphics: Phaser.GameObjects.Graphics;
  trails: Map<string, Wake>;
  sinks: Map<string, Wading>;
  entities: Map<string, Entity>;
  splashes: Splash[];
  x: number;
  y: number;
  time: number;
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

const RING_SEGMENTS = 16;
const WAKE_MARGIN = 16;

const channel = (value: number): number =>
  Math.round(Math.min(1, Math.max(0, value)) * 255);

const DEFAULT_PIPELINE = "MultiPipeline";
const DROP_TEXTURE = "particle_pixel";

const encode = (across: number, strength: number, ring: boolean): number =>
  (channel(across) << 16) | (channel(strength) << 8) | (ring ? 255 : 0);

export const water = {
  distances: (layer: Phaser.Tilemaps.TilemapLayer): Int32Array => {
    const { width, height, data } = layer.layer;
    const distance = new Int32Array(width * height).fill(-1);
    const queue = new Int32Array(width * height);
    let head = 0;
    let tail = 0;

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        if (data[y][x].index > 0) continue;

        distance[y * width + x] = 0;
        queue[tail++] = y * width + x;
      }

    while (head < tail) {
      const i = queue[head++];
      const x = i % width;
      const y = (i - x) / width;

      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

        const n = ny * width + nx;
        if (distance[n] !== -1) continue;

        distance[n] = distance[i] + 1;
        queue[tail++] = n;
      }
    }

    return distance;
  },

  field: (
    scene: Scene,
    shore: Float32Array,
    columns: number,
    rows: number,
  ): Phaser.Textures.Texture | null => {
    const r = BEACH_RESOLUTION;
    const width = columns * r;
    const height = rows * r;
    let a = new Float32Array(width * height);
    let b = new Float32Array(width * height);

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++)
        a[y * width + x] = shore[Math.floor(y / r) * columns + Math.floor(x / r)];

    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          let sum = 0;
          for (let k = -BEACH_BLUR; k <= BEACH_BLUR; k++)
            sum += a[y * width + Math.min(width - 1, Math.max(0, x + k))];
          b[y * width + x] = sum / (BEACH_BLUR * 2 + 1);
        }
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          let sum = 0;
          for (let k = -BEACH_BLUR; k <= BEACH_BLUR; k++)
            sum += b[Math.min(height - 1, Math.max(0, y + k)) * width + x];
          a[y * width + x] = sum / (BEACH_BLUR * 2 + 1);
        }
    }

    const pixels = new Uint8Array(width * height * 4);
    for (let i = 0; i < a.length; i++) {
      pixels[i * 4] = Math.round(a[i] * 255);
      pixels[i * 4 + 3] = 255;
    }

    const key = `water_shore_${scene.scene.key}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const texture = scene.textures.addUint8Array(key, pixels, width, height);
    texture?.setFilter(Phaser.Textures.FilterMode.LINEAR);

    return texture;
  },

  shores: (
    distance: Int32Array,
    columns: number,
    rows: number,
    beach?: Phaser.Tilemaps.TilemapLayer,
  ): Float32Array => {
    const shore = new Float32Array(columns * rows).fill(1);
    if (!beach) return shore;

    const bed = (x: number, y: number) =>
      (beach.layer.data[y]?.[x]?.index ?? -1) > 0;

    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) {
        const i = y * columns + x;
        if (distance[i] > 0 && bed(x, y))
          shore[i] = Math.min(1, distance[i] / BEACH_REACH);
      }

    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) {
        const i = y * columns + x;
        if (distance[i] !== 0) continue;

        for (const [dx, dy] of NEIGHBOURS) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= columns || ny >= rows) continue;
          if (distance[ny * columns + nx] > 0 && bed(nx, ny)) {
            shore[i] = 0;
            break;
          }
        }
      }

    return shore;
  },

  depth: (
    scene: Scene,
    distance: Int32Array,
    columns: number,
    rows: number,
  ): Phaser.Textures.Texture | null => {
    const pixels = new Uint8Array(columns * rows * 4);

    for (let i = 0; i < distance.length; i++) {
      const d = distance[i];
      const land = d === 0;
      const t = land
        ? WATER_LAND
        : d === -1
          ? 0
          : WATER_SHORE * Math.max(0, 1 - (d - 1) / WATER_FALLOFF);

      pixels[i * 4] = Math.round(t * 255);
      pixels[i * 4 + 1] = land ? 255 : 0;
      pixels[i * 4 + 3] = 255;
    }

    const key = `water_depth_${scene.scene.key}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const texture = scene.textures.addUint8Array(key, pixels, columns, rows);
    texture?.setFilter(Phaser.Textures.FilterMode.LINEAR);

    return texture;
  },

  apply: (
    scene: Scene,
    layer: Phaser.Tilemaps.TilemapLayer,
    beach?: Phaser.Tilemaps.TilemapLayer,
    palette: WaterPalette = "lake",
    decks: Phaser.Tilemaps.TilemapLayer[] = [],
  ) => {
    const { width: columns, height: rows, tileWidth } = layer.layer;
    const distance = water.distances(layer);
    const shore = water.shores(distance, columns, rows, beach);
    const depth = water.depth(scene, distance, columns, rows);
    const field = water.field(scene, shore, columns, rows);
    const covered = (l: Phaser.Tilemaps.TilemapLayer | undefined, i: number) =>
      (l?.layer.data[Math.floor(i / columns)]?.[i % columns]?.index ?? -1) > 0;
    const reach = Float32Array.from(distance, (d, i) => {
      if (decks.some((deck) => covered(deck, i))) return 0;
      return covered(beach, i) && d > 0 ? Math.max(0.01, d - BEACH_INSET) : d;
    });
    if (!depth || !field) return;

    if (scene.water) water.destroy(scene, scene.water);

    const wake = water.canvas(scene, 1, 1);
    if (!wake) return;

    const state: Water = {
      palette,
      depth,
      shore: field,
      distance: reach,
      columns,
      rows,
      tile: tileWidth,
      width: layer.layer.widthInPixels,
      height: layer.layer.heightInPixels,
      wake,
      graphics: scene.make.graphics({}, false),
      trails: new Map(),
      sinks: new Map(),
      entities: new Map(),
      splashes: [],
      x: 0,
      y: 0,
      time: 0,
    };

    scene.water = state;
    layer.setData("water", state);
    layer.setPipeline(PipelineName.WATER);
  },

  canvas: (
    scene: Scene,
    width: number,
    height: number,
  ): Phaser.Textures.DynamicTexture | null => {
    const key = `water_wake_${scene.scene.key}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const wake = scene.textures.addDynamicTexture(key, width, height);
    wake?.setFilter(Phaser.Textures.FilterMode.NEAREST);

    return wake;
  },

  at: (state: Water, x: number, y: number): number => {
    const column = Math.floor(x / state.tile);
    const row = Math.floor(y / state.tile);
    if (column < 0 || row < 0 || column >= state.columns || row >= state.rows)
      return 0;

    return state.distance[row * state.columns + column];
  },

  smooth: (state: Water, x: number, y: number): number => {
    const u = x / state.tile - 0.5;
    const v = y / state.tile - 0.5;
    const x0 = Math.floor(u);
    const y0 = Math.floor(v);
    const fx = u - x0;
    const fy = v - y0;

    const cell = (cx: number, cy: number): number => {
      const column = Math.min(state.columns - 1, Math.max(0, cx));
      const row = Math.min(state.rows - 1, Math.max(0, cy));
      return Math.max(0, state.distance[row * state.columns + column]);
    };

    const top = cell(x0, y0) * (1 - fx) + cell(x0 + 1, y0) * fx;
    const bottom = cell(x0, y0 + 1) * (1 - fx) + cell(x0 + 1, y0 + 1) * fx;

    return top * (1 - fy) + bottom * fy;
  },

  origin: (camera: Phaser.Cameras.Scene2D.Camera): { x: number; y: number } => {
    const ox = camera.width * camera.originX;
    const oy = camera.height * camera.originY;

    return {
      x: camera.scrollX + ox - Math.floor(camera.x + ox + 0.5) / camera.zoom,
      y: camera.scrollY + oy - Math.floor(camera.y + oy + 0.5) / camera.zoom,
    };
  },

  update: (state: Water, scene: Scene, delta: number) => {
    const camera = scene.cameras.main;
    const view = water.origin(camera);
    const x = Math.floor(view.x) - WAKE_MARGIN;
    const y = Math.floor(view.y) - WAKE_MARGIN;
    const width = Math.ceil(camera.width / camera.zoom) + WAKE_MARGIN * 2;
    const height = Math.ceil(camera.height / camera.zoom) + WAKE_MARGIN * 2;

    if (state.wake.width !== width || state.wake.height !== height) {
      const wake = water.canvas(scene, width, height);
      if (!wake) return;

      state.wake = wake;
    }

    state.x = x;
    state.y = y;
    state.time += delta / 1000;
    state.graphics.clear();

    for (const trail of state.trails.values()) trail.seen = false;
    for (const wading of state.sinks.values()) wading.seen = false;

    const player = scene.managers.players.player;
    if (player) water.track(state, scene, player, delta);
    for (const other of scene.managers.players.others.values())
      water.track(state, scene, other, delta);
    for (const entity of scene.managers.entities.entities.values())
      water.track(state, scene, entity, delta);

    for (const [id, trail] of state.trails)
      if (!trail.seen) state.trails.delete(id);

    for (const [id, wading] of state.sinks) {
      if (wading.seen) continue;

      const entity = state.entities.get(id);
      if (entity?.active) water.surface(entity);
      state.sinks.delete(id);
      state.entities.delete(id);
    }

    water.splashes(state);

    state.wake.clear();
    if (state.trails.size || state.splashes.length)
      state.wake.draw(state.graphics);
  },

  track: (state: Water, scene: Scene, entity: Entity, delta: number) => {
    if (entity.scene !== scene || entity.isStatic || !entity.active) return;

    const body = entity.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    const x = body.center.x;
    const y = body.bottom;

    if (water.at(state, x, y) <= 0) return;

    const distance = water.smooth(state, x, y);
    const rx = body.width * WAKE_RING + 1;
    const ry = rx * 0.5;

    let trail = state.trails.get(entity.id);

    if (!trail) {
      trail = {
        xs: new Float32Array(WAKE_POINTS),
        ys: new Float32Array(WAKE_POINTS),
        count: 0,
        px: x,
        py: y,
        seed: Math.random(),
        airborne: entity.z > 0,
        seen: true,
      };
      state.trails.set(entity.id, trail);
    }

    trail.seen = true;
    if (!configs.entities[entity.name as EntityName]?.floats)
      water.sink(state, entity, body, distance, rx, ry, delta);

    const presence = Math.min(1, Math.max(0, (distance - SINK_START) / WAKE_ENTRY));
    const airborne = entity.z > 0;

    if (airborne !== trail.airborne) {
      trail.airborne = airborne;
      trail.count = 0;
      if (presence > 0)
        water.splash(
          state,
          scene,
          x,
          y,
          rx,
          ry,
          (airborne ? PLUNGE_LEAP : 1) * presence,
          entity.depth + 1,
        );
    }

    if (airborne) return;

    water.step(trail, x, y, delta);
    water.draw(state, trail, body.width, presence);
    water.ripples(state, trail, rx, ry, presence);
  },

  sink: (
    state: Water,
    entity: Entity,
    body: Phaser.Physics.Arcade.Body,
    distance: number,
    rx: number,
    ry: number,
    delta: number,
  ) => {
    let wading = state.sinks.get(entity.id);

    if (!wading) {
      wading = {
        depth: 0,
        feet: 0,
        x: 0,
        y: 0,
        rx,
        ry,
        swimming: false,
        seen: true,
      };
      state.sinks.set(entity.id, wading);
      state.entities.set(entity.id, entity);
    }

    wading.seen = true;

    const scale = entity.scaleY || 1;
    if (entity.z <= 0)
      wading.feet =
        (body.bottom - (entity.y - entity.displayOriginY * scale)) / scale;

    wading.swimming = wading.swimming
      ? distance > SWIM_EXIT
      : distance >= SWIM_DEPTH;

    const shallow = Math.min(SINK_MAX, Math.round(wading.feet * SINK_RATIO));
    const deep = Math.max(shallow, Math.round(wading.feet * SWIM_RATIO));
    const amount = Math.min(
      1,
      Math.max(0, (distance - SINK_START) / (WATER_WADE - SINK_START)),
    );
    const swim = Math.min(
      1,
      Math.max(0, (distance - WATER_WADE) / (SWIM_DEPTH - WATER_WADE)),
    );
    const bob =
      amount >= 1
        ? Math.sin(state.time * SINK_BOB_SPEED) *
          (SINK_BOB + (SWIM_BOB - SINK_BOB) * swim)
        : 0;
    const target = shallow * amount + (deep - shallow) * swim + bob;

    wading.depth += (target - wading.depth) * Math.min(1, (SINK_EASE * delta) / 1000);
    wading.x = body.center.x;
    wading.y = body.bottom;
    wading.rx = rx;
    wading.ry = ry;

    const depth = Math.round(wading.depth);
    const name = entity.pipeline?.name;

    if (depth <= 0) {
      if (name === PipelineName.WADE) water.surface(entity);
      return;
    }

    if (name !== DEFAULT_PIPELINE && name !== PipelineName.WADE) return;

    entity.setData("wading", { ...wading, depth });
    if (name !== PipelineName.WADE) entity.setPipeline(PipelineName.WADE);
  },

  swimming: (entity: Entity): boolean =>
    !!(entity.scene as Scene | undefined)?.water?.sinks.get(entity.id)?.swimming,

  surface: (entity: Entity) => {
    if (entity.pipeline?.name === PipelineName.WADE) entity.resetPipeline();
    entity.data?.remove("wading");
  },

  splash: (
    state: Water,
    scene: Scene,
    x: number,
    y: number,
    rx: number,
    ry: number,
    force: number,
    depth: number,
  ) => {
    state.splashes.push({ x, y, rx, ry, start: state.time, force });

    const count = Math.round(PLUNGE_DROPS * force);
    if (count <= 0) return;

    const speed = PLUNGE_SPEED * (0.6 + 0.4 * force);
    const spread = PLUNGE_SPREAD * (0.5 + 0.5 * force);
    const lifespan = ((speed * 2) / PLUNGE_GRAVITY) * 1000 + 100;

    const drops = scene.add.particles(0, 0, DROP_TEXTURE, {
      emitZone: {
        type: "random" as const,
        source: {
          getRandomPoint: (point: Phaser.Types.Math.Vector2Like) => {
            const angle = Math.random() * Math.PI * 2;
            const reach = 0.5 + Math.random() * 0.5;
            point.x = Math.cos(angle) * rx * reach;
            point.y = Math.sin(angle) * ry * reach;
          },
        },
      },
      deathZone: {
        type: "onLeave" as const,
        source: new Phaser.Geom.Rectangle(x - 256, y - 256, 512, 256 + ry),
      },
      speedX: { min: -spread, max: spread },
      speedY: { min: -speed, max: -speed * 0.4 },
      gravityY: PLUNGE_GRAVITY,
      scale: { onEmit: () => (Math.random() < PLUNGE_LARGE ? 2 : 1) },
      tint: PLUNGE_COLORS,
      lifespan,
      emitting: false,
    });

    drops.setDepth(depth);
    drops.explode(count, x, y);
    scene.time.delayedCall(lifespan, () => drops.destroy());
  },

  splashes: (state: Water) => {
    const total = PLUNGE_DURATION + PLUNGE_GAP * (PLUNGE_RINGS - 1);
    let kept = 0;

    for (const splash of state.splashes) {
      const age = state.time - splash.start;
      if (age >= total) continue;

      state.splashes[kept++] = splash;

      const rings = splash.force >= 1 ? PLUNGE_RINGS : 1;
      for (let r = 0; r < rings; r++) {
        const t = (age - r * PLUNGE_GAP) / PLUNGE_DURATION;
        if (t < 0 || t >= 1) continue;

        const eased = 1 - (1 - t) * (1 - t);
        const outer = 0.6 + eased * PLUNGE_REACH;
        const inner = Math.max(0, outer - 0.18 - (1 - eased) * 0.8);
        const strength = (1 - t) * Math.min(1, splash.force * 1.5);

        water.annulus(
          state,
          splash.x - state.x,
          splash.y - state.y,
          splash.rx,
          splash.ry,
          inner,
          outer,
          encode(1, strength, true),
        );
      }
    }

    state.splashes.length = kept;
  },

  ripples: (state: Water, trail: Wake, rx: number, ry: number, presence: number) => {
    const cx = trail.xs[0] - state.x;
    const cy = trail.ys[0] - state.y;

    for (let r = 0; r < WAKE_RIPPLES; r++) {
      const t =
        (state.time / WAKE_RIPPLE_PERIOD + trail.seed + r / WAKE_RIPPLES) % 1;
      const inner = 1 + t * WAKE_RIPPLE_REACH;
      const strength = (1 - t) * (1 - t) * presence;

      water.annulus(state, cx, cy, rx, ry, inner, inner + 0.18, encode(1, strength, true));
    }
  },

  annulus: (
    state: Water,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    inner: number,
    outer: number,
    color: number,
  ) => {
    const g = state.graphics;
    g.fillStyle(color);

    for (let i = 0; i < RING_SEGMENTS; i++) {
      const a0 = (i / RING_SEGMENTS) * Math.PI * 2;
      const a1 = ((i + 1) / RING_SEGMENTS) * Math.PI * 2;
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);

      g.fillTriangle(
        cx + c0 * rx * inner, cy + s0 * ry * inner,
        cx + c0 * rx * outer, cy + s0 * ry * outer,
        cx + c1 * rx * outer, cy + s1 * ry * outer,
      );
      g.fillTriangle(
        cx + c0 * rx * inner, cy + s0 * ry * inner,
        cx + c1 * rx * outer, cy + s1 * ry * outer,
        cx + c1 * rx * inner, cy + s1 * ry * inner,
      );
    }
  },

  step: (trail: Wake, x: number, y: number, delta: number) => {
    const { xs, ys } = trail;
    const speed = (Math.hypot(x - trail.px, y - trail.py) * 1000) / Math.max(1, delta);
    const still = trail.count > 0 && speed < WAKE_STILL;

    trail.px = x;
    trail.py = y;
    const gap =
      trail.count > 1 ? Math.hypot(x - xs[1], y - ys[1]) : WAKE_SPACING;

    if (trail.count === 0 || gap >= WAKE_SPACING) {
      xs.copyWithin(1, 0, WAKE_POINTS - 1);
      ys.copyWithin(1, 0, WAKE_POINTS - 1);
      trail.count = Math.min(trail.count + 1, WAKE_POINTS);
    }

    xs[0] = x;
    ys[0] = y;

    const budget = still
      ? water.length(trail) - (WAKE_RETRACT * delta) / 1000
      : WAKE_LENGTH;

    water.trim(trail, Math.max(0, Math.min(WAKE_LENGTH, budget)));
  },

  length: (trail: Wake): number => {
    let length = 0;
    for (let i = 1; i < trail.count; i++)
      length += Math.hypot(
        trail.xs[i] - trail.xs[i - 1],
        trail.ys[i] - trail.ys[i - 1],
      );

    return length;
  },

  trim: (trail: Wake, budget: number) => {
    const { xs, ys } = trail;
    let length = 0;

    for (let i = 1; i < trail.count; i++) {
      const segment = Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);

      if (length + segment <= budget) {
        length += segment;
        continue;
      }

      const keep = segment > 0 ? (budget - length) / segment : 0;
      xs[i] = xs[i - 1] + (xs[i] - xs[i - 1]) * keep;
      ys[i] = ys[i - 1] + (ys[i] - ys[i - 1]) * keep;
      trail.count = keep > 0 ? i + 1 : i;
      return;
    }
  },

  draw: (state: Water, trail: Wake, size: number, presence: number) => {
    const g = state.graphics;
    const { xs, ys, count } = trail;
    const ox = state.x;
    const oy = state.y;

    const rx = size * WAKE_RING + 1;
    const ry = rx * 0.5;
    const cx = xs[0] - ox;
    const cy = ys[0] - oy;
    const middle = encode(0, presence, true);
    const rim = encode(1, presence, true);

    for (let i = 0; i < RING_SEGMENTS; i++) {
      const a0 = (i / RING_SEGMENTS) * Math.PI * 2;
      const a1 = ((i + 1) / RING_SEGMENTS) * Math.PI * 2;

      g.fillGradientStyle(middle, rim, rim, rim);
      g.fillTriangle(
        cx,
        cy,
        cx + Math.cos(a0) * rx,
        cy + Math.sin(a0) * ry,
        cx + Math.cos(a1) * rx,
        cy + Math.sin(a1) * ry,
      );
    }

    if (count < 2) return;

    const head = size * 0.5;
    const total = Math.max(1, water.length(trail));
    let s = 0;
    let lx0 = 0;
    let ly0 = 0;
    let rx0 = 0;
    let ry0 = 0;
    let c0 = 0;
    let e0 = 0;

    for (let i = 0; i < count; i++) {
      const j = Math.min(i + 1, count - 1);
      const k = Math.max(i - 1, 0);
      const dx = xs[j] - xs[k];
      const dy = ys[j] - ys[k];
      const d = Math.hypot(dx, dy) || 1;
      const nx = -dy / d;
      const ny = dx / d;

      if (i > 0) s += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);

      const fade = (1 - s / total) * presence;
      const w = Math.min(WAKE_WIDTH, head + s * WAKE_SPREAD);
      const px = xs[i] - ox;
      const py = ys[i] - oy;
      const lx = px + nx * w;
      const ly = py + ny * w;
      const rx1 = px - nx * w;
      const ry1 = py - ny * w;
      const c1 = encode(0, fade, false);
      const e1 = encode(1, fade, false);

      if (i > 0) {
        const pcx = xs[i - 1] - ox;
        const pcy = ys[i - 1] - oy;

        g.fillGradientStyle(c0, e0, c1, c1);
        g.fillTriangle(pcx, pcy, lx0, ly0, px, py);
        g.fillGradientStyle(e0, e1, c1, c1);
        g.fillTriangle(lx0, ly0, lx, ly, px, py);
        g.fillGradientStyle(c0, e0, c1, c1);
        g.fillTriangle(pcx, pcy, rx0, ry0, px, py);
        g.fillGradientStyle(e0, e1, c1, c1);
        g.fillTriangle(rx0, ry0, rx1, ry1, px, py);
      }

      lx0 = lx;
      ly0 = ly;
      rx0 = rx1;
      ry0 = ry1;
      c0 = c1;
      e0 = e1;
    }
  },

  destroy: (scene: Scene, state: Water) => {
    for (const entity of state.entities.values())
      if (entity.active) water.surface(entity);

    state.graphics.destroy();
    state.trails.clear();
    state.sinks.clear();
    state.entities.clear();
    state.splashes.length = 0;
    if (scene.textures.exists(state.depth.key)) scene.textures.remove(state.depth);
    if (scene.textures.exists(state.shore.key)) scene.textures.remove(state.shore);
    if (scene.textures.exists(state.wake.key)) scene.textures.remove(state.wake);
  },
};
