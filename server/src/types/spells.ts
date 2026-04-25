import { Damage } from './damage.js';
import { EffectName } from './effects.js';
import { Icon } from './entities.js';

export enum SpellName {
  SHARD = "shard",
  SLASH = "slash",
  ILLUMINATE = "illuminate",
  HURT_SHADOWS = "hurt_shadows",
  METEOR_SHOWER = "meteor_shower",
  BUTTERFLY_EFFIGY = "butterfly_effigy",
  LIGHTNING_STRIKE = "lightning_strike",
}

export interface ComboStep {
  damage: number;
  knockback: number;
  duration?: number;
  offset: number;
  hitbox: {
    width: number;
    height: number;
  };
}

export interface ChargeConfig {
  duration: number;
  min: number;
  max: number;
}

export interface SpellConfig {
  name: SpellName;
  damage: Damage;
  knockback: number;
  mana: number;
  effects?: [EffectName, number][];
  speed?: number;
  range?: number;
  duration?: number;
  radius?: number;
  hitbox?: {
    width: number;
    height: number;
  };
  combo?: ComboStep[];
  charge?: ChargeConfig;
  chargePercent?: number;
  metadata?: SpellMetadata;
}

export interface SpellMetadata {
  displayName?: string;
  description?: string;
  icon?: Icon;
}
