import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../types";

export const rocks: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ROCK1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 45, start: 2, end: 5 },
            { row: 46, start: 2, end: 5 },
            { row: 47, start: 2, end: 5 },
            { row: 48, start: 2, end: 5 },
          ],
        },
        key: "rock1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 40,
          height: 24,
          offsetX: 8,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 45, start: 6, end: 8 },
            { row: 46, start: 6, end: 8 },
            { row: 47, start: 6, end: 8 },
          ],
        },
        key: "rock2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 16,
          offsetX: 8,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 45, start: 9, end: 11 },
            { row: 46, start: 9, end: 11 },
            { row: 47, start: 9, end: 11 },
          ],
        },
        key: "rock3_texture",
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
  [EntityName.ROCK4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 49, start: 2, end: 5 },
            { row: 50, start: 2, end: 5 },
            { row: 51, start: 2, end: 5 },
            { row: 52, start: 2, end: 5 },
          ],
        },
        key: "rock4_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 40,
          height: 24,
          offsetX: 12,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK8]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 53, start: 6, end: 7 },
            { row: 54, start: 6, end: 7 },
          ],
        },
        key: "rock8_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 8, offsetX: 8, offsetY: 16, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 29, start: 11, end: 13 },
            { row: 30, start: 11, end: 13 },
            { row: 31, start: 11, end: 13 },
          ],
        },
        key: "rocks1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 16,
          offsetX: 16,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 33, start: 2, end: 3 },
            { row: 34, start: 2, end: 3 },
          ],
        },
        key: "rocks3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 33, start: 8, end: 9 },
            { row: 34, start: 8, end: 9 },
          ],
        },
        key: "rocks5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 33, start: 10, end: 11 },
            { row: 34, start: 10, end: 11 },
          ],
        },
        key: "rocks6_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
};
