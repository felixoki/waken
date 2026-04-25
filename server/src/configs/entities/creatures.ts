import {
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  SpellName,
  StateName,
  WeaponName,
} from "../../types";
import { DamageType } from "../../types/damage.js";

export const creatures: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ORC1]: {
    facing: Direction.DOWN,
    moving: [],
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
              name: EntityName.IRON1,
              quantity: 1,
              stackable: true,
              chance: 0.5,
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
  [EntityName.GOBLIN1]: {
    facing: Direction.DOWN,
    moving: [],
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
              chance: 0.25,
            },
            {
              name: EntityName.BONE,
              quantity: 1,
              stackable: true,
              chance: 0.5,
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
  [EntityName.TROLL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.WOOD,
              quantity: 1,
              stackable: true,
              chance: 0.5,
            },
            {
              name: EntityName.IRON1,
              quantity: 1,
              stackable: true,
              chance: 0.3,
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
        range: 40,
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
    ],
  },
  [EntityName.SHADOW_WANDERER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.SPELL_BOOK_HURT_SHADOWS,
              quantity: 1,
              stackable: false,
              chance: 0.25,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
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
  },
};
