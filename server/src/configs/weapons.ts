import { DURATION_SLASHING } from "../globals";
import { WeaponConfig, WeaponName } from "../types";

export const weapons: Record<WeaponName, WeaponConfig> = {
  [WeaponName.SLASH]: {
    name: WeaponName.SLASH,
    damage: 20,
    knockback: 80,
    duration: DURATION_SLASHING,
    hitbox: {
      width: 30,
      height: 30,
    },
  },
};
