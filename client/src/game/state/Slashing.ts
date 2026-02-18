import { ComponentName, StateName, WeaponName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DURATION_SLASHING } from "@server/globals";
import { handlers } from "../handlers";
import { Hitbox } from "../Hitbox";
import { configs } from "@server/configs";

export class Slashing implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  private hitbox: Hitbox | null = null;
  public name: StateName = StateName.SLASHING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    this.timer = entity.scene.time.delayedCall(DURATION_SLASHING, () => {
      this.exit(entity);
    });

    const offset = handlers.direction.getDirectionalOffset(
      entity.facing,
      24,
    );
    const config = configs.weapons[WeaponName.SLASH];

    handlers.weapons[WeaponName.SLASH](entity, config, offset);
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
