import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";

export class IlluminatedEffect extends Effect {
  name = EffectName.ILLUMINATED;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this.entity.setTint(0xffee88);
  }

  detach(): void {
    this.entity.clearTint();
  }
}
