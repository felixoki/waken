import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import { SPEED_RUNNING } from "@server/globals";
import { Entity } from "../Entity";

export class Running implements State {
  public name = StateName.RUNNING;

  enter(entity: Entity): void {
    entity.setState(this.name);

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    this.update(entity);
  }

  update(entity: Entity): void {
    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    handlers.move.getVelocity(entity, SPEED_RUNNING);
  }

  exit(entity: Entity): void {
    const body = entity.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}
