import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { emitters } from "../vfx/emitters";

export class BurningEffect extends Effect {
  name = EffectName.BURNING;

  private _stop?: () => void;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this._stop = emitters.burning(this.entity);
    this.tint = 0xff6600;
    this.entity.setTint(this.tint);
  }

  detach(): void {
    this._stop?.();
  }
}
