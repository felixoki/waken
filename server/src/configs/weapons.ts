import { DURATION_SLASHING, RANGE_SLASHING } from "../globals";
import { WeaponConfig, WeaponName } from "../types";
import { DamageType } from "../types/damage.js";

export const weapons: Record<WeaponName, WeaponConfig> = {
  [WeaponName.SLASH]: {
    name: WeaponName.SLASH,
    damage: { type: DamageType.PIERCING, amount: 20 },
    knockback: 80,
    range: RANGE_SLASHING,
    duration: DURATION_SLASHING,
    hitbox: {
      width: 30,
      height: 30,
    },
  },
};
