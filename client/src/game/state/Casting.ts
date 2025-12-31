import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { DURATION_CASTING } from "@server/globals";
import { handlers } from "../handlers";
import { Projectile } from "../Projectile";

export class Casting implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  public name: StateName = StateName.CASTING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION
    );
    anim?.play(this.name, entity.direction);

    this.timer = entity.scene.time.delayedCall(DURATION_CASTING, () => {
      this.exit(entity);
    });

    const direction = entity.directions.length
      ? handlers.combat.getDiagonalDirectionVector(entity.directions)
      : handlers.combat.getDirectionVector(entity.direction);

    new Projectile(
      entity.scene,
      entity.x + direction.x * 20,
      entity.y + direction.y * 20,
      16,
      16,
      entity.id,
      200,
      1000,
      direction
    );
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
