import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "../effects/Effect";
import { BurningEffect } from "../effects/Burning";
import { WetEffect } from "../effects/Wet";
import { DragonEffect } from "../effects/Dragon";
import { ShieldEffect } from "../effects/Shield";
import { StatusEffect } from "../effects/Status";

export class EffectFactory {
  static create(name: EffectName, entity: Entity): Effect {
    switch (name) {
      case EffectName.BURNING:
        return new BurningEffect(entity);
      case EffectName.WET:
        return new WetEffect(entity);
      case EffectName.DRAGON:
        return new DragonEffect(entity);
      case EffectName.SHIELD:
        return new ShieldEffect(entity);
      case EffectName.COLD:
      case EffectName.POISONED:
      case EffectName.ILLUMINATED:
      case EffectName.REGAIN:
      case EffectName.MOMENTUM:
      case EffectName.REFLECT:
      case EffectName.GREASE:
      case EffectName.SEARING:
      case EffectName.WARM:
        return new StatusEffect(name, entity);
    }
  }
}
