import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { emitters } from "./emitters";

export class PoisonedEffect extends Effect {
  name = EffectName.POISONED;

  private _stop?: () => void;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this._stop = emitters.poisoned(this.entity);
    this.entity.setTint(0x44cc44);
  }

  detach(): void {
    this._stop?.();
    this.entity.clearTint();
  }
}
