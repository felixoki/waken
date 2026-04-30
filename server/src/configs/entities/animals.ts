import {
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  StateName,
  WeaponName,
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
        range: 40,
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
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 60, idle: { range: [10000, 20000] } },
      },
    ],
  },
};
