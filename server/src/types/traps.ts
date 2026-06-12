import { Damage } from "./damage.js";
import { EffectName } from "./effects.js";
import { EntityName } from "./entities.js";

export interface TrapConfig {
  name: EntityName;
  damage: Damage;
  knockback: number;
  hitbox: { width: number; height: number };
  delay: number;
  duration: number;
  cooldown: number;
  effects?: [EffectName, number, number?][];
}
