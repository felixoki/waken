import { ComponentName, EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { StatusComponent } from "../components/Status";

export class StatusEffect extends Effect {
  constructor(
    public name: EffectName,
    private entity: Entity,
  ) {
    super();
  }

  attach(): void {
    if (this.entity.hasComponent(ComponentName.STATUS)) return;

    this.entity.addComponent(new StatusComponent(this.entity));
  }
}
