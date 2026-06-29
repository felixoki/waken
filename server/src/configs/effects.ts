import { EffectName } from "../types/index.js";
import { DamageType } from "../types/damage.js";
import { DRAGON_FORM_DURATION } from "../globals.js";

export interface EffectDefinition {
  interval?: number;
  damage?: number;
  restore?: { health?: number; mana?: number };
}

export const effects: Record<EffectName, EffectDefinition> = {
  [EffectName.BURNING]: { interval: 1000, damage: 5 },
  [EffectName.WET]: {},
  [EffectName.COLD]: {},
  [EffectName.POISONED]: { interval: 2000, damage: 3 },
  [EffectName.ILLUMINATED]: {},
  [EffectName.REGAIN]: {},
  [EffectName.DRAGON]: { interval: DRAGON_FORM_DURATION },
};

export const interactions: Partial<
  Record<EffectName, Partial<Record<DamageType, number>>>
> = {
  [EffectName.WET]: {
    [DamageType.BURNING]: 0.5,
  },
};
