import { StateName } from "@server/types";
import { State } from "../state/State";
import { Idle } from "../state/Idle";
import { Walking } from "../state/Walking";
import { Running } from "../state/Running";
import { Jumping } from "../state/Jumping";
import { Casting } from "../state/Casting";
import { Slashing } from "../state/Slashing";

export class StateFactory {
    static create(names: StateName[]): Map<StateName, State> {
      const map: Record<StateName, State> = {
        [StateName.IDLE]: new Idle(),
        [StateName.WALKING]: new Walking(),
        [StateName.RUNNING]: new Running(),
        [StateName.JUMPING]: new Jumping(),
        [StateName.CASTING]: new Casting(),
        [StateName.SLASHING]: new Slashing(),
      };

    const states = new Map<StateName, State>();

    for (const name of names) states.set(name, map[name] || new Idle());

    return states;
  }
}
