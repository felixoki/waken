import { ComponentName, EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { emitters } from "../vfx/emitters";
import { BlazeComponent } from "../components/Blaze";

export class BurningEffect extends Effect {
  name = EffectName.BURNING;

  private _stop?: () => void;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    this._stop = emitters.embers(this.entity);

    if (!this.entity.hasComponent(ComponentName.BLAZE))
      this.entity.addComponent(new BlazeComponent(this.entity));
  }

  detach(): void {
    this._stop?.();
  }
}
