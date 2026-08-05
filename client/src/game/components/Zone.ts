import { ComponentName, ZoneConfig, ZoneName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class ZoneComponent extends Component {
  public name = ComponentName.ZONE;

  private entity: Entity;
  private config: ZoneConfig;

  constructor(entity: Entity, config: ZoneConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  get type(): ZoneName {
    return this.config.type;
  }

  get data(): ZoneConfig {
    return this.config;
  }

  contains(x: number, y: number): boolean {
    const { width, height } = this.config;

    return (
      Math.abs(x - this.entity.x) <= width / 2 &&
      Math.abs(y - this.entity.y) <= height / 2
    );
  }
}
