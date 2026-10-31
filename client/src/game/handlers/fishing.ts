import {
  ComponentName,
  EntityName,
  FishName,
  FishDifficulty,
  FishingLine,
  FishingPhase,
  Hooked,
  LineShape,
  Reel,
  ReelOutcome,
  ZoneName,
} from "@server/types";
import {
  FISHING_LINE_SAG,
  FISHING_SCAN_STEP,
  FISHING_CAST_MAX_TILES,
  FISHING_MIN_DEPTH,
  FISHING_RIPPLE_ALPHA,
  FISHING_RIPPLE_POINTS,
  FISHING_RIPPLE_RADIUS,
  FISHING_BOBBER_HANG,
  DURATION_FISHING_RIPPLE,
  DURATION_FISHING_RIPPLE_BITE,
  SINK_START,
  REEL_BAR_ACCEL,
  REEL_BAR_DRAG,
  REEL_BAR_MAX_SPEED,
  REEL_DART_DURATION,
  REEL_DART_MULTIPLIER,
  REEL_METER_FILL,
  REEL_METER_START,
  REEL_WEIGHT_BAR,
  REEL_WEIGHT_DRAIN,
  REEL_WEIGHT_ERRATIC,
  REEL_WEIGHT_SPEED,
  TILE_SIZE,
} from "@server/globals";
import { configs } from "@server/configs";
import { Entity } from "../Entity";
import { ZoneComponent } from "../components/Zone";
import type { Scene } from "../scenes/Scene";
import { handlers } from ".";

const ROD_TIPS: Record<string, [number, number][][]> = {
  fishing: [
    [[33, 54], [33, 54], [33, 54], [33, 53], [33, 53], [33, 53], [33, 53], [33, 54], [33, 54], [33, 54], [33, 54]],
    [[35, 19], [35, 19], [35, 19], [35, 20], [35, 20], [35, 20], [35, 20], [35, 19], [35, 19], [35, 19], [35, 19]],
    [[0, 31], [0, 31], [0, 31], [0, 30], [0, 30], [0, 30], [0, 30], [0, 31], [0, 31], [0, 31], [0, 31]],
    [[63, 30], [63, 30], [63, 30], [63, 29], [63, 29], [63, 29], [63, 29], [63, 30], [63, 30], [63, 30], [63, 30]],
  ],
  throw: [
    [[41, 34], [45, 14], [42, 13], [40, 12], [45, 17], [43, 34], [36, 51], [33, 54]],
    [[46, 12], [46, 12], [45, 27], [42, 37], [46, 10], [43, 8], [43, 11], [35, 19]],
    [[8, 17], [23, 5], [36, 10], [41, 17], [20, 6], [5, 12], [0, 28], [0, 31]],
    [[55, 16], [40, 4], [27, 9], [22, 16], [43, 5], [58, 11], [63, 27], [63, 30]],
  ],
  bite: [
    [[33, 53], [33, 52], [33, 52], [33, 53]],
    [[35, 20], [35, 20], [35, 20], [35, 20]],
    [[0, 31], [0, 30], [0, 30], [0, 31]],
    [[63, 30], [63, 29], [63, 29], [63, 30]],
  ],
  catch: [
    [[33, 53], [33, 52], [33, 52], [37, 46], [45, 41], [33, 52]],
    [[35, 20], [35, 20], [35, 20], [39, 24], [39, 25], [35, 20]],
    [[0, 31], [0, 30], [0, 30], [2, 26], [2, 25], [0, 30]],
    [[63, 30], [63, 29], [63, 29], [61, 25], [60, 23], [63, 29]],
  ],
};

const LINES: Record<FishingPhase, FishingLine> = {
  [FishingPhase.CHARGING]: FishingLine.HANGING,
  [FishingPhase.CASTING]: FishingLine.HANGING,
  [FishingPhase.WAITING]: FishingLine.FLOATING,
  [FishingPhase.BITE]: FishingLine.BITE,
  [FishingPhase.REELING]: FishingLine.TAUT,
  [FishingPhase.CATCHING]: FishingLine.TAUT,
};

type Point = { x: number; y: number };

const breathe = (now: number) => 1 + Math.sin(now * 0.0021) * 0.25;
const drift = (now: number) => Math.sin(now * 0.0017) * 2;

const SHAPES: Record<
  FishingLine,
  (now: number, tip: Point, bobber: Point) => LineShape
> = {
  [FishingLine.HANGING]: (now, tip) => ({
    x: tip.x + Math.sin(now * 0.006) * 1.5,
    y: tip.y + FISHING_BOBBER_HANG,
    slack: 0,
    sway: 0,
  }),
  [FishingLine.FLYING]: (now, _tip, bobber) => ({
    x: bobber.x,
    y: bobber.y,
    slack: 0.3,
    sway: drift(now),
  }),
  [FishingLine.FLOATING]: (now, _tip, bobber) => ({
    x: bobber.x + Math.sin(now * 0.0011) * 0.8,
    y: bobber.y + Math.sin(now * 0.003),
    slack: breathe(now),
    sway: drift(now),
  }),
  [FishingLine.BITE]: (now, _tip, bobber) => ({
    x: bobber.x,
    y: bobber.y + (Math.sin(now * 0.025) > 0 ? 1 : 0),
    slack: breathe(now),
    sway: drift(now),
  }),
  [FishingLine.TAUT]: (now, _tip, bobber) => ({
    x: bobber.x + Math.sin(now * 0.04),
    y: bobber.y,
    slack: 0,
    sway: 0,
  }),
};

const RIPPLES: Partial<Record<FishingLine, number>> = {
  [FishingLine.FLOATING]: DURATION_FISHING_RIPPLE,
  [FishingLine.BITE]: DURATION_FISHING_RIPPLE_BITE,
};

const LINE_COLOR = 0x421e17;
const BOBBER_LIGHT = 0xd7dcf8;
const BOBBER_SHADE = 0xa0a8d7;

export const fishing = {
  toEntityName: (name: FishName): EntityName => name as unknown as EntityName,

  deep: (entity: Entity, x: number, y: number): boolean => {
    const state = (entity.scene as Scene).water;

    if (!state)
      return !!entity.scene.tileManager.map.getTileAtWorldXY(
        x,
        y,
        false,
        entity.scene.cameras.main,
        "water",
      );

    const distance = handlers.water.at(state, x, y);
    if (distance === -1) return true;
    if (distance <= 0) return false;

    return handlers.water.smooth(state, x, y) >= FISHING_MIN_DEPTH;
  },

  grounded: (entity: Entity): boolean => {
    if (entity.z > 0) return false;

    const state = (entity.scene as Scene).water;
    const body = entity.body as Phaser.Physics.Arcade.Body | null;
    if (!state || !body) return true;

    const x = body.center.x;
    const y = body.bottom;

    return (
      handlers.water.at(state, x, y) <= 0 ||
      handlers.water.smooth(state, x, y) < SINK_START
    );
  },

  findWater: (
    entity: Entity,
    target: { x: number; y: number },
    reach: number,
  ): { x: number; y: number } | null => {
    if (!entity.scene.tileManager.map.getLayer("water")) return null;

    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const length = Math.hypot(dx, dy);
    const facing = handlers.direction.getDirectionalOffset(entity.facing, 1);
    const ux = length > FISHING_SCAN_STEP ? dx / length : facing.x;
    const uy = length > FISHING_SCAN_STEP ? dy / length : facing.y;
    const max = FISHING_CAST_MAX_TILES * TILE_SIZE;
    const end = Math.min(reach, max, Math.max(length, TILE_SIZE));

    const probe = (d: number) => {
      const x = Math.round(entity.x + ux * d);
      const y = Math.round(entity.y + uy * d);
      return fishing.deep(entity, x, y) ? { x, y } : null;
    };

    for (let d = end; d >= FISHING_SCAN_STEP; d -= FISHING_SCAN_STEP) {
      const hit = probe(d);
      if (hit) return hit;
    }

    for (let d = end + FISHING_SCAN_STEP; d <= max; d += FISHING_SCAN_STEP) {
      const hit = probe(d);
      if (hit) return hit;
    }

    return null;
  },

  rodTip: (entity: Entity): { x: number; y: number } => {
    const key = entity.texture.key;
    const variant = key.endsWith("-fishing")
      ? "fishing"
      : key.slice(key.lastIndexOf("-") + 1);
    const rows = ROD_TIPS[variant];
    const index = Number(entity.frame.name);

    if (!rows || !Number.isFinite(index)) return { x: entity.x, y: entity.y };

    const columns = rows[0].length;
    const tip = rows[Math.floor(index / columns)]?.[index % columns];

    if (!tip) return { x: entity.x, y: entity.y };

    return {
      x: entity.x + (tip[0] - entity.displayOriginX) * entity.scaleX,
      y: entity.y + (tip[1] - entity.displayOriginY) * entity.scaleY,
    };
  },

  line: (phase: FishingPhase, flying: boolean): FishingLine =>
    flying ? FishingLine.FLYING : LINES[phase],

  draw: (
    graphics: Phaser.GameObjects.Graphics,
    line: FishingLine,
    now: number,
    tip: Point,
    bobber: Point,
  ): void => {
    const shape = SHAPES[line](now, tip, bobber);
    fishing.drawLine(graphics, tip, shape, shape.slack, shape.sway);

    const period = RIPPLES[line];
    if (period)
      fishing.drawRipple(graphics, bobber.x, bobber.y, (now % period) / period);
  },

  drawAim: (graphics: Phaser.GameObjects.Graphics, target: Point): void => {
    const x = Math.round(target.x);
    const y = Math.round(target.y);

    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillRect(x - 1, y, 3, 1);
    graphics.fillRect(x, y - 1, 1, 3);
  },

  drawLine: (
    graphics: Phaser.GameObjects.Graphics,
    from: { x: number; y: number },
    to: { x: number; y: number },
    slack: number,
    sway: number,
  ): void => {
    graphics.clear();

    const x0 = Math.round(from.x);
    const y0 = Math.round(from.y);
    const x1 = Math.round(to.x);
    const y1 = Math.round(to.y);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const cx = x0 + dx * 0.5 + sway;
    const cy = y0 + dy * 0.5 + Math.hypot(dx, dy) * FISHING_LINE_SAG * slack;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1) * 2;

    graphics.fillStyle(LINE_COLOR);

    let px = x0;
    let py = y0;
    graphics.fillRect(px, py, 1, 1);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const x = Math.round(u * u * x0 + 2 * u * t * cx + t * t * x1);
      const y = Math.round(u * u * y0 + 2 * u * t * cy + t * t * y1);
      if (x === px && y === py) continue;
      px = x;
      py = y;
      graphics.fillRect(x, y, 1, 1);
    }

    graphics.fillStyle(BOBBER_LIGHT);
    graphics.fillRect(x1 - 1, y1 - 1, 2, 1);
    graphics.fillStyle(BOBBER_SHADE);
    graphics.fillRect(x1 - 1, y1, 2, 1);
  },

  drawRipple: (
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    phase: number,
  ): void => {
    const radius = 2 + phase * FISHING_RIPPLE_RADIUS;

    graphics.fillStyle(BOBBER_LIGHT, FISHING_RIPPLE_ALPHA * (1 - phase));

    for (let i = 0; i < FISHING_RIPPLE_POINTS; i++) {
      const angle = (i / FISHING_RIPPLE_POINTS) * Math.PI * 2;
      graphics.fillRect(
        Math.round(x + Math.cos(angle) * radius),
        Math.round(y + 1 + Math.sin(angle) * radius * 0.5),
        1,
        1,
      );
    }
  },

  findZone: (entity: Entity, x: number, y: number): FishName[] | null => {
    for (const other of entity.scene.managers.entities.all) {
      const zone = other.getComponent<ZoneComponent>(ComponentName.ZONE);

      if (!zone || zone.type !== ZoneName.FISH) continue;
      if (zone.contains(x, y)) return zone.data.fish ?? [];
    }

    return null;
  },

  roll: (available: FishName[] | null): Hooked | null => {
    if (!available?.length) return null;

    const total = available.reduce(
      (sum, name) => sum + configs.fish[name].encounter,
      0,
    );

    let roll = Math.random() * total;
    let name = available[available.length - 1];

    for (const candidate of available) {
      roll -= configs.fish[candidate].encounter;
      if (roll <= 0) {
        name = candidate;
        break;
      }
    }

    const { min, max, skew } = configs.fish[name].weight;
    const percentile = Math.pow(Math.random(), skew);
    const weight = Math.round((min + percentile * (max - min)) * 10) / 10;

    return { name, weight, percentile };
  },

  difficulty: (hooked: Hooked): FishDifficulty => {
    const base = configs.fish[hooked.name].difficulty;
    const p = hooked.percentile;

    return {
      speed: base.speed * (1 + REEL_WEIGHT_SPEED * p),
      erratic: base.erratic * (1 + REEL_WEIGHT_ERRATIC * p),
      bar: base.bar * (1 - REEL_WEIGHT_BAR * p),
      drain: base.drain * (1 + REEL_WEIGHT_DRAIN * p),
    };
  },

  start: (hooked: Hooked): Reel => ({
    ...hooked,
    difficulty: fishing.difficulty(hooked),
    barPos: 0.5,
    barVel: 0,
    fishPos: Math.random(),
    fishDir: Math.random() < 0.5 ? -1 : 1,
    dartUntil: 0,
    meter: REEL_METER_START,
  }),

  step: (
    reel: Reel,
    direction: number,
    dt: number,
    now: number,
  ): { on: boolean; outcome: ReelOutcome } => {
    reel.barVel += direction * REEL_BAR_ACCEL * dt;
    reel.barVel *= Math.pow(REEL_BAR_DRAG, dt * 60);
    reel.barVel = Phaser.Math.Clamp(
      reel.barVel,
      -REEL_BAR_MAX_SPEED,
      REEL_BAR_MAX_SPEED,
    );
    reel.barPos += reel.barVel * dt;

    if (reel.barPos <= 0 || reel.barPos >= 1) {
      reel.barPos = Phaser.Math.Clamp(reel.barPos, 0, 1);
      reel.barVel = 0;
    }

    if (now > reel.dartUntil && Math.random() < reel.difficulty.erratic * dt) {
      reel.fishDir *= -1;
      reel.dartUntil = now + REEL_DART_DURATION * 1000;
    }

    const speed =
      reel.difficulty.speed * (now < reel.dartUntil ? REEL_DART_MULTIPLIER : 1);

    reel.fishPos += reel.fishDir * speed * dt;

    if (reel.fishPos <= 0) {
      reel.fishPos = 0;
      reel.fishDir = 1;
    } else if (reel.fishPos >= 1) {
      reel.fishPos = 1;
      reel.fishDir = -1;
    }

    const on = Math.abs(reel.barPos - reel.fishPos) <= reel.difficulty.bar;

    reel.meter += (on ? REEL_METER_FILL : -reel.difficulty.drain) * dt;
    reel.meter = Phaser.Math.Clamp(reel.meter, 0, 100);

    const outcome =
      reel.meter >= 100
        ? ReelOutcome.LANDED
        : reel.meter <= 0
          ? ReelOutcome.ESCAPED
          : ReelOutcome.FIGHTING;

    return { on, outcome };
  },
};
