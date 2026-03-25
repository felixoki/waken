import { CollectorConfig, ComponentName } from "@server/types";
import { Component } from "./Component";

export class CollectorComponent extends Component {
  public config: CollectorConfig;

  public name = ComponentName.COLLECTOR;

  constructor(config: CollectorConfig) {
    super();

    this.config = config;
  }

  attach(): void {}

  update(): void {}

  detach(): void {}
}
