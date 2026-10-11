import { SpellConfig } from "./spells";
import { WeaponConfig } from "./weapons";
import { TrapConfig } from "./traps";
import { EntityName, Trigger } from "./entities";

export type CombatConfig = SpellConfig | WeaponConfig | TrapConfig | Trigger;

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
  reflected?: boolean;
  trigger?: EntityName;
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
