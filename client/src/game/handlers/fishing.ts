import {
  ComponentName,
  EntityName,
  FishName,
  FishDifficulty,
  Hooked,
  Reel,
  ReelOutcome,
  ZoneName,
} from "@server/types";
import {
  FISHING_SCAN_TILES,
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
import { handlers } from ".";

export const fishing = {
  toEntityName: (name: FishName): EntityName => name as unknown as EntityName,

  findWater: (entity: Entity): { x: number; y: number } | null => {
    const tilemap = entity.scene.tileManager.map;
    if (!tilemap.getLayer("water")) return null;

    const step = handlers.direction.getDirectionalOffset(
      entity.facing,
      TILE_SIZE,
    );
    const camera = entity.scene.cameras.main;

    for (let i = 1; i <= FISHING_SCAN_TILES; i++) {
      const x = entity.x + step.x * i;
      const y = entity.y + step.y * i;
      if (tilemap.getTileAtWorldXY(x, y, false, camera, "water"))
        return { x, y };
    }

    return null;
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
