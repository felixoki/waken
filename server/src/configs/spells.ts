import { SpellConfig, SpellName } from "../types";

export const spells: Record<SpellName, SpellConfig> = {
  [SpellName.SHARD]: {
    name: SpellName.SHARD,
    damage: 15,
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
      description:
        "A chargeable magic projectile that grows stronger the longer you hold.",
      displayName: "Shard",
      icon: { spritesheet: "icons5", row: 16, col: 9 },
    },
  },
  [SpellName.SLASH]: {
    name: SpellName.SLASH,
    damage: 25,
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
      description: "A powerful melee attack.",
      displayName: "Slash",
      icon: { spritesheet: "icons5", row: 2, col: 9 },
    },
  },
  [SpellName.ILLUMINATE]: {
    name: SpellName.ILLUMINATE,
    damage: 0,
    knockback: 0,
    mana: 5,
    duration: 5000,
    metadata: {
      description: "Illuminates the surroundings.",
      displayName: "Illuminate",
    },
  },
  [SpellName.HURT_SHADOWS]: {
    name: SpellName.HURT_SHADOWS,
    damage: 75,
    knockback: 0,
    mana: 30,
    duration: 300,
    hitbox: {
      width: 100,
      height: 100,
    },
    metadata: {
      description: "Damages all enemies in a large area around the caster.",
      displayName: "Hurt Shadows",
    },
  },
  [SpellName.METEOR_SHOWER]: {
    name: SpellName.METEOR_SHOWER,
    damage: 35,
    knockback: 80,
    mana: 25,
    duration: 300,
    radius: 40,
    hitbox: {
      width: 40,
      height: 40,
    },
    metadata: {
      description: "Calls down a shower of meteors to damage enemies.",
      displayName: "Meteor Shower",
    },
  },
  [SpellName.BUTTERFLY_EFFIGY]: {
    name: SpellName.BUTTERFLY_EFFIGY,
    damage: 10,
    knockback: 15,
    mana: 20,
    duration: 1800,
    radius: 50,
    hitbox: {
      width: 8,
      height: 8,
    },
    metadata: {
      description:
        "Summons a butterfly effigy that heals allies and damages enemies in its radius.",
      displayName: "Butterfly Effigy",
    },
  },
  [SpellName.LIGHTNING_STRIKE]: {
    name: SpellName.LIGHTNING_STRIKE,
    damage: 50,
    knockback: 120,
    mana: 30,
    duration: 300,
    hitbox: {
      width: 30,
      height: 30,
    },
    metadata: {
      description:
        "Strikes a single target with lightning, dealing high damage.",
      displayName: "Lightning Strike",
    },
  },
};
