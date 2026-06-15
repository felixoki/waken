import { ComponentName, JumpableConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class JumpableComponent extends Component {
  private entity: Entity;
  private config: JumpableConfig;

  public name = ComponentName.JUMPABLE;

  constructor(entity: Entity, config: JumpableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    this.entity.clearance = this.config.clearance;
  }

  detach(): void {
    this.entity.clearance = undefined;
  }
}
