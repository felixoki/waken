import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DURATION_ROLLING, SPEED_ROLLING } from "@server/globals";
import { handlers } from "../handlers";

export class Rolling implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  public name = StateName.ROLLING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.direction);

    handlers.move.getVelocity(entity, SPEED_ROLLING);

    this.timer = entity.scene.time.delayedCall(DURATION_ROLLING, () => {
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    entity.body.setVelocity(0, 0);

    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
