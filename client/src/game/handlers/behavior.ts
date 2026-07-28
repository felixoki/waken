import { BehaviorName, ComponentName, Input, StateName, Waypoint } from "@server/types";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { Entity } from "../Entity";
import { FleeBehavior } from "../behavior/Flee";
import { AttackBehavior } from "../behavior/Attack";
import { DefendBehavior } from "../behavior/Defend";
import { SearchBehavior } from "../behavior/Search";
import { handlers } from "./index";

export const behavior: {
  react: (entity: Entity, targetId: string) => void;
  search: (entity: Entity, position: Waypoint | null) => void;
  lookAround: (entity: Entity, attack: AttackBehavior) => Partial<Input>;
  retarget: (entity: Entity, attack: AttackBehavior) => boolean;
} = {
  react: (entity: Entity, targetId: string) => {
    const queue = entity.getComponent<BehaviorQueue>(
      ComponentName.BEHAVIOR_QUEUE,
    );
    if (!queue) return;

    const flee = queue.get<FleeBehavior>(BehaviorName.FLEE);

    if (flee) {
      flee.start(targetId);
      queue.shiftTo(BehaviorName.FLEE);
      return;
    }

    const defend = queue.get<DefendBehavior>(BehaviorName.DEFEND);

    if (defend) {
      queue.shiftTo(BehaviorName.DEFEND);
      return;
    }

    const attack = queue.get<AttackBehavior>(BehaviorName.ATTACK);

    if (attack) {
      attack.start(targetId);
      queue.shiftTo(BehaviorName.ATTACK);
    }
  },

  search: (entity: Entity, position: Waypoint | null) => {
    if (!position) return;

    const queue = entity.getComponent<BehaviorQueue>(
      ComponentName.BEHAVIOR_QUEUE,
    );
    if (!queue) return;

    const search = queue.get<SearchBehavior>(BehaviorName.SEARCH);
    if (!search) return;

    search.start();
    queue.shiftTo(BehaviorName.SEARCH);
  },

  lookAround: (entity: Entity, attack: AttackBehavior): Partial<Input> => {
    if (!attack.alert.active) {
      attack.alert.active = true;
      attack.alert.time = 0;
    }

    attack.alert.time += entity.scene.game.loop.delta;

    if (attack.alert.time < attack.alert.duration) {
      let facing = entity.facing;

      if (attack.target.lastPosition) {
        const angle = Phaser.Math.Angle.Between(
          entity.x,
          entity.y,
          attack.target.lastPosition.x,
          attack.target.lastPosition.y,
        );
        facing = handlers.direction.fromAngle(angle);
      }

      return { facing, moving: [], isRunning: false };
    }

    if (behavior.retarget(entity, attack)) return attack.update(entity);

    attack.alert.active = false;
    attack.completed = true;
    
    behavior.search(entity, attack.target.lastPosition);

    return { facing: entity.facing, moving: [], isRunning: false };
  },

  retarget: (entity: Entity, attack: AttackBehavior): boolean => {
    const players = entity.scene.managers.players.all.filter(
      (p) =>
        p &&
        p.id !== attack.target.id &&
        p.map === entity.map &&
        p.state !== StateName.DEAD,
    );

    let best: { id: string; dist: number } | null = null;

    for (const player of players) {
      if (
        !handlers.vision.canSee(
          entity.scene,
          entity,
          player,
          600,
          Math.PI * 2,
          7,
        )
      )
        continue;

      const dist = Phaser.Math.Distance.Between(
        entity.x,
        entity.y,
        player.x,
        player.y,
      );

      if (!best || dist < best.dist) best = { id: player.id, dist };
    }

    if (!best) return false;

    attack.start(best.id);

    return true;
  },
};
