import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  MapName,
} from "../../types";

export const transitions: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.VILLAGE_PORTAL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 136, start: 1, end: 10 },
            { row: 137, start: 1, end: 10 },
            { row: 138, start: 1, end: 10 },
            { row: 139, start: 1, end: 10 },
            { row: 140, start: 1, end: 10 },
            { row: 141, start: 1, end: 10 },
            { row: 142, start: 1, end: 10 },
            { row: 143, start: 1, end: 10 },
            { row: 144, start: 1, end: 10 },
            { row: 145, start: 1, end: 10 },
          ],
          frames: 6,
          wrap: 2,
          direction: "vertical",
          frameRate: 8,
          repeat: -1,
          autoplay: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 434,
          y: 608,
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HOUSE1_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 432,
          y: 608,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.HERBALIST_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 208,
          y: 176,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.WELL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 120, start: 1, end: 3 },
            { row: 121, start: 1, end: 3 },
            { row: 122, start: 1, end: 3 },
          ],
        },
        key: "well_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 12,
          offsetX: 8,
          offsetY: 16,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 432,
          y: 632,
          width: 24,
          height: 24,
          offsetX: -6,
          offsetY: -2,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.LADDER]: {
    facing: Direction.DOWN,
    moving: [],
    offset: { x: 0, y: -8 },
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 81, start: 1, end: 1 },
            { row: 82, start: 1, end: 1 },
            { row: 83, start: 1, end: 1 },
            { row: 84, start: 1, end: 1 },
          ],
        },
        key: "ladder_texture",
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 432,
          y: 632,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CLOUDLADDER]: {
    facing: Direction.DOWN,
    moving: [],
    offset: { x: 0, y: -8 },
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 23, start: 1, end: 1 },
            { row: 24, start: 1, end: 1 },
            { row: 25, start: 1, end: 1 },
            { row: 26, start: 1, end: 1 },
          ],
        },
        key: "cloudladder_texture",
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.ISLES,
          x: 360,
          y: 1432,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.DUNGEON_ENTRANCE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 27, start: 1, end: 8 },
            { row: 28, start: 1, end: 8 },
            { row: 29, start: 1, end: 8 },
            { row: 30, start: 1, end: 8 },
            { row: 31, start: 1, end: 8 },
            { row: 32, start: 1, end: 8 },
            { row: 33, start: 1, end: 8 },
          ],
        },
        key: "dungeon_entrance_texture",
      },
      { name: ComponentName.TRACKABLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 96,
          height: 56,
          offsetX: 16,
          offsetY: 24,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.DUNGEON,
          x: 1024,
          y: 1024,
          width: 20,
          height: 12,
          offsetX: -2,
          offsetY: 28,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TEMPLE_ENTRANCE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 104, start: 1, end: 11 },
            { row: 105, start: 1, end: 11 },
            { row: 106, start: 1, end: 11 },
            { row: 107, start: 1, end: 11 },
            { row: 108, start: 1, end: 11 },
            { row: 109, start: 1, end: 11 },
            { row: 110, start: 1, end: 11 },
            { row: 111, start: 1, end: 11 },
            { row: 112, start: 1, end: 11 },
          ],
        },
        key: "temple_entrance_texture",
      },
      { name: ComponentName.TRACKABLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 100,
          height: 44,
          offsetX: 38,
          offsetY: 66,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.TEMPLE,
          x: 1024,
          y: 1024,
          width: 20,
          height: 12,
          offsetX: 1,
          offsetY: 42,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CAVE_ENTRANCE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 16, start: 1, end: 8 },
            { row: 17, start: 1, end: 8 },
            { row: 18, start: 1, end: 8 },
            { row: 19, start: 1, end: 8 },
            { row: 20, start: 1, end: 8 },
            { row: 21, start: 1, end: 8 },
            { row: 22, start: 1, end: 8 },
          ],
        },
        key: "cave_entrance_texture",
      },
      { name: ComponentName.TRACKABLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 120,
          height: 72,
          offsetX: 4,
          offsetY: 16,
          static: true,
        },
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.CAVE,
          x: 256,
          y: 256,
          width: 24,
          height: 12,
          offsetX: 0,
          offsetY: 36,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CAVE_EXIT]: {
    facing: Direction.DOWN,
    offset: { y: 6 },
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "buildings",
          tileSize: 16,
          tiles: [
            { row: 16, start: 9, end: 12 },
            { row: 17, start: 9, end: 12 },
            { row: 18, start: 9, end: 12 },
            { row: 19, start: 9, end: 12 },
          ],
        },
        key: "cave_exit_texture",
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 434,
          y: 608,
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 18,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BLACKSMITH_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 120,
          y: 1412,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.MARKET_HOUSE_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 592,
          y: 1420,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TAVERN_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 160,
          y: 1240,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.GLASSBLOWER_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 376,
          y: 1407,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FARM_HOUSE_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 944,
          y: 142,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.WINDMILL_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 560,
          y: 176,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FISHING_HUT_EXIT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.VILLAGE,
          x: 856,
          y: 1396,
          width: 32,
          height: 16,
          offsetX: 0,
          offsetY: 16,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
};
