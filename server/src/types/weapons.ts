import { Damage } from './damage.js';
import { EffectName } from './effects.js';

export enum WeaponName {
  SLASH = "slash",
}

export interface WeaponConfig {
  name: WeaponName;
  damage: Damage;
  knockback: number;
  range: number;
  effects?: [EffectName, number][];
  duration?: number;
  hitbox?: {
    width: number;
    height: number;
  };
}
