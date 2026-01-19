import { PipelineName, SpellConfig, SpellName, SpellType } from "../types";

export const spells: Record<SpellName, SpellConfig> = {
  [SpellName.SHARD]: {
    name: SpellName.SHARD,
    type: SpellType.PROJECTILE,
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
  [SpellName.SLASH]: {
    name: SpellName.SLASH,
    type: SpellType.MELEE,
    damage: 25,
    knockback: 100,
    duration: 300,
    hitbox: {
      width: 40,
      height: 40,
    },
    particles: {
      tint: [0xffffff, 0xeeeeee, 0xcccccc],
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 0.3 },
      speedY: { min: -60, max: -20 },
      speedX: { min: -30, max: 30 },
      lifespan: 150,
      frequency: 3,
      quantity: 8,
      blendMode: "ADD",
    },
  },
  [SpellName.ILLUMINATE]: {
    name: SpellName.ILLUMINATE,
    type: SpellType.SCENE,
    damage: 0,
    knockback: 0,
    duration: 5000,
    shader: {
      pipeline: PipelineName.LIGHT,
    },
  },
  [SpellName.HURT_SHADOWS]: {
    name: SpellName.HURT_SHADOWS,
    type: SpellType.AREA,
    damage: 40,
    knockback: 0,
    duration: 1000,
    hitbox: {
      width: 100,
      height: 100,
    },
    shader: {
      pipeline: PipelineName.REND,
    },
  },
};
