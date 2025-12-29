import { ComponentName, StateName } from "@server/types";
import { Entity } from "../Entity";
import { State } from "./State";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";

export class Walking implements State {
  public name = StateName.WALKING;

  enter(entity: Entity): void {
    entity.setState(this.name);

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION
    );
    anim?.play(this.name, entity.direction);

    this.update(entity);
  }

  update(entity: Entity): void {
    handlers.move.getVelocity(entity, 200);
  }

  exit(entity: Entity): void {
    if (!entity.body) return;

    entity.body.setVelocity(0, 0);
  }
}
