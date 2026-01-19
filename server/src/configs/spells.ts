import { SpellConfig, SpellName } from "../types";

export const spells: Record<SpellName, SpellConfig> = {
  [SpellName.SHARD]: {
    name: SpellName.SHARD,
    damage: 15,
    knockback: 50,
    speed: 300,
    range: 300,
    hitbox: {
      width: 10,
      height: 10,
    },
  },
  [SpellName.SLASH]: {
    name: SpellName.SLASH,
    damage: 25,
    knockback: 100,
    duration: 300,
    hitbox: {
      width: 40,
      height: 40,
    },
  },
  [SpellName.ILLUMINATE]: {
    name: SpellName.ILLUMINATE,
    damage: 0,
    knockback: 0,
    duration: 5000,
  },
};
