import { StateName } from "@server/types";
import { State } from "../state/State";
import { Idle } from "../state/Idle";
import { Walking } from "../state/Walking";
import { Running } from "../state/Running";
import { Flying } from "../state/Flying";
import { Jumping } from "../state/Jumping";
import { Casting } from "../state/Casting";
import { Slashing } from "../state/Slashing";
import { Rolling } from "../state/Rolling";
import { Dashing } from "../state/Dashing";
import { Dead } from "../state/Dead";
import { Throwing } from "../state/Throwing";
import { Fishing } from "../state/Fishing";

export class StateFactory {
    static create(names: StateName[]): Map<StateName, State> {
      const map: Record<StateName, State> = {
        [StateName.IDLE]: new Idle(),
        [StateName.WALKING]: new Walking(),
        [StateName.RUNNING]: new Running(),
        [StateName.FLYING]: new Flying(),
        [StateName.JUMPING]: new Jumping(),
        [StateName.CASTING]: new Casting(),
        [StateName.SLASHING]: new Slashing(),
        [StateName.ROLLING]: new Rolling(),
        [StateName.DASHING]: new Dashing(),
        [StateName.THROWING]: new Throwing(),
        [StateName.FISHING]: new Fishing(),
        [StateName.DEAD]: new Dead(),
      };

    const states = new Map<StateName, State>();

    for (const name of names) states.set(name, map[name] || new Idle());

    return states;
  }
}
