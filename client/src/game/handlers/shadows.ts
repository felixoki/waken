import {
  HEIGHT_JUMPING,
  SHADOW_AIR_FADE,
  SHADOW_ALPHA,
  SHADOW_CROUCH,
  SHADOW_CULL,
  SHADOW_DARKNESS_MIN,
  SHADOW_DEPTH,
  SHADOW_EASE,
  SHADOW_FADE_DISTANCE,
  SHADOW_HEAD,
  SHADOW_LENGTH_MAX,
  SHADOW_LIFT,
  SHADOW_LENGTH_MIN,
  SHADOW_MIN_DISTANCE,
  SHADOW_SCALE,
  SHADOW_SEGMENTS,
  SHADOW_SPREAD,
  SHADOW_STRETCH,
  SHADOW_TAPER,
  SHADOW_WIDTH,
} from "@server/globals";
import type { Scene } from "../scenes/Scene";
import { light as lighting } from "./light";
import type { Entity } from "../Entity";
import { StateName, type TiledProperty } from "@server/types";

export interface Shadows {
  graphics: Phaser.GameObjects.Graphics;
  crouches: WeakMap<Entity, number>;
}

export const shadows = {
  create: (scene: Scene, map: Phaser.Tilemaps.Tilemap): Shadows => {
    const graphics = scene.add.graphics();
    graphics.setDepth(shadows.depth(map));

    return { graphics, crouches: new WeakMap() };
  },

  destroy: (state: Shadows): void => {
    state.graphics.destroy();
  },

  depth: (map: Phaser.Tilemaps.Tilemap): number => {
    for (const layer of map.layers) {
      const properties = layer.properties as TiledProperty[] | undefined;
      const marked = properties?.some(
        (prop) => prop.name === "shadows" && prop.value === true,
      );

      if (marked && layer.tilemapLayer) return layer.tilemapLayer.depth + 5;
    }

    return SHADOW_DEPTH;
  },

  crouch: (state: Shadows, entity: Entity, delta: number): number => {
    const target = entity.state === StateName.ROLLING ? SHADOW_CROUCH : 1;
    const current = state.crouches.get(entity);

    if (current === undefined) {
      if (target === 1) return 1;

      state.crouches.set(entity, 1);
      return 1;
    }

    const next =
      current + (target - current) * Math.min(delta * SHADOW_EASE, 1);

    if (target === 1 && next > 0.99) {
      state.crouches.delete(entity);
      return 1;
    }

    state.crouches.set(entity, next);
    return next;
  },

  update: (state: Shadows, scene: Scene, delta: number): void => {
    const { graphics } = state;
    const { players, entities } = scene.managers;
    const { r, g, b } = scene.lights.ambientColor;
    const darkness = 1 - (r * 0.299 + g * 0.587 + b * 0.114);

    graphics.clear();

    if (darkness < SHADOW_DARKNESS_MIN) return;

    const strength = SHADOW_ALPHA * darkness;

    if (players.player)
      shadows.cast(state, scene, players.player, strength, delta);

    for (const other of players.others.values())
      shadows.cast(state, scene, other, strength, delta);

    for (const entity of entities.entities.values())
      shadows.cast(state, scene, entity, strength, delta);
  },

  cast: (
    state: Shadows,
    scene: Scene,
    entity: Entity,
    strength: number,
    delta: number,
  ): void => {
    if (entity.scene !== scene || entity.isStatic) return;
    if (!entity.visible || !entity.body) return;

    const view = scene.cameras.main.worldView;
    const x = entity.body.center.x;
    const y = entity.body.bottom;

    if (
      x < view.x - SHADOW_CULL ||
      x > view.right + SHADOW_CULL ||
      y < view.y - SHADOW_CULL ||
      y > view.bottom + SHADOW_CULL
    )
      return;

    const half = Math.min(entity.body.width * SHADOW_SCALE, SHADOW_WIDTH) / 2;
    const lights = scene.lights.lights;
    const floor = lighting.floor(scene);
    const lift = entity.z * SHADOW_LIFT;
    const head = Math.min(lift, SHADOW_HEAD);
    const air = 1 - SHADOW_AIR_FADE * Math.min(entity.z / HEIGHT_JUMPING, 1);
    const crouch = shadows.crouch(state, entity, delta);
    const { graphics } = state;

    for (let i = 0; i < lights.length; i++) {
      const light = lights[i];
      if (light.intensity <= 0) continue;

      const dx = x - light.x;
      const dy = y - light.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const reach = Math.sqrt(
        Math.max(light.radius * light.radius - floor * floor, 0),
      );

      if (distance < SHADOW_MIN_DISTANCE || distance >= reach) continue;

      const intensity =
        (light.intensity * reach * reach) / (light.radius * light.radius);

      const near = Math.min(
        (distance - SHADOW_MIN_DISTANCE) / SHADOW_FADE_DISTANCE,
        1,
      );
      const alpha =
        Math.min(
          strength * (1 - distance / reach) * intensity,
          strength,
        ) *
        near *
        air;
      const length =
        Math.min(
          SHADOW_LENGTH_MIN + distance * SHADOW_STRETCH,
          SHADOW_LENGTH_MAX,
        ) * crouch;

      const nx = dx / distance;
      const ny = dy / distance;
      const px = -ny * half;
      const py = nx * half;
      const ox = x + nx * lift;
      const oy = y + ny * lift;

      let ax = ox + px;
      let ay = oy + py;
      let bx = ox - px;
      let by = oy - py;
      let from = alpha;

      if (head > 0) {
        const hx = ox - nx * head;
        const hy = oy - ny * head;
        const qx = px * SHADOW_TAPER;
        const qy = py * SHADOW_TAPER;

        graphics.fillGradientStyle(0, 0, 0, 0, 0, 0, alpha, 0);
        graphics.fillTriangle(hx + qx, hy + qy, hx - qx, hy - qy, bx, by);
        graphics.fillGradientStyle(0, 0, 0, 0, 0, alpha, alpha, 0);
        graphics.fillTriangle(hx + qx, hy + qy, bx, by, ax, ay);
      }

      for (let s = 1; s <= SHADOW_SEGMENTS; s++) {
        const t = s / SHADOW_SEGMENTS;
        const reach = length * t;
        const spread = 1 + (SHADOW_SPREAD - 1) * t;
        const to = alpha * (1 - t) * (1 - t);

        const cx = ox + nx * reach + px * spread;
        const cy = oy + ny * reach + py * spread;
        const ex = ox + nx * reach - px * spread;
        const ey = oy + ny * reach - py * spread;

        graphics.fillGradientStyle(0, 0, 0, 0, from, from, to, 0);
        graphics.fillTriangle(ax, ay, bx, by, ex, ey);
        graphics.fillGradientStyle(0, 0, 0, 0, from, to, to, 0);
        graphics.fillTriangle(ax, ay, ex, ey, cx, cy);

        ax = cx;
        ay = cy;
        bx = ex;
        by = ey;
        from = to;
      }
    }
  },
};
