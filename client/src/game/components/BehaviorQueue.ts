import { ComponentName, Input } from "@server/types";
import { Behavior } from "../behavior/Behavior";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class BehaviorQueue extends Component {
  private entity: Entity;
  private queue: Behavior[] = [];
  private current: Behavior | null = null;

  public name = ComponentName.BEHAVIOR_QUEUE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {}

  update(): Partial<Input> | null {
    if (!this.current && this.queue.length)
      this.current = this.queue.shift() || null;

    if (!this.current) return null;

    const input = this.current.update(this.entity);

    if (this.current.completed) {
      if (this.current.repeat) {
        this.current.reset();
        this.queue.push(this.current);
      }

      this.current = null;
    }

    return input;
  }

  add(behavior: Behavior): void {
    this.queue.push(behavior);
  }

  detach(): void {}
}
