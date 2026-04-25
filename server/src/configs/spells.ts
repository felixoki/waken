import { SpellConfig, SpellName } from "../types";
import { DamageType } from "../types/damage.js";
import { EffectName } from "../types/effects.js";

export const spells: Record<SpellName, SpellConfig> = {
  [SpellName.SHARD]: {
    name: SpellName.SHARD,
    damage: { type: DamageType.PHYSICAL, amount: 15 },
    knockback: 50,
    mana: 10,
    speed: 300,
    range: 300,
    hitbox: {
      width: 10,
      height: 10,
    },
    charge: {
      duration: 1000,
      min: 0.25,
      max: 1,
    },
    metadata: {
      description: "A chargeable projectile that grows stronger the longer you hold.",
      displayName: "Shard",
      icon: { spritesheet: "icons5", row: 16, col: 9 },
    },
  },
  [SpellName.SLASH]: {
    name: SpellName.SLASH,
    damage: { type: DamageType.PHYSICAL, amount: 25 },
    knockback: 100,
    mana: 15,
    duration: 300,
    hitbox: {
      width: 40,
      height: 40,
    },
    combo: [
      {
        damage: 30,
        knockback: 100,
        duration: 300,
        offset: 20,
        hitbox: { width: 40, height: 40 },
      },
      {
        damage: 40,
        knockback: 160,
        duration: 300,
        offset: 28,
        hitbox: { width: 40, height: 60 },
      },
    ],
    metadata: {
      description: "A powerful melee combo that deals escalating damage.",
      displayName: "Slash",
      icon: { spritesheet: "icons5", row: 2, col: 9 },
    },
  },
  [SpellName.ILLUMINATE]: {
    name: SpellName.ILLUMINATE,
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 5,
    duration: 5000,
    metadata: {
      description: "Casts a bright light that illuminates the surroundings.",
      displayName: "Illuminate",
    },
  },
  [SpellName.HURT_SHADOWS]: {
    name: SpellName.HURT_SHADOWS,
    damage: { type: DamageType.ILLUMINATED, amount: 75 },
    knockback: 0,
    mana: 30,
    duration: 300,
    hitbox: {
      width: 100,
      height: 100,
    },
    metadata: {
      description: "Damages all shadow enemies in a wide area around you.",
      displayName: "Hurt Shadows",
    },
  },
  [SpellName.METEOR_SHOWER]: {
    name: SpellName.METEOR_SHOWER,
    damage: { type: DamageType.BURNING, amount: 35 },
    knockback: 80,
    mana: 25,
    duration: 300,
    radius: 40,
    effects: [[EffectName.BURNING, 5000]],
    hitbox: {
      width: 40,
      height: 40,
    },
    metadata: {
      description: "Rains burning meteors down onto enemies in an area.",
      displayName: "Meteor Shower",
      icon: { spritesheet: "icons5", row: 10, col: 9 },
    },
  },
  [SpellName.BUTTERFLY_EFFIGY]: {
    name: SpellName.BUTTERFLY_EFFIGY,
    damage: { type: DamageType.PHYSICAL, amount: 10 },
    knockback: 15,
    mana: 20,
    duration: 1800,
    radius: 50,
    hitbox: {
      width: 8,
      height: 8,
    },
    metadata: {
      description: "Summons a butterfly that heals allies and harms enemies.",
      displayName: "Butterfly Effigy",
    },
  },
  [SpellName.LIGHTNING_STRIKE]: {
    name: SpellName.LIGHTNING_STRIKE,
    damage: { type: DamageType.PHYSICAL, amount: 50 },
    knockback: 120,
    mana: 90,
    duration: 300,
    hitbox: {
      width: 30,
      height: 30,
    },
    metadata: {
      description: "Strikes a single target with a bolt of high damage lightning.",
      displayName: "Lightning Strike",
      icon: { spritesheet: "icons5", row: 16, col: 18 },
    },
  },
};
