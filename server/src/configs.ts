import {
  AnimationConfig,
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  MapConfig,
  MapName,
  StateName,
} from "./types";

export const ANIMATIONS: Partial<
  Record<EntityName, Partial<Record<StateName, AnimationConfig>>>
> = {
  [EntityName.PLAYER]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: -1,
    },
    [StateName.JUMPING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
    [StateName.CASTING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
  },
  [EntityName.ORC1]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 8,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: -1,
    },
    [StateName.SLASHING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
  },
};

/**
 * Maps
 */

export const MAPS: Record<MapName, MapConfig> = {
  [MapName.VILLAGE]: {
    id: MapName.VILLAGE,
    json: "village.json",
  }
}

/**
 * Entity Definitions
 */

export const DEFINITIONS: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ORC1]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 32,
          offsetX: 24,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    behaviors: [BehaviorName.PATROL],
  },
  [EntityName.HOUSE1]: {
    direction: Direction.DOWN,
    directions: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "player_home",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 10 },
            { row: 2, start: 1, end: 10 },
            { row: 3, start: 1, end: 10 },
            { row: 4, start: 1, end: 10 },
            { row: 5, start: 1, end: 10 },
            { row: 6, start: 1, end: 10 },
            { row: 7, start: 1, end: 10 },
            { row: 8, start: 1, end: 10 },
            { row: 9, start: 1, end: 10 },
          ],
        },
        key: "house1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
};
