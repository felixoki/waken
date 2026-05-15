import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class IlluminatedEffect extends Effect {
  name = EffectName.ILLUMINATED;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.tint = 0xffee88;
    this.entity.setTint(this.tint);
  }

  detach(): void {
  }
}
