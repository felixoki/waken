import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class WetEffect extends Effect {
  name = EffectName.WET;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.entity.setTint(0x88aaff);
  }

  detach(): void {
    this.entity.clearTint();
  }
}
