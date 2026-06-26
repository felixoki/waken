import { ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { AnimationComponent } from "./Animation";

export class SkinComponent extends Component {
  public name = ComponentName.SKIN;

  constructor(
    private entity: Entity,
    private skin: string,
  ) {
    super();
  }

  attach(): void {
    this.entity
      .getComponent<AnimationComponent>(ComponentName.ANIMATION)
      ?.setSkin(this.skin);
  }

  detach(): void {
    this.entity
      .getComponent<AnimationComponent>(ComponentName.ANIMATION)
      ?.setSkin(null);
  }
}
