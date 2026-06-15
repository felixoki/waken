import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import { DURATION_LIFT, HEIGHT_FLYING, SPEED_FLYING } from "@server/globals";
import { Entity } from "../Entity";

export class Flying implements State {
  private tween: Phaser.Tweens.Tween | null = null;
  private baseOriginY: number = 0;
  private baseOffsetY: number = 0;

  public name = StateName.FLYING;

  enter(entity: Entity): void {
    entity.setState(this.name);

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    this.baseOriginY = entity.displayOriginY;
    this.baseOffsetY = entity.body
      ? (entity.body as Phaser.Physics.Arcade.Body).offset.y
      : 0;

    if (entity.body)
      (entity.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;

    if (this.tween) this.tween.stop();

    this.tween = entity.scene.tweens.add({
      targets: entity,
      z: HEIGHT_FLYING,
      duration: DURATION_LIFT,
      ease: "Sine.easeOut",

      onUpdate: () => {
        entity.displayOriginY = this.baseOriginY + entity.z;

        if (entity.body) {
          const body = entity.body as Phaser.Physics.Arcade.Body;
          body.offset.y = this.baseOffsetY + entity.z;
        }
      },
    });

    this.update(entity);
  }

  update(entity: Entity): void {
    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    handlers.move.getVelocity(entity, SPEED_FLYING);
  }

  exit(entity: Entity): void {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }

    const body = entity.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    entity.scene.tweens.add({
      targets: entity,
      z: 0,
      duration: DURATION_LIFT,
      ease: "Sine.easeIn",

      onUpdate: () => {
        entity.displayOriginY = this.baseOriginY + entity.z;
        if (entity.body) {
          (entity.body as Phaser.Physics.Arcade.Body).offset.y =
            this.baseOffsetY + entity.z;
        }
      },

      onComplete: () => {
        entity.z = 0;
        entity.displayOriginY = this.baseOriginY;

        if (entity.body) {
          const body = entity.body as Phaser.Physics.Arcade.Body;
          body.offset.y = this.baseOffsetY;
          body.checkCollision.none = false;
        }
      },
    });
  }
}
