import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../types";

export const flora: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.TREE1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 24, start: 6, end: 9 },
            { row: 25, start: 6, end: 9 },
            { row: 26, start: 6, end: 9 },
            { row: 27, start: 6, end: 9 },
            { row: 28, start: 6, end: 9 },
          ],
        },
        key: "tree1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 48,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 15, start: 13, end: 16 },
            { row: 16, start: 13, end: 16 },
            { row: 17, start: 13, end: 16 },
            { row: 18, start: 13, end: 16 },
          ],
        },
        key: "tree2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 32,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 35, start: 11, end: 16 },
            { row: 36, start: 11, end: 16 },
            { row: 37, start: 11, end: 16 },
            { row: 38, start: 11, end: 16 },
            { row: 39, start: 11, end: 16 },
          ],
        },
        key: "tree5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 36,
          offsetY: 48,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 43, start: 13, end: 16 },
            { row: 44, start: 13, end: 16 },
            { row: 45, start: 13, end: 16 },
            { row: 46, start: 13, end: 16 },
            { row: 47, start: 13, end: 16 },
          ],
        },
        key: "tree5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 48,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.APPLETREE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 25, start: 10, end: 13 },
            { row: 26, start: 10, end: 13 },
            { row: 27, start: 10, end: 13 },
            { row: 28, start: 10, end: 13 },
          ],
        },
        key: "appletree2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 32,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.STUMP1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 43, start: 7, end: 9 },
            { row: 44, start: 7, end: 9 },
          ],
        },
        key: "stump1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 28, height: 8, offsetX: 12, offsetY: 8, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.STUMP2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 51, start: 12, end: 13 },
            { row: 52, start: 12, end: 13 },
          ],
        },
        key: "stump2_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 12, height: 8, offsetX: 12, offsetY: 8, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 25, start: 14, end: 16 },
            { row: 26, start: 14, end: 16 },
            { row: 27, start: 14, end: 16 },
          ],
        },
        key: "bush1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 12,
          offsetX: 12,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 29, start: 5, end: 6 },
            { row: 30, start: 5, end: 6 },
          ],
        },
        key: "bush2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 12,
          offsetX: 8,
          offsetY: 16,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "plants_bushes",
          tileSize: 16,
          tiles: [
            { row: 1, start: 16, end: 18 },
            { row: 2, start: 16, end: 18 },
            { row: 3, start: 16, end: 18 },
          ],
        },
        key: "bush3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 4,
          height: 4,
          offsetX: 24,
          offsetY: 20,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "plants_bushes",
          tileSize: 16,
          tiles: [
            { row: 4, start: 25, end: 26 },
            { row: 5, start: 25, end: 26 },
          ],
        },
        key: "bush4_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 4,
          height: 4,
          offsetX: 16,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "reed",
          tileSize: 16,
          tiles: [{ row: 2, start: 2, end: 2 }],
        },
        key: "reed1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "reed",
          tileSize: 16,
          tiles: [{ row: 2, start: 4, end: 4 }],
        },
        key: "reed2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED3]: {
    facing: Direction.DOWN,
    moving: [],
    offset: { y: -8 },
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "reed",
          tileSize: 16,
          tiles: [
            { row: 1, start: 6, end: 6 },
            { row: 2, start: 6, end: 6 },
          ],
        },
        key: "reed3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 0,
          offsetY: 8,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
};
