import { BehaviorConfig, BehaviorName } from "@server/types";
import { Behavior } from "../behavior/Behavior";
import { PatrolBehavior } from "../behavior/Patrol";
import { AttackBehavior } from "../behavior/Attack";
import { StayBehavior } from "../behavior/Stay";
import { AmbleBehavior } from "../behavior/Amble";
import { WanderBehavior } from "../behavior/Wander";
import { FleeBehavior } from "../behavior/Flee";

export class BehaviorFactory {
  static create(behaviors: BehaviorConfig[]): Behavior[] {
    const array: Behavior[] = [];

    for (const behavior of behaviors) {
      let be: Behavior | null = null;

      switch (behavior.name) {
        case BehaviorName.PATROL:
          be = new PatrolBehavior(behavior.config);
          break;
        case BehaviorName.ATTACK:
          be = new AttackBehavior();
          break;
        case BehaviorName.STAY:
          be = new StayBehavior();
          break;
        case BehaviorName.AMBLE:
          be = new AmbleBehavior(behavior.config);
          break;
        case BehaviorName.FLEE:
          be = new FleeBehavior(behavior.config);
          break;
        case BehaviorName.WANDER:
          be = new WanderBehavior(behavior.config);
          break;
      }

      if (be) array.push(be);
    }

    return array;
  }
}
