import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class ShieldEffect extends Effect {
  name = EffectName.SHIELD;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0xffe066;
    this.entity.setTint(this.tint);
  }

  detach(): void {}
}
