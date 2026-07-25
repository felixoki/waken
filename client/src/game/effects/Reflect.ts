import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class ReflectEffect extends Effect {
  name = EffectName.REFLECT;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0x66ccff;
    this.entity.setTint(this.tint);
  }

  detach(): void {}
}
