import { SpellConfig } from "./spells";
import { WeaponConfig } from "./weapons";
import { TrapConfig } from "./traps";

export type CombatConfig = SpellConfig | WeaponConfig | TrapConfig;

export interface Hit {
  config: CombatConfig;
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
