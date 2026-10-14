import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { quads } from "../vfx/quads";

export class ShieldEffect extends Effect {
  name = EffectName.SHIELD;

  private _stop?: () => void;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this._stop = quads.ward(this.entity);
  }

  detach(): void {
    this._stop?.();
  }
}
