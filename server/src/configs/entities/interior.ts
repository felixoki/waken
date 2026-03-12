import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const interior: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.BARREL1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
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
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_market_objects",
          tileSize: 16,
          tiles: [
            { row: 33, start: 21, end: 23 },
            { row: 34, start: 21, end: 23 },
            { row: 35, start: 21, end: 23 },
            { row: 36, start: 21, end: 23 },
          ],
        },
        key: "barrel1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BARRELS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
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
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_market_objects",
          tileSize: 16,
          tiles: [
            { row: 19, start: 27, end: 29 },
            { row: 20, start: 27, end: 29 },
            { row: 21, start: 27, end: 29 },
          ],
        },
        key: "barrels1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TORCH1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 100,
          intensity: 0.8,
          color: 0xffd980,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "torch",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 2 },
            { row: 2, start: 1, end: 2 },
            { row: 3, start: 1, end: 2 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 10,
          repeat: -1,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
};
