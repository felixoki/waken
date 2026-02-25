import {
  AmbleBehaviorConfig,
  BehaviorConfig,
  BehaviorName,
  FleeBehaviorConfig,
  PatrolBehaviorConfig,
  WanderBehaviorConfig,
} from "@server/types";
import { Behavior } from "../behavior/Behavior";
import { PatrolBehavior } from "../behavior/Patrol";
import { AttackBehavior } from "../behavior/Attack";
import { StayBehavior } from "../behavior/Stay";
import { AmbleBehavior } from "../behavior/Amble";
import { WanderBehavior } from "../behavior/Wander";
import { FleeBehavior } from "../behavior/Flee";

export class BehaviorFactory {
  static create(cfgs: BehaviorConfig[]): Behavior[] {
    const behaviors: Behavior[] = [];

    for (const config of cfgs) {
      const map: Record<BehaviorName, Behavior> = {
        [BehaviorName.PATROL]: new PatrolBehavior(
          (
            config as {
              name: BehaviorName.PATROL;
              config?: PatrolBehaviorConfig;
            }
          ).config,
        ),
        [BehaviorName.ATTACK]: new AttackBehavior(),
        [BehaviorName.STAY]: new StayBehavior(),
        [BehaviorName.AMBLE]: new AmbleBehavior(
          (config as { name: BehaviorName.AMBLE; config?: AmbleBehaviorConfig })
            .config,
        ),
        [BehaviorName.FLEE]: new FleeBehavior(
          (config as { name: BehaviorName.FLEE; config?: FleeBehaviorConfig })
            .config,
        ),
        [BehaviorName.WANDER]: new WanderBehavior(
          (
            config as {
              name: BehaviorName.WANDER;
              config?: WanderBehaviorConfig;
            }
          ).config,
        ),
      };

      if (map[config.name]) behaviors.push(map[config.name]);
    }

    return behaviors;
  }
}
