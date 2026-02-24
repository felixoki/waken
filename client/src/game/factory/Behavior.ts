import {
  AmbleBehaviorConfig,
  BehaviorConfig,
  BehaviorName,
  PatrolBehaviorConfig,
} from "@server/types";
import { Behavior } from "../behavior/Behavior";
import { Patrol } from "../behavior/Patrol";
import { Attack } from "../behavior/Attack";
import { Stay } from "../behavior/Stay";
import { Amble } from "../behavior/Amble";

export class BehaviorFactory {
  static create(cfgs: BehaviorConfig[]): Behavior[] {
    const behaviors: Behavior[] = [];

    for (const config of cfgs) {
      const map: Record<BehaviorName, Behavior> = {
        [BehaviorName.PATROL]: new Patrol(
          (config as { name: BehaviorName.PATROL; config?: PatrolBehaviorConfig })
            .config,
        ),
        [BehaviorName.ATTACK]: new Attack(),
        [BehaviorName.STAY]: new Stay(),
        [BehaviorName.AMBLE]: new Amble(
          (config as { name: BehaviorName.AMBLE; config?: AmbleBehaviorConfig })
            .config,
        ),
      };

      if (map[config.name]) behaviors.push(map[config.name]);
    }

    return behaviors;
  }
}
