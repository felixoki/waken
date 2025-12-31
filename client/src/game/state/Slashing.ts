import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DURATION_SLASHING } from "@server/globals";
import { handlers } from "../handlers";
import { Hitbox } from "../Hitbox";

export class Slashing implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  private hitbox: Hitbox | null = null;
  public name: StateName = StateName.SLASHING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION
    );
    anim?.play(this.name, entity.direction);

    this.timer = entity.scene.time.delayedCall(DURATION_SLASHING, () => {
      this.exit(entity);
    });

    const offset = handlers.combat.getDirectionalOffset(entity.direction, 16);

    this.hitbox = new Hitbox(
      entity.scene,
      entity.x + offset.x,
      entity.y + offset.y,
      16,
      16,
      entity.id
    );
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    this.hitbox?.destroy();

    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
