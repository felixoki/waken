import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class RegainEffect extends Effect {
  name = EffectName.REGAIN;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.entity.setTint(0x88ff88);
  }

  detach(): void {
    this.entity.clearTint();
  }
}
