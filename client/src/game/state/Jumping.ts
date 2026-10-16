import { ComponentName, SoundName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import { DURATION_JUMPING, HEIGHT_JUMPING } from "@server/globals";
import { configs } from "@server/configs";

export class Jumping implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  private tween: Phaser.Tweens.Tween | null = null;
  private baseOriginY: number = 0;
  private baseOffsetY: number = 0;

  public name: StateName = StateName.JUMPING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    entity.scene.managers.sound.play.sfx(SoundName.JUMP, {
      position: { x: entity.x, y: entity.y },
    });

    const config = configs.animations[entity.name]?.[StateName.JUMPING];
    const [from, to] = config?.airborne ?? [0, 0];
    const delay = config && to ? (from / config.frameRate) * 1000 : 0;
    const air =
      config && to ? ((to - from) / config.frameRate) * 1000 : DURATION_JUMPING;
    const distance = entity.getComponent(ComponentName.BEHAVIOR_QUEUE)
      ? handlers.path.reach(entity, entity.facing, entity.target)
      : handlers.path.range(entity);
    const speed = (distance / air) * 1000;

    if (delay) (entity.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 0);
    else handlers.move.getVelocity(entity, speed);

    this.baseOriginY = entity.displayOriginY;
    this.baseOffsetY = entity.body
      ? (entity.body as Phaser.Physics.Arcade.Body).offset.y
      : 0;

    this.tween = entity.scene.tweens.add({
      targets: entity,
      z: HEIGHT_JUMPING,
      delay,
      duration: air / 2,
      yoyo: true,
      ease: "Sine.easeOut",

      onUpdate: () => {
        if (!entity.body) return;
        const body = entity.body as Phaser.Physics.Arcade.Body;
        handlers.move.getVelocity(entity, speed);
        entity.displayOriginY = this.baseOriginY + entity.z;
        body.offset.y = this.baseOffsetY + entity.z;
        entity.setDepth(1000 + entity.y);
      },

      onComplete: () =>
        (entity.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 0),
    });

    this.timer = entity.scene.time.delayedCall(DURATION_JUMPING, () => {
      entity.scene.managers.sound.play.sfx(SoundName.LAND, {
        position: { x: entity.x, y: entity.y },
      });
      this.exit(entity);
    });
  }

  update(): void {}

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }

    entity.z = 0;
    entity.displayOriginY = this.baseOriginY;

    if (entity.body)
      (entity.body as Phaser.Physics.Arcade.Body).offset.y = this.baseOffsetY;

    if (!entity.body) return;

    (entity.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
