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
  damage: number;
  knockback: number;
  mana: number;
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
  icon?: import('./entities.js').IconRef;
}
