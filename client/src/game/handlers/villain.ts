import { TRANSFORM_RANGE } from "@server/globals";
import { handlers } from ".";
import { Villain } from "../Villain";
import {
  DragonAction,
  DragonActionName,
  EffectName,
  Input,
  SpellName,
  StateName,
} from "@server/types";

const ARRIVE_RADIUS = 32;
const BITE_RANGE = 120;
const ENGAGE_COUNT = 2;
const REPOSITION_DISTANCE = 320;

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

  plan: (villain: Villain): void => {
    const nearest = handlers.player.nearest(villain);
    if (!nearest) return;

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

  freeLocation: (villain: Villain): { x: number; y: number } => {
    const nearest = handlers.player.nearest(villain);
    const px = nearest?.player.x ?? villain.x;
    const py = nearest?.player.y ?? villain.y;
    const angle = Math.random() * Math.PI * 2;

    return {
      x: px + Math.cos(angle) * REPOSITION_DISTANCE,
      y: py + Math.sin(angle) * REPOSITION_DISTANCE,
    };
  },
};
