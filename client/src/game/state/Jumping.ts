import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import {
  DURATION_JUMPING,
  HEIGHT_JUMPING,
  SPEED_JUMPING,
} from "@server/globals";

export class Jumping implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  private tween: Phaser.Tweens.Tween | null = null;
  public name: StateName = StateName.JUMPING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    handlers.move.getVelocity(entity, SPEED_JUMPING);

    const baseOriginY = entity.displayOriginY;
    const baseOffsetY = entity.body
      ? (entity.body as Phaser.Physics.Arcade.Body).offset.y
      : 0;

    this.tween = entity.scene.tweens.add({
      targets: entity,
      displayOriginY: baseOriginY + HEIGHT_JUMPING,
      duration: DURATION_JUMPING / 2,
      yoyo: true,
      ease: "Sine.easeOut",

      onUpdate: () => {
        if (!entity.body) return;
        const body = entity.body as Phaser.Physics.Arcade.Body;
        const delta = entity.displayOriginY - baseOriginY;
        body.offset.y = baseOffsetY + delta;
      },
      
      onComplete: () => {
        if (!entity.body) return;
        const body = entity.body as Phaser.Physics.Arcade.Body;
        body.offset.y = baseOffsetY;
      },
    });

    this.timer = entity.scene.time.delayedCall(DURATION_JUMPING, () => {
      this.exit(entity);
    });
  }

  update(entity: Entity): void {
    handlers.move.getVelocity(entity, SPEED_JUMPING);
  }

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }

    if (!entity.body) return;

    (entity.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
