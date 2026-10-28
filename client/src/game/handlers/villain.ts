import { TRANSFORM_RANGE } from "@server/globals";
import { handlers } from ".";
import { Villain } from "../Villain";
import {
  DragonAction,
  DragonActionName,
  EffectName,
  Event,
  Input,
  SpellName,
  StateName,
} from "@server/types";

const ARRIVE_RADIUS = 32;
const BITE_RANGE = 120;
const ENGAGE_COUNT = 2;
const REPOSITION_DISTANCE = 320;
const ISLE_LAYER = "ground3";
const LAND_TRIES = 12;
const LAND_DISTANCES = [1, 0.75, 0.5];

export const villain = {
  think: (villain: Villain): Partial<Input> | null => {
    const idle = { facing: villain.facing, moving: [], isRunning: false };

    if (villain.isTransforming && !villain.isLocked) {
      villain.isTransforming = false;
      return idle;
    }

    if (villain.isLocked) return idle;

    if (villain.hasEffect(EffectName.DRAGON)) {
      villain.spell = null;

      if (!villain.actions.length) handlers.villain.plan(villain);
      return handlers.villain.execute(villain) ?? idle;
    }

    if (!villain.isEngaged) {
      if (!villain.isEncountered && handlers.villain.landed(villain)) {
        villain.isEncountered = true;
        villain.scene.game.events.emit(Event.VILLAIN_ENCOUNTER, villain.id);
      }

      return idle;
    }

    const nearest = handlers.player.nearest(villain);
    if (!nearest || nearest.distance > TRANSFORM_RANGE) return idle;

    const angle = Phaser.Math.Angle.Between(
      villain.x,
      villain.y,
      nearest.player.x,
      nearest.player.y,
    );
    const facing = handlers.direction.fromAngle(angle);

    villain.target = { x: villain.x, y: villain.y };
    villain.isTransforming = true;

    return {
      facing,
      moving: [],
      isRunning: false,
      state: StateName.CASTING,
      target: { x: villain.x, y: villain.y },
    };
  },

  isle: (villain: Villain): Uint8Array => {
    const map = villain.scene.tileManager.map;
    const layer = map.getLayer(ISLE_LAYER);
    const { width, height } = map;
    const isle = new Uint8Array(width * height);
    if (!layer) return isle;

    const solid = (i: number) =>
      (layer.data[Math.floor(i / width)][i % width]?.index ?? -1) > 0;

    const tx = Math.floor(villain.x / map.tileWidth);
    const ty = Math.floor(villain.y / map.tileHeight);
    const start = ty * width + tx;
    if (tx < 0 || ty < 0 || tx >= width || ty >= height || !solid(start))
      return isle;

    const stack = [start];
    isle[start] = 1;

    while (stack.length) {
      const i = stack.pop()!;
      const x = i % width;
      const neighbours = [
        x > 0 ? i - 1 : -1,
        x < width - 1 ? i + 1 : -1,
        i - width,
        i + width,
      ];

      for (const n of neighbours) {
        if (n < 0 || n >= isle.length || isle[n] || !solid(n)) continue;
        isle[n] = 1;
        stack.push(n);
      }
    }

    return isle;
  },

  landed: (villain: Villain): boolean => {
    const isle = (villain.isle ??= handlers.villain.isle(villain));
    const map = villain.scene.tileManager.map;

    return villain.scene.managers.players.all.some((player) => {
      if (!player || player.map !== villain.map) return false;
      if (player.state === StateName.JUMPING || player.state === StateName.DEAD)
        return false;

      const { x, y } = handlers.path.position(player);
      const tx = Math.floor(x / map.tileWidth);
      const ty = Math.floor(y / map.tileHeight);
      if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;

      return isle[ty * map.width + tx] === 1;
    });
  },

  plan: (villain: Villain): void => {
    const nearest = handlers.player.nearest(villain);
    if (!nearest) return;

    villain.stuck.lastCheck = villain.scene.time.now;
    villain.stuck.lastPosition = { x: villain.x, y: villain.y };

    if (villain.engagements >= ENGAGE_COUNT) {
      villain.engagements = 0;
      const spot = handlers.villain.freeLocation(villain);

      villain.actions.push({
        name: DragonActionName.FLY_TO,
        x: spot.x,
        y: spot.y,
      });
      villain.actions.push({
        name: DragonActionName.CAST,
        spell: SpellName.METEOR_SHOWER,
      });

      return;
    }

    villain.engagements++;
    const { player, distance } = nearest;

    if (distance <= BITE_RANGE) {
      villain.actions.push({
        name: DragonActionName.CAST,
        spell: SpellName.BITE,
      });

      return;
    }

    villain.actions.push({
      name: DragonActionName.WALK_TO,
      x: player.x,
      y: player.y,
    });
    villain.actions.push({
      name: DragonActionName.CAST,
      spell: SpellName.FIRE_BREATH,
    });
  },

  cast: (villain: Villain, action: DragonAction): Partial<Input> | null => {
    const nearest = handlers.player.nearest(villain);
    if (!nearest) return null;

    const angle = Phaser.Math.Angle.Between(
      villain.x,
      villain.y,
      nearest.player.x,
      nearest.player.y,
    );
    villain.target = { x: nearest.player.x, y: nearest.player.y };

    villain.actions.shift();
    villain.spell = action.name === DragonActionName.CAST ? action.spell : null;

    return {
      facing: handlers.direction.fromAngle(angle),
      moving: [],
      isRunning: false,
      state: StateName.CASTING,
      spell: villain.spell,
      target: { x: nearest.player.x, y: nearest.player.y },
    };
  },

  execute: (villain: Villain): Partial<Input> | null => {
    const action = villain.actions[0];
    if (!action) return null;

    switch (action.name) {
      case DragonActionName.CAST:
        return handlers.villain.cast(villain, action);
      case DragonActionName.WALK_TO:
      case DragonActionName.FLY_TO:
        return handlers.villain.move(villain, action);
    }
  },

  move: (villain: Villain, action: DragonAction): Partial<Input> | null => {
    if (
      action.name !== DragonActionName.WALK_TO &&
      action.name !== DragonActionName.FLY_TO
    )
      return null;

    const dx = action.x - villain.x;
    const dy = action.y - villain.y;
    const distance = Math.hypot(dx, dy);

    const now = villain.scene.time.now;

    if (
      distance <= ARRIVE_RADIUS ||
      handlers.path.stuck(villain, villain.stuck, now, 2)
    ) {
      villain.actions.shift();
      return handlers.villain.execute(villain);
    }

    villain.target = { x: action.x, y: action.y };

    const angle = Phaser.Math.Angle.Between(
      villain.x,
      villain.y,
      action.x,
      action.y,
    );
    const direction = handlers.direction.fromAngle(angle, villain.facing);

    return {
      facing: direction,
      moving: [direction],
      isRunning: false,
      isFlying: action.name === DragonActionName.FLY_TO,
    };
  },

  ground: (villain: Villain, x: number, y: number): boolean => {
    const tiles = villain.scene.tileManager;
    const map = tiles.map;
    const grid = tiles.getCollisionGrid();
    const isle = (villain.isle ??= handlers.villain.isle(villain));
    const body = villain.body as Phaser.Physics.Arcade.Body;
    const rx = body.halfWidth + ARRIVE_RADIUS;
    const ry = body.halfHeight + ARRIVE_RADIUS;

    const x0 = Math.floor((x - rx) / map.tileWidth);
    const x1 = Math.floor((x + rx) / map.tileWidth);
    const y0 = Math.floor((y - ry) / map.tileHeight);
    const y1 = Math.floor((y + ry) / map.tileHeight);

    if (x0 < 0 || y0 < 0 || x1 >= map.width || y1 >= map.height) return false;

    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++)
        if (!isle[ty * map.width + tx] || grid[ty][tx]) return false;

    return true;
  },

  freeLocation: (villain: Villain): { x: number; y: number } => {
    const nearest = handlers.player.nearest(villain);
    const self = handlers.path.position(villain);
    const origin = nearest?.player ?? self;
    const ox = self.x - villain.x;
    const oy = self.y - villain.y;
    const start = Math.random() * Math.PI * 2;

    for (const scale of LAND_DISTANCES)
      for (let i = 0; i < LAND_TRIES; i++) {
        const angle = start + (i / LAND_TRIES) * Math.PI * 2;
        const x = origin.x + Math.cos(angle) * REPOSITION_DISTANCE * scale;
        const y = origin.y + Math.sin(angle) * REPOSITION_DISTANCE * scale;

        if (handlers.villain.ground(villain, x, y))
          return { x: x - ox, y: y - oy };
      }

    return { x: villain.x, y: villain.y };
  },
};
