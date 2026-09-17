import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { emitters } from "../vfx/emitters";

export class SearingEffect extends Effect {
  name = EffectName.SEARING;

  private _stop?: () => void;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this._stop = emitters.burning(this.entity);
    this.tint = 0xffe2b0;
    this.entity.setTint(this.tint);
  }

  detach(): void {
    this._stop?.();
  }
}
