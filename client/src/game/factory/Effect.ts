import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "../effects/Effect";
import { BurningEffect } from "../effects/Burning";
import { WetEffect } from "../effects/Wet";
import { ColdEffect } from "../effects/Cold";
import { PoisonedEffect } from "../effects/Poisoned";
import { IlluminatedEffect } from "../effects/Illuminated";
import { RegainEffect } from "../effects/Regain";

export class EffectFactory {
  static create(name: EffectName, entity: Entity): Effect {
    switch (name) {
      case EffectName.BURNING:
        return new BurningEffect(entity);
      case EffectName.WET:
        return new WetEffect(entity);
      case EffectName.COLD:
        return new ColdEffect(entity);
      case EffectName.POISONED:
        return new PoisonedEffect(entity);
      case EffectName.ILLUMINATED:
        return new IlluminatedEffect(entity);
      case EffectName.REGAIN:
        return new RegainEffect(entity);
    }
  }
}
