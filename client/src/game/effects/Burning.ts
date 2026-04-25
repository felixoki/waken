import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { emitters } from "./emitters";

export class BurningEffect extends Effect {
  name = EffectName.BURNING;

  private _stop?: () => void;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this._stop = emitters.burning(this.entity);
    this.entity.setTint(0xff6600);
  }

  detach(): void {
    this._stop?.();
    this.entity.clearTint();
  }
}
