import { BehaviorName, Input } from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";

export class StayBehavior extends Behavior {
  public name = BehaviorName.STAY;

  constructor() {
    super();
    this.repeat = true;
  }

  update(_entity: Entity): Partial<Input> {
    return {
      moving: [],
      isRunning: false,
    };
  }

  reset(): void {
    this.completed = false;
  }
}
