import { SpellConfig } from "./spells";
import { WeaponConfig } from "./weapons";

export interface Hit {
  config: SpellConfig | WeaponConfig;
  attackerId: string;
  targetId: string;
}

export interface Hurt {
  id: string;
  health: number;
  knockback: { x: number; y: number };
  attackerId: string;
  isMiss?: boolean;
  isCritical?: boolean;
}

export interface Spot {
  entityId: string;
  playerId: string;
}

export interface Death {
  id: string;
  x: number;
  y: number;
}

export interface Revive {
  id: string;
}
