import {
  ComponentName,
  EntityName,
  StateName,
} from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { HoverableComponent } from "../components/Hoverable";
import { PointableComponent } from "../components/Pointable";
import { ReviveableComponent } from "../components/Reviveable";

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

    if (entity.name === EntityName.PLAYER) this._enable(entity);
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    entity.isLocked = false;
    entity.setAlpha(1);

    if (entity.name === EntityName.PLAYER) this._disable(entity);
  }

  private _enable(entity: Entity): void {
    entity.addComponent(new HoverableComponent(entity));
    entity.addComponent(new PointableComponent(entity));
    entity.addComponent(new ReviveableComponent(entity));
  }

  private _disable(entity: Entity): void {
    entity.removeComponent(ComponentName.REVIVEABLE);
    entity.removeComponent(ComponentName.POINTABLE);
    entity.removeComponent(ComponentName.HOVERABLE);
  }
}
