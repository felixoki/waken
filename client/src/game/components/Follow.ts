import { ComponentName, FollowConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class FollowComponent extends Component {
  name = ComponentName.FOLLOW;

  private entity: Entity;
  private config: FollowConfig;
  private target: Entity | null = null;

  constructor(entity: Entity, config: FollowConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  setTarget(target: Entity): void {
    this.target = target;
  }

  update(): void {
    if (!this.target) return;

    const offset = this.config.offsets[this.target.facing];
    const ox = offset?.x ?? 0;
    const oy = offset?.y ?? 0;

    this.entity.setPosition(this.target.x + ox, this.target.y + oy);
    this.entity.setDepth(this.target.depth);

    this.entity.components.forEach((c) => {
      if (c !== this) c.update();
    });
  }

  detach(): void {}
}
