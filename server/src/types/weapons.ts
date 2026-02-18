export enum WeaponName {
  SLASH = "slash",
}

export interface WeaponConfig {
  name: WeaponName;
  damage: number;
  knockback: number;
  range: number;
  duration?: number;
  hitbox?: {
    width: number;
    height: number;
  };
}
