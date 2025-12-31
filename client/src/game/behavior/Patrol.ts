import { BehaviorName, Direction, Input } from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";

export class Patrol extends Behavior {
  private start: number = 0;
  private direction: Direction = Direction.RIGHT;

  public name = BehaviorName.PATROL;

  constructor(repeat: boolean = true) {
    super();

    this.repeat = repeat;
  }

  update(entity: Entity): Partial<Input> {
    if (this.start === 0) this.start = entity.x;

    const distance = Math.abs(entity.x - this.start);

    if (distance >= 400) {
      this.direction =
        this.direction === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT;
      this.start = entity.x;
    }

    return {
      direction: this.direction,
      directions: [this.direction],
      isRunning: false,
      isJumping: false,
    }
  }

  reset(): void {
    this.start = 0;
    this.direction = Direction.RIGHT;
  }
}
