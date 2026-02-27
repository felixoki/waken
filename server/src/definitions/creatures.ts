import {
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  StateName,
} from "../types";

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
              name: EntityName.FLYAMINATA1,
              quantity: 1,
              stackable: true,
              chance: 1,
            },
            {
              name: EntityName.BASKETFERN,
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
};
