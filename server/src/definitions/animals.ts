import {
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  StateName,
} from "../types";

export const animals: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.BOAR]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
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
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
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
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
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
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
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
    components: [
      { name: ComponentName.ANIMATION },
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
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
};
