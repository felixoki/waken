import { CollectorConfig, ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class CollectorComponent extends Component {
  private entity: Entity;
  public config: CollectorConfig;

  public name = ComponentName.COLLECTOR;

  constructor(entity: Entity, config: CollectorConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {}

  update(): void {}

  detach(): void {}
}
