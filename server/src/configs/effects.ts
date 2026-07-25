import { EffectName, Modifier } from "../types/index.js";
import { DamageType } from "../types/damage.js";
import { DRAGON_FORM_DURATION } from "../globals.js";

export interface EffectDefinition {
  interval?: number;
  damage?: number;
  restore?: { health?: number; mana?: number };
  modifier?: Modifier;
  reflect?: number;
  absorb?: number;
}

export const effects: Record<EffectName, EffectDefinition> = {
  [EffectName.BURNING]: { interval: 1000, damage: 5 },
  [EffectName.WET]: {},
  [EffectName.COLD]: {},
  [EffectName.POISONED]: { interval: 2000, damage: 3 },
  [EffectName.ILLUMINATED]: {},
  [EffectName.REGAIN]: { interval: 1000, restore: { health: 5 } },
  [EffectName.DRAGON]: { interval: DRAGON_FORM_DURATION },
  [EffectName.MOMENTUM]: {
    modifier: { multipliers: { damage: 1.25, speed: 1.3 } },
  },
  [EffectName.REFLECT]: {
    modifier: { multipliers: { defense: 0.5 } },
    reflect: 0.5,
  },
  [EffectName.SHIELD]: { absorb: 50 },
  [EffectName.GREASE]: {},
};

export const interactions: Partial<
  Record<EffectName, Partial<Record<DamageType, number>>>
> = {
  [EffectName.WET]: {
    [DamageType.BURNING]: 0.5,
  },
  [EffectName.GREASE]: {
    [DamageType.BURNING]: 3,
  },
};
