import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { emitters } from "../vfx/emitters";

export class ColdEffect extends Effect {
  name = EffectName.COLD;

  private _stop?: () => void;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this._stop = emitters.cold(this.entity);
    this.tint = 0xaaddff;
    this.entity.setTint(this.tint);
  }

  detach(): void {
    this._stop?.();
  }
}
