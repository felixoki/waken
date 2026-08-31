import { ComponentName, EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "./Effect";
import { WetsheenComponent } from "../components/Wetsheen";

export class WetEffect extends Effect {
  name = EffectName.WET;

  constructor(private entity: Entity) {
    super();
  }

  attach(): void {
    if (this.entity.hasComponent(ComponentName.WETSHEEN)) return;

    this.entity.addComponent(new WetsheenComponent(this.entity));
  }

  detach(): void {}
}
