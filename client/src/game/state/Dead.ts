import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";

export class Dead implements State {
  public name = StateName.DEAD;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    (entity.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 0);

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(StateName.IDLE, entity.facing);

    entity.setAlpha(0.4);
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    entity.isLocked = false;
    entity.setAlpha(1);
  }
}
