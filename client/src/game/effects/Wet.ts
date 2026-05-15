import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class WetEffect extends Effect {
  name = EffectName.WET;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0x88aaff;
    this.entity.setTint(this.tint);
  }

  detach(): void {}
}
