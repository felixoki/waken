import { BehaviorName, Input } from "@server/types";
import { Entity } from "../Entity";

export abstract class Behavior {
  public name!: BehaviorName;
  public completed: boolean = false;
  public repeat: boolean = false;

  abstract update(entity: Entity): Partial<Input>;
  abstract reset(): void;
}
