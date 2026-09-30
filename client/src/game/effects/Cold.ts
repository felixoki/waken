import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class ColdEffect extends Effect {
  name = EffectName.COLD;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0xa8d4ff;
    this.entity.setTint(this.tint);
  }
}
