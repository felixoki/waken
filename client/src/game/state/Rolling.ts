import {
  ComponentName,
  StateName,
  Trigger,
  TriggerName,
} from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import {
  DURATION_ROLLING,
  ROLL_SWEEP_INTERVAL,
  SPEED_ROLLING,
} from "@server/globals";
import { handlers } from "../handlers";

export class Rolling implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  private sweep: Phaser.Time.TimerEvent | null = null;
  private triggers: Trigger[] = [];
  private struck: Set<string>[] = [];
  public name = StateName.ROLLING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    handlers.move.getVelocity(entity, SPEED_ROLLING * entity.speed);

    this.timer = entity.scene.time.delayedCall(DURATION_ROLLING, () => {
      this.exit(entity);
    });

    if (entity.scene.managers.players.player !== entity) return;

    this.triggers = handlers.trigger.resolve(entity, TriggerName.ROLL);

    if (!this.triggers.length) return;

    for (let i = 0; i < this.triggers.length; i++) {
      if (this.struck[i]) this.struck[i].clear();
      else this.struck[i] = new Set();
    }

    this.sweep = entity.scene.time.addEvent({
      delay: ROLL_SWEEP_INTERVAL,
      loop: true,
      callback: () => {
        for (let i = 0; i < this.triggers.length; i++)
          handlers.trigger.fire(
            entity,
            this.triggers[i],
            entity.x,
            entity.y,
            this.struck[i],
          );
      },
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    if (this.sweep) {
      this.sweep.destroy();
      this.sweep = null;
    }

    if (!entity.body) return;

    (entity.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
