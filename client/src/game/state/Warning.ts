import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DURATION_WARNING } from "@server/globals";
import { configs } from "@server/configs";

export class Warning implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  public name: StateName = StateName.WARNING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    const sound = configs.entities[entity.name]?.attacks?.find(
      (a) => a.state === this.name,
    )?.sound;
    if (sound)
      entity.scene.managers.sound.play.sfx(sound, {
        position: { x: entity.x, y: entity.y },
      });

    this.timer = entity.scene.time.delayedCall(DURATION_WARNING, () => {
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    this.timer?.destroy();
    this.timer = null;

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
