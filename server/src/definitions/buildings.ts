import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  MapName,
} from "../types";

export const buildings: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.HOUSE1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
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
      {
        name: ComponentName.BODY,
        config: {
          width: 128,
          height: 48,
          offsetX: 32,
          offsetY: 80,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.HOME,
          x: 184,
          y: 168,
          width: 16,
          height: 16,
          offsetX: 48,
          offsetY: 56,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HERBALIST_HOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_herbalist_house",
          tileSize: 16,
          tiles: [
            { row: 9, start: 26, end: 37 },
            { row: 10, start: 26, end: 37 },
            { row: 11, start: 26, end: 37 },
            { row: 12, start: 26, end: 37 },
            { row: 13, start: 26, end: 37 },
            { row: 14, start: 26, end: 37 },
            { row: 15, start: 26, end: 37 },
            { row: 16, start: 26, end: 37 },
          ],
        },
        key: "herbalist_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 128,
          height: 48,
          offsetX: 32,
          offsetY: 60,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.HERBALIST_HOUSE,
          x: 128,
          y: 168,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 40,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.WINDMILL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 8 },
            { row: 2, start: 1, end: 8 },
            { row: 3, start: 1, end: 8 },
            { row: 4, start: 1, end: 8 },
            { row: 5, start: 1, end: 8 },
            { row: 6, start: 1, end: 8 },
            { row: 7, start: 1, end: 8 },
            { row: 8, start: 1, end: 8 },
            { row: 9, start: 1, end: 8 },
          ],
        },
        key: "windmill_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BARN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 1, start: 9, end: 13 },
            { row: 2, start: 9, end: 13 },
            { row: 3, start: 9, end: 13 },
            { row: 4, start: 9, end: 13 },
            { row: 5, start: 9, end: 13 },
          ],
        },
        key: "barn_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HENHOUSE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 2, start: 15, end: 17 },
            { row: 3, start: 15, end: 17 },
            { row: 4, start: 15, end: 17 },
            { row: 5, start: 15, end: 17 },
          ],
        },
        key: "henhouse_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HOUSE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_farm_house",
          tileSize: 16,
          tiles: [
            { row: 2, start: 18, end: 25 },
            { row: 3, start: 18, end: 25 },
            { row: 4, start: 18, end: 25 },
            { row: 5, start: 18, end: 25 },
            { row: 6, start: 18, end: 25 },
            { row: 7, start: 18, end: 25 },
            { row: 8, start: 18, end: 25 },
            { row: 9, start: 18, end: 25 },
          ],
        },
        key: "windmill_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 64, height: 64, offsetX: 0, offsetY: 0, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
};
