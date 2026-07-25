import { EffectName } from "@server/types";
import { Entity } from "../Entity";
import { Effect } from "../effects/Effect";
import { BurningEffect } from "../effects/Burning";
import { WetEffect } from "../effects/Wet";
import { ColdEffect } from "../effects/Cold";
import { PoisonedEffect } from "../effects/Poisoned";
import { IlluminatedEffect } from "../effects/Illuminated";
import { RegainEffect } from "../effects/Regain";
import { DragonEffect } from "../effects/Dragon";
import { MomentumEffect } from "../effects/Momentum";
import { ReflectEffect } from "../effects/Reflect";
import { ShieldEffect } from "../effects/Shield";
import { GreaseEffect } from "../effects/Grease";

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
      case EffectName.DRAGON:
        return new DragonEffect(entity);
      case EffectName.MOMENTUM:
        return new MomentumEffect(entity);
      case EffectName.REFLECT:
        return new ReflectEffect(entity);
      case EffectName.SHIELD:
        return new ShieldEffect(entity);
      case EffectName.GREASE:
        return new GreaseEffect(entity);
    }
  }
}
