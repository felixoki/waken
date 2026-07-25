import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class MomentumEffect extends Effect {
  name = EffectName.MOMENTUM;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0xffcc33;
    this.entity.setTint(this.tint);
  }

  detach(): void {}
}
