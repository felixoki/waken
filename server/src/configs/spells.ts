import { SpellConfig, SpellName } from "../types";

export const spells: Record<SpellName, SpellConfig> = {
  [SpellName.SHARD]: {
    name: SpellName.SHARD,
    damage: 15,
    knockback: 50,
    speed: 300,
    hitbox: {
      width: 10,
      height: 10,
    },
    particles: {
      tint: [0x00ccff, 0xaaffff, 0xffffff],
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.6, end: 0.2 },
      speedY: { min: -30, max: 30 },
      speedX: { min: -30, max: 30 },
      lifespan: 400,
      frequency: 15,
      quantity: 2,
      blendMode: "ADD",
    },
  },
};
