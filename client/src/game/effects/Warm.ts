import { EffectName } from "@server/types";
import { Effect } from "./Effect";

export class WarmEffect extends Effect {
  name = EffectName.WARM;
}
