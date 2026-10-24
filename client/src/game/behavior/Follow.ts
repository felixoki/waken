import {
  BehaviorName,
  ComponentName,
  Input,
  StateName,
  Stuck,
  Waypoint,
} from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { AmbleBehavior } from "./Amble";
import {
  FOLLOW_FAR,
  FOLLOW_LEASH,
  FOLLOW_NEAR,
  FOLLOW_REPLAN,
  PATH_ARRIVAL,
} from "@server/globals";

export class FollowBehavior extends Behavior {
  private path: Waypoint[] = [];
  private goal: Waypoint | null = null;
  private resting = false;
  private stuck: Stuck = {
    lastPosition: { x: 0, y: 0 },
    lastCheck: 0,
    interval: 200,
  };

  public name = BehaviorName.FOLLOW;

  constructor() {
    super();
    this.repeat = true;
  }

  update(entity: Entity): Partial<Input> {
    const id = entity.tame.follows;
    const target = id ? entity.scene.managers.players.get(id) : undefined;

    if (!target || target.map !== entity.map) return this._finish(entity);

    const distance = Math.hypot(target.x - entity.x, target.y - entity.y);

    if (distance <= FOLLOW_NEAR) this.resting = true;
    else if (distance > FOLLOW_LEASH) this.resting = false;

    if (this.resting) {
      this.path = [];
      this.goal = null;

      const angle = Phaser.Math.Angle.Between(
        entity.x,
        entity.y,
        target.x,
        target.y,
      );

      return {
        facing: handlers.direction.fromAngle(angle, entity.facing),
        moving: [],
        isRunning: false,
      };
    }

    const now = entity.scene.time.now;
    const moved =
      !this.goal ||
      Math.hypot(target.x - this.goal.x, target.y - this.goal.y) >
        FOLLOW_REPLAN;

    if (
      moved ||
      !this.path.length ||
      handlers.path.stuck(entity, this.stuck, now, 4)
    ) {
      this.goal = { x: target.x, y: target.y };
      this.path = handlers.path.plan(entity, this.goal, false) ?? [];
    }

    const input = handlers.path.follow(
      entity,
      this.path,
      PATH_ARRIVAL,
      distance > FOLLOW_FAR && !!entity.states?.has(StateName.RUNNING),
    );

    return input ?? { facing: entity.facing, moving: [], isRunning: false };
  }

  reset(): void {
    this.path = [];
    this.goal = null;
    this.resting = false;
    this.completed = false;
  }

  private _finish(entity: Entity): Partial<Input> {
    this.completed = true;

    entity
      .getComponent<BehaviorQueue>(ComponentName.BEHAVIOR_QUEUE)
      ?.get<AmbleBehavior>(BehaviorName.AMBLE)
      ?.settle();

    return { facing: entity.facing, moving: [], isRunning: false };
  }
}
