import { ComponentName } from "@server/types";
import { Component } from "./Component";

export class DestructibleComponent extends Component {
  public name = ComponentName.DESTRUCTIBLE;

  attach(): void {}
  update(): void {}
  detach(): void {}
}
