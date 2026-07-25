import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class GreaseEffect extends Effect {
  name = EffectName.GREASE;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0x6b5a2e;
    this.entity.setTint(this.tint);
  }

  detach(): void {}
}
