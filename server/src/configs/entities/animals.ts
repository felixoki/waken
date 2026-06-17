import {
  BehaviorName,
  ComponentName,
  DamageType,
  Direction,
  EffectName,
  EntityDefinition,
  EntityName,
  StateName,
  WeaponName,
  SoundName,
} from "../../types";

export const animals: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.BOAR]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 80,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.BOAR_MEAT,
              quantity: 1,
              stackable: true,
              chance: 1,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 12,
          offsetX: 8,
          offsetY: 10,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.BOAR_IDLE, interval: [4000, 9000] },
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
        damage: { type: DamageType.PIERCING, amount: 15 },
        range: 40,
        sound: SoundName.BOAR_SLASH,
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
  [EntityName.DRAKE]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 20,
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.DUCK_IDLE, interval: [5000, 12000] },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 80, idle: { range: [6000, 12000] } },
      },
    ],
  },
  [EntityName.DUCK]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 20,
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.DUCK_IDLE, interval: [5000, 12000] },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 80, idle: { range: [6000, 12000] } },
      },
    ],
  },
  [EntityName.FOX]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 40,
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 10,
          offsetX: 10,
          offsetY: 12,
          pushable: false,
        },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING, StateName.RUNNING],
    behaviors: [
      {
        name: BehaviorName.WANDER,
        config: { radius: 80, idle: { range: [6000, 12000] } },
      },
      {
        name: BehaviorName.FLEE,
      },
    ],
  },
  [EntityName.HARE]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 30,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.HARE_FOOT,
              quantity: 1,
              stackable: true,
              chance: 0.1,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 10,
          offsetX: 10,
          offsetY: 12,
          pushable: false,
        },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING, StateName.RUNNING],
    behaviors: [
      {
        name: BehaviorName.WANDER,
        config: { radius: 80, idle: { range: [6000, 12000] } },
      },
      {
        name: BehaviorName.FLEE,
      },
    ],
  },
  [EntityName.GROUSE]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 25,
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 10,
          offsetX: 10,
          offsetY: 12,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.GROUSE_IDLE, interval: [6000, 14000] },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING, StateName.FLYING],
    behaviors: [
      {
        name: BehaviorName.WANDER,
        config: { radius: 80, idle: { range: [6000, 12000] } },
      },
      {
        name: BehaviorName.FLEE,
        config: { flying: true },
      },
    ],
  },
  [EntityName.DEER]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 50,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.VENISON_MEAT,
              quantity: 1,
              stackable: true,
              chance: 1,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 10,
          offsetX: 10,
          offsetY: 12,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.DEER_IDLE, interval: [6000, 14000] },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING, StateName.RUNNING],
    behaviors: [
      {
        name: BehaviorName.WANDER,
        config: { radius: 80, idle: { range: [6000, 12000] } },
      },
      {
        name: BehaviorName.FLEE,
      },
    ],
  },
  [EntityName.GOOSE]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 20,
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 10,
          offsetX: 10,
          offsetY: 12,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.GOOSE_IDLE, interval: [5000, 12000] },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 60, idle: { range: [10000, 20000] } },
      },
    ],
  },
  [EntityName.GOAT]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 30,
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 10,
          offsetX: 10,
          offsetY: 12,
          pushable: false,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.GOAT_IDLE, interval: [5000, 12000] },
      },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 60, idle: { range: [10000, 20000] } },
      },
    ],
  },
  [EntityName.RAT]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 40,
    scale: 0.50,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.RAT_CLAWS,
              quantity: 1,
              stackable: true,
              chance: 0.6,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 10,
          offsetX: 58,
          offsetY: 60,
          pushable: false,
        },
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
        damage: { type: DamageType.PIERCING, amount: 8 },
        effects: [[EffectName.POISONED, 6000, 0.25]],
        range: 30,
      },
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 60,
          scan: { interval: 2500 },
          idle: { duration: 1500 },
          vision: 200,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
      { name: BehaviorName.SEARCH },
    ],
  },
};
