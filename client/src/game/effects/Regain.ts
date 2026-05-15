import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class RegainEffect extends Effect {
  name = EffectName.REGAIN;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0x88ff88;
    this.entity.setTint(this.tint);
  }

  detach(): void {
  }
}
