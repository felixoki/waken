import { BehaviorName } from "@server/types";
import { Behavior } from "../behavior/Behavior";
import { Patrol } from "../behavior/Patrol";

export class BehaviorFactory {
  static create(names: BehaviorName[]): Behavior[] {
    const map: Record<BehaviorName, Behavior> = {
      [BehaviorName.PATROL]: new Patrol(),
    };

    const behaviors: Behavior[] = [];

    for (const name of names) behaviors.push(map[name]);

    return behaviors;
  }
}
