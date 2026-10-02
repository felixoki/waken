import { ComponentName, DestructibleConfig } from "@server/types";
import { Component } from "./Component";

export class DestructibleComponent extends Component {
  public config?: DestructibleConfig;

  public name = ComponentName.DESTRUCTIBLE;

  constructor(config?: DestructibleConfig) {
    super();

    this.config = config;
  }

  attach(): void {}
  update(): void {}
  detach(): void {}
}
