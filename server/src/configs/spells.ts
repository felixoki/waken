import { SpellConfig, SpellName, SoundName, Target } from "../types";
import { DamageType } from "../types/damage.js";
import { EffectName } from "../types/effects.js";
import { TemporaryZoneName } from "../types/zones.js";

export const spells: Record<SpellName, SpellConfig> = {
  [SpellName.SHARD]: {
    name: SpellName.SHARD,
    damage: { type: DamageType.PHYSICAL, amount: 35 },
    knockback: 50,
    mana: 10,
    speed: 300,
    range: 300,
    sounds: { impact: SoundName.SHARD_HIT },
    hitbox: {
      width: 10,
      height: 10,
    },
    charge: {
      duration: 1000,
      min: 0.25,
      max: 1,
      sounds: {
        charge: SoundName.SHARD_CHARGE,
        hold: SoundName.SHARD_HOLD,
      },
    },
    metadata: {
      description:
        "A chargeable projectile that grows stronger the longer you hold.",
      displayName: "Shard",
      icon: { spritesheet: "icons5", row: 16, col: 9 },
    },
  },
  [SpellName.SLASH]: {
    name: SpellName.SLASH,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 30 },
    knockback: 100,
    mana: 15,
    duration: 300,
    hitbox: {
      width: 40,
      height: 40,
    },
    combo: [
      {
        damage: 40,
        knockback: 100,
        duration: 300,
        offset: 20,
        hitbox: { width: 40, height: 40 },
      },
      {
        damage: 60,
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
  [SpellName.REVIVE]: {
    name: SpellName.REVIVE,
    sounds: { cast: SoundName.REVIVE },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 30,
    range: 80,
    duration: 600,
    metadata: {
      description:
        "Channel life into a fallen ally, reviving them where they fell.",
      displayName: "Revive",
      icon: { spritesheet: "icons5", row: 8, col: 18 },
    },
  },
  [SpellName.GAIN_MOMENTUM]: {
    name: SpellName.GAIN_MOMENTUM,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 25,
    buff: {
      target: Target.PARTY,
      effects: [[EffectName.MOMENTUM, 8000]],
    },
    metadata: {
      description:
        "Rallies your party, everyone hits harder and moves faster for a time.",
      displayName: "Gain momentum",
      icon: { spritesheet: "icons2", row: 21, col: 9 },
    },
  },
  [SpellName.REFLECT_DAMAGE]: {
    name: SpellName.REFLECT_DAMAGE,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 20,
    buff: {
      target: Target.SELF,
      effects: [[EffectName.REFLECT, 15000]],
    },
    metadata: {
      description:
        "Wraps you in a shard ward, halving incoming damage and flinging part of it back.",
      displayName: "Reflect damage",
      icon: { spritesheet: "icons2", row: 21, col: 6 },
    },
  },
  [SpellName.HEAL_PARTY]: {
    name: SpellName.HEAL_PARTY,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 30,
    buff: {
      target: Target.PARTY,
      effects: [[EffectName.REGAIN, 8000]],
    },
    metadata: {
      description:
        "Mends your party over time, weaving dream light that closes wounds.",
      displayName: "Heal party",
      icon: { spritesheet: "icons8", row: 21, col: 15 },
    },
  },
  [SpellName.SHIELD]: {
    name: SpellName.SHIELD,
    sounds: { cast: SoundName.SHIELD },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 25,
    buff: {
      target: Target.SELF,
      effects: [[EffectName.SHIELD, 12000]],
    },
    metadata: {
      description:
        "Conjures a ward that absorbs a burst of damage before it shatters.",
      displayName: "Shield",
      icon: { spritesheet: "icons2", row: 21, col: 5 },
    },
  },
  [SpellName.ILLUMINATE]: {
    name: SpellName.ILLUMINATE,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 5,
    duration: 5000,
    zone: { type: TemporaryZoneName.LIGHT, radius: 300, duration: 6000 },
    metadata: {
      description: "Casts a bright light that illuminates the surroundings.",
      displayName: "Illuminate",
      icon: { spritesheet: "icons8", row: 21, col: 6 },
    },
  },
  [SpellName.HURT_SHADOWS]: {
    name: SpellName.HURT_SHADOWS,
    sounds: { cast: SoundName.HURT_SHADOWS },
    damage: { type: DamageType.ILLUMINATED, amount: 90 },
    knockback: 0,
    mana: 30,
    duration: 300,
    hitbox: {
      width: 100,
      height: 100,
    },
    metadata: {
      description: "Damages all shadow enemies in a wide area around you.",
      displayName: "Hurt shadows",
      icon: { spritesheet: "icons8", row: 21, col: 9 },
    },
  },
  [SpellName.METEOR_SHOWER]: {
    name: SpellName.METEOR_SHOWER,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.BURNING, amount: 45 },
    knockback: 80,
    mana: 25,
    duration: 1500,
    radius: 40,
    effects: [[EffectName.BURNING, 5000]],
    animation: {
      key: "growling",
      frameCount: 19,
      frameRate: 14,
      repeat: 0,
    },
    hitbox: {
      width: 40,
      height: 40,
    },
    metadata: {
      description: "Rains burning meteors down onto enemies in an area.",
      displayName: "Meteor shower",
      icon: { spritesheet: "icons5", row: 10, col: 9 },
    },
  },
  [SpellName.GREASE]: {
    name: SpellName.GREASE,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 5 },
    knockback: 0,
    mana: 15,
    duration: 300,
    effects: [[EffectName.GREASE, 8000]],
    hitbox: {
      width: 90,
      height: 90,
    },
    metadata: {
      description: "Coats enemies in oil and weakens them to fire.",
      displayName: "Grease",
      icon: { spritesheet: "icons8", row: 21, col: 2 },
    },
  },
  [SpellName.BLINK]: {
    name: SpellName.BLINK,
    sounds: { cast: SoundName.BLINK },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 15,
    range: 200,
    duration: 200,
    metadata: {
      description: "Blink a short distance toward your cursor.",
      displayName: "Blink",
      icon: { spritesheet: "icons5", row: 14, col: 18 },
    },
  },
  [SpellName.HYPERBEAM]: {
    name: SpellName.HYPERBEAM,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 12 },
    knockback: 0,
    mana: 4,
    channel: { tick: 150, range: 320, segments: 10 },
    hitbox: {
      width: 34,
      height: 34,
    },
    metadata: {
      description: "Channels a searing beam that scorches everything in its path.",
      displayName: "Hyperbeam",
      icon: { spritesheet: "icons8", row: 21, col: 13 },
    },
  },
  [SpellName.BUTTERFLY_EFFIGY]: {
    name: SpellName.BUTTERFLY_EFFIGY,
    sounds: { cast: SoundName.SLASH },
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
      displayName: "Butterfly effigy",
    },
  },
  [SpellName.LIGHTNING_STRIKE]: {
    name: SpellName.LIGHTNING_STRIKE,
    sounds: { cast: SoundName.LIGHTNING_STRIKE },
    damage: { type: DamageType.PHYSICAL, amount: 150 },
    knockback: 120,
    mana: 90,
    duration: 300,
    hitbox: {
      width: 40,
      height: 40,
    },
    metadata: {
      description:
        "Strikes a single target with a bolt of high damage lightning.",
      displayName: "Lightning strike",
      icon: { spritesheet: "icons5", row: 16, col: 18 },
    },
  },
  [SpellName.GRASP]: {
    name: SpellName.GRASP,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 60 },
    knockback: 0,
    mana: 1,
    duration: 1200,
    range: 120,
    hitbox: {
      width: 30,
      height: 30,
    },
    metadata: {
      description:
        "A spectral hand rises from the ground, rushes forward and grasps enemies.",
      displayName: "Grasp",
    },
  },
  [SpellName.ABSORB_LIFE]: {
    name: SpellName.ABSORB_LIFE,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 25 },
    knockback: 0,
    mana: 35,
    lifesteal: 1,
    duration: 600,
    radius: 80,
    hitbox: {
      width: 160,
      height: 160,
    },
    metadata: {
      description:
        "Drains the life from all nearby creatures, healing you for the damage dealt.",
      displayName: "Absorb life",
      icon: { spritesheet: "icons2", row: 21, col: 15 },
    },
  },
  [SpellName.DRAGON_FORM]: {
    name: SpellName.DRAGON_FORM,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 0,
    duration: 1500,
    animation: {
      key: "transforming",
      frameCount: 18,
      frameRate: 12,
      repeat: 0,
    },
    metadata: {
      description:
        "Transform into a sinuous river dragon, coiling weightless through the air.",
      displayName: "Dragon form",
      icon: { spritesheet: "icons5", row: 4, col: 9 },
    },
  },
  [SpellName.FIRE_BREATH]: {
    name: SpellName.FIRE_BREATH,
    sounds: { cast: SoundName.FIRE_BREATH },
    damage: { type: DamageType.BURNING, amount: 25 },
    knockback: 40,
    mana: 0,
    duration: 2000,
    effects: [[EffectName.BURNING, 3000]],
    animation: {
      key: "breathing_fire",
      frameCount: 24,
      frameRate: 12,
      repeat: 0,
    },
    hitbox: {
      width: 130,
      height: 130,
    },
    metadata: {
      description: "Exhale a torrent of flame, scorching all before it.",
      displayName: "Fire breath",
      icon: { spritesheet: "icons5", row: 2, col: 9 },
    },
  },
  [SpellName.BITE]: {
    name: SpellName.BITE,
    sounds: { cast: SoundName.SLASH },
    damage: { type: DamageType.PHYSICAL, amount: 45 },
    knockback: 120,
    mana: 0,
    duration: 1300,
    animation: {
      key: "biting",
      frameCount: 17,
      frameRate: 14,
      repeat: 0,
    },
    hitbox: {
      width: 64,
      height: 56,
    },
    metadata: {
      description: "Clamp down with crushing jaws.",
      displayName: "Bite",
      icon: { spritesheet: "icons8", row: 21, col: 11 },
    },
  },
  [SpellName.TAME]: {
    name: SpellName.TAME,
    damage: { type: DamageType.PHYSICAL, amount: 0 },
    knockback: 0,
    mana: 15,
    speed: 250,
    range: 300,
    sounds: { impact: SoundName.SHARD_HIT },
    hitbox: {
      width: 10,
      height: 10,
    },
    metadata: {
      description:
        "A soothing bolt that pacifies a wild animal so its soul can be caught.",
      displayName: "Tame Animal",
      icon: { spritesheet: "icons5", row: 4, col: 18 },
    },
  },
};
