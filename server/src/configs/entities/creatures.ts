import {
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  SpellName,
  StateName,
  WeaponName,
  SoundName,
} from "../../types";
import { DamageType } from "../../types/damage.js";

export const creatures: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ORC1]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 150,
    speed: 1.1,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.QUARTZ1,
              quantity: 1,
              stackable: true,
              chance: 0.9,
            },
            {
              name: EntityName.IRON1,
              quantity: 1,
              stackable: true,
              chance: 0.75,
            },
          ],
          weaknesses: [DamageType.BURNING],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 16,
          offsetX: 24,
          offsetY: 20,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.ORC_IDLE, interval: [5000, 12000] },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    attacks: [
      {
        state: StateName.SLASHING,
        weapon: WeaponName.SLASH,
        damage: { type: DamageType.PIERCING, amount: 30 },
        range: 40,
        sound: SoundName.ORC_SLASH,
        swing: SoundName.SWORD_SWING,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
      { name: BehaviorName.SEARCH },
    ],
  },
  [EntityName.ORC2]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 280,
    speed: 1.05,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.QUARTZ1,
              quantity: 2,
              stackable: true,
              chance: 1,
            },
            {
              name: EntityName.IRON1,
              quantity: 2,
              stackable: true,
              chance: 1,
            },
            {
              name: EntityName.SOULSTONE,
              quantity: 1,
              stackable: true,
              chance: 0.75,
            },
          ],
          weaknesses: [DamageType.BURNING],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 16,
          offsetX: 24,
          offsetY: 20,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.ORC_IDLE, interval: [5000, 12000] },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    attacks: [
      {
        state: StateName.SLASHING,
        weapon: WeaponName.SLASH,
        damage: { type: DamageType.PIERCING, amount: 50 },
        range: 40,
        sound: SoundName.ORC_SLASH,
        swing: SoundName.SWORD_SWING,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
      { name: BehaviorName.SEARCH },
    ],
  },
  [EntityName.GOBLIN1]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 60,
    speed: 1.2,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.QUARTZ1,
              quantity: 1,
              stackable: true,
              chance: 0.5,
            },
            {
              name: EntityName.BONE,
              quantity: 1,
              stackable: true,
              chance: 1,
            },
          ],
          resistances: [DamageType.COLD],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 12,
          offsetX: 26,
          offsetY: 22,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.GOBLIN_IDLE, interval: [4000, 9000] },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    attacks: [
      {
        state: StateName.SLASHING,
        weapon: WeaponName.SLASH,
        damage: { type: DamageType.PIERCING, amount: 12 },
        range: 40,
        sound: SoundName.GOBLIN_SLASH,
        swing: SoundName.DAGGER_SWING,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
      { name: BehaviorName.SEARCH },
    ],
  },
  [EntityName.GOBLIN2]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 120,
    speed: 1.1,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.QUARTZ1,
              quantity: 1,
              stackable: true,
              chance: 0.8,
            },
            {
              name: EntityName.BONE,
              quantity: 2,
              stackable: true,
              chance: 1,
            },
            {
              name: EntityName.GOAT_MILK,
              quantity: 1,
              stackable: true,
              chance: 0.75,
            },
          ],
          resistances: [DamageType.COLD],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 12,
          offsetX: 26,
          offsetY: 22,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.GOBLIN_IDLE, interval: [4000, 9000] },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    attacks: [
      {
        state: StateName.SLASHING,
        weapon: WeaponName.SLASH,
        damage: { type: DamageType.PIERCING, amount: 24 },
        range: 40,
        sound: SoundName.GOBLIN_SLASH,
        swing: SoundName.DAGGER_SWING,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
      { name: BehaviorName.SEARCH },
    ],
  },
  [EntityName.TROLL]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 340,
    speed: 1.05,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.AMULET1,
              quantity: 1,
              stackable: true,
              chance: 0.25,
            },
            {
              name: EntityName.TROLL_SCALES,
              quantity: 1,
              stackable: true,
              chance: 0.75,
            },
            {
              name: EntityName.PERCH,
              quantity: 2,
              stackable: true,
              chance: 0.5,
            },
            {
              name: EntityName.FISHING_HOOK,
              quantity: 1,
              stackable: true,
              chance: 0.25,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 20,
          offsetX: 32,
          offsetY: 30,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.TROLL_IDLE, interval: [6000, 14000] },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
      StateName.THROWING,
    ],
    attacks: [
      {
        state: StateName.SLASHING,
        weapon: WeaponName.SLASH,
        damage: { type: DamageType.PHYSICAL, amount: 45 },
        range: 40,
        sound: SoundName.TROLL_SLASH,
      },
      {
        state: StateName.THROWING,
        range: 200,
        minRange: 50,
        cooldown: 4000,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
      { name: BehaviorName.SEARCH },
    ],
  },
  [EntityName.ANCIENT_TROLL]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 900,
    speed: 1.05,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.ANCIENT_TROLL_HEART,
              quantity: 1,
              stackable: true,
              chance: 1,
            },
            {
              name: EntityName.TROLL_SCALES,
              quantity: 3,
              stackable: true,
              chance: 1,
            },
            {
              name: EntityName.IRON1,
              quantity: 4,
              stackable: true,
              chance: 0.5,
            },
            {
              name: EntityName.SOULSTONE,
              quantity: 1,
              stackable: true,
              chance: 0.5,
            },
            {
              name: EntityName.AMULET2,
              quantity: 1,
              stackable: false,
              chance: 0.05,
            },
            {
              name: EntityName.RING2,
              quantity: 1,
              stackable: false,
              chance: 0.05,
            },
            {
              name: EntityName.BOOTS1,
              quantity: 1,
              stackable: false,
              chance: 0.05,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 20,
          offsetX: 32,
          offsetY: 30,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.TROLL_IDLE, interval: [6000, 14000] },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
      StateName.THROWING,
    ],
    attacks: [
      {
        state: StateName.SLASHING,
        weapon: WeaponName.SLASH,
        damage: { type: DamageType.PHYSICAL, amount: 80 },
        range: 40,
        sound: SoundName.TROLL_SLASH,
      },
      {
        state: StateName.THROWING,
        damage: { type: DamageType.PHYSICAL, amount: 110 },
        range: 200,
        minRange: 50,
        cooldown: 4000,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
      { name: BehaviorName.SEARCH },
    ],
  },
  [EntityName.SHADOW_WANDERER]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 250,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.SPELL_PAGE_HURT_SHADOWS,
              quantity: 1,
              stackable: false,
              chance: 0.25,
            },
            {
              name: EntityName.RING1,
              quantity: 1,
              stackable: true,
              chance: 0.25,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.CAPTURABLE,
        config: {
          soul: EntityName.SHADOW_WANDERER,
          threshold: 0.3,
          solidifiable: false,
        },
      },
      {
        name: ComponentName.AURA,
        config: {
          tints: [0x0a0f20, 0x0f1530, 0x151e45, 0x1a2555, 0x202e6a],
        },
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 12,
          offsetX: 26,
          offsetY: 22,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.SHADOW_WANDERER_IDLE, interval: [5000, 12000] },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.DASHING,
      StateName.CASTING,
    ],
    attacks: [
      {
        state: StateName.CASTING,
        spell: SpellName.HURT_SHADOWS,
        range: 150,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 500 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      {
        name: BehaviorName.DEFEND,
        config: {
          vision: 300,
          fov: Math.PI * 2,
        },
      },
    ],
    metadata: {
      displayName: "Shadow wanderer",
    },
  },
  [EntityName.BLOODGEIST1]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 100,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.SPELL_PAGE_GREASE,
              quantity: 1,
              stackable: false,
              chance: 0.2,
            },
            {
              name: EntityName.SPELL_PAGE_DARK_WAVE,
              quantity: 1,
              stackable: false,
              chance: 0.15,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 10,
          offsetX: 11,
          offsetY: 17,
          pushable: false,
        },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING, StateName.CASTING],
    attacks: [
      {
        state: StateName.CASTING,
        spell: SpellName.SHIELD,
        range: 200,
        cooldown: 14000,
        windup: 450,
        sound: SoundName.BLOODGEIST_HIT,
      },
      {
        state: StateName.CASTING,
        spell: SpellName.DARK_WAVE,
        range: 55,
        cooldown: 3000,
        windup: 450,
        sound: SoundName.BLOODGEIST_HIT,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK, config: { spacing: 50, recovery: 1500 } },
      { name: BehaviorName.SEARCH },
    ],
  },
  [EntityName.HEXGEIST]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 220,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.SPELL_PAGE_LIGHTNING_STRIKE,
              quantity: 1,
              stackable: false,
              chance: 0.15,
            },
            {
              name: EntityName.SPELL_PAGE_SUNDER,
              quantity: 1,
              stackable: false,
              chance: 0.1,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 10,
          offsetX: 11,
          offsetY: 19,
          pushable: false,
        },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING, StateName.CASTING],
    attacks: [
      {
        state: StateName.CASTING,
        spell: SpellName.DARK_WAVE,
        damage: { type: DamageType.COLD, amount: 25 },
        range: 55,
        cooldown: 3500,
        windup: 450,
        sound: SoundName.BLOODGEIST_HIT,
      },
      {
        state: StateName.CASTING,
        spell: SpellName.SUNDER,
        damage: { type: DamageType.PHYSICAL, amount: 40 },
        range: 100,
        cooldown: 9000,
        windup: 650,
        sound: SoundName.BLOODGEIST_HIT,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK, config: { spacing: 130, recovery: 1800 } },
      { name: BehaviorName.SEARCH },
    ],
  },
};
