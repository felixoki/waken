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
  [EntityName.BOX1]: {
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
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 38, start: 8, end: 9 },
            { row: 39, start: 8, end: 9 },
          ],
        },
        key: "box1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES1]: {
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
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 35, start: 8, end: 10 },
            { row: 36, start: 8, end: 10 },
            { row: 37, start: 8, end: 10 },
          ],
        },
        key: "box1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES_FISH1]: {
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
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 18, start: 1, end: 4 },
            { row: 19, start: 1, end: 4 },
            { row: 20, start: 1, end: 4 },
            { row: 21, start: 1, end: 4 },
            { row: 22, start: 1, end: 4 },
          ],
        },
        key: "boxes_fish1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES_FISH2]: {
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
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 23, start: 1, end: 4 },
            { row: 24, start: 1, end: 4 },
            { row: 25, start: 1, end: 4 },
          ],
        },
        key: "boxes_fish2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES_FISH3]: {
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
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 23, start: 5, end: 7 },
            { row: 24, start: 5, end: 7 },
            { row: 25, start: 5, end: 7 },
          ],
        },
        key: "boxes_fish3_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FISH_STAND1]: {
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
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 18, start: 5, end: 9 },
            { row: 19, start: 5, end: 9 },
            { row: 20, start: 5, end: 9 },
          ],
        },
        key: "fish_stand1_texture",
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
          autoplay: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CHEST1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 16,
          offsetX: 4,
          offsetY: 16,
          static: true,
          collides: true,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "chests",
          tileSize: 16,
          tiles: [
            { row: 1, start: 11, end: 12 },
            { row: 2, start: 11, end: 12 },
          ],
          frames: 4,
          direction: "vertical",
          frameRate: 8,
          repeat: 0,
          autoplay: false,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 16 } },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Chest",
      description: "A sturdy wooden chest used to store valuables.",
    },
  },
};
