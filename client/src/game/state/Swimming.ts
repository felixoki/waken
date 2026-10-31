import { ComponentName, StateName } from "@server/types";
import { Entity } from "../Entity";
import { State } from "./State";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import { SPEED_SWIMMING } from "@server/globals";

export class Swimming implements State {
  public name = StateName.SWIMMING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    this.update(entity);
  }

  update(entity: Entity): void {
    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(
      entity.moving.length ? StateName.WALKING : StateName.IDLE,
      entity.facing,
    );

    handlers.move.getVelocity(entity, SPEED_SWIMMING * entity.speed);
  }

  exit(entity: Entity): void {
    const body = entity.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}
