import { BehaviorName, Direction, Input } from "@server/types";
import { Behavior } from "./Behavior";
import { Entity } from "../Entity";
import { handlers } from "../handlers";

type Phase = "think" | "move" | "look";

export class SearchBehavior extends Behavior {
  private phase: Phase = "move";
  private timer: number = 0;
  private heading: number | null = null;
  private direction: Direction = Direction.DOWN;
  private looks: number = 0;
  private maxLooks: number = 0;

  public name = BehaviorName.SEARCH;

  constructor() {
    super();
    this.repeat = true;
  }

  start(): void {
    this.completed = false;
    this.heading = null;
    this.looks = 0;
    this.maxLooks = 2 + Math.floor(Math.random() * 2);
    this.phase = "think";
    this.timer = 700 + Math.random() * 600;
  }

  update(entity: Entity): Partial<Input> {
    if (entity.isLocked) return {};

    this.timer -= entity.scene.game.loop.delta;

    if (this.phase === "think") {
      if (this.timer > 0)
        return { facing: entity.facing, moving: [], isRunning: false };

      this.direction = this._pick(entity);
      this.phase = "move";
      this.timer = this._duration();

      return {
        facing: this.direction,
        moving: [this.direction],
        isRunning: false,
      };
    }

    if (this.timer > 0) {
      if (this.phase === "move")
        return {
          facing: this.direction,
          moving: [this.direction],
          isRunning: false,
        };

      return { facing: this.direction, moving: [], isRunning: false };
    }

    if (this.phase === "move") {
      this.phase = "look";
      this.timer = 500 + Math.random() * 900;

      return { facing: this.direction, moving: [], isRunning: false };
    }

    this.looks++;

    if (this.looks >= this.maxLooks) {
      this.completed = true;
      return { facing: this.direction, moving: [], isRunning: false };
    }

    this.direction = this._pick(entity);
    this.phase = "move";
    this.timer = this._duration();

    return {
      facing: this.direction,
      moving: [this.direction],
      isRunning: false,
    };
  }

  reset(): void {
    this.heading = null;
    this.looks = 0;
    this.phase = "think";
    this.timer = 0;
  }

  private _duration(): number {
    return 400 + Math.random() * 300;
  }

  private _pick(entity: Entity): Direction {
    for (let i = 0; i < 4; i++) {
      if (this.heading === null) this.heading = Math.random() * Math.PI * 2;
      else this.heading += Math.PI + (Math.random() - 0.5);

      const dx = Math.cos(this.heading);
      const dy = Math.sin(this.heading);

      if (handlers.path.isClear(entity, dx, dy, 48)) break;
    }

    return handlers.direction.fromAngle(this.heading!);
  }
}

