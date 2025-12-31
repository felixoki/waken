import { BodyConfig, ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class BodyComponent extends Component {
  private entity: Entity;
  private config: BodyConfig;

  public name: ComponentName = ComponentName.BODY;

  constructor(entity: Entity, config: BodyConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    this.entity.body.setSize(this.config.width, this.config.height);
    this.entity.body.setOffset(this.config.offsetX, this.config.offsetY);
    this.entity.body.pushable = this.config.pushable || false;
  }

  update(): void {}

  detach(): void {}
}
