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
          spritesheet: "isles_tree",
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
            { row: 10, start: 1, end: 10 },
          ],
          frames: 6,
          direction: "horizontal",
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
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 35, start: 5, end: 7 },
            { row: 36, start: 5, end: 7 },
            { row: 37, start: 5, end: 7 },
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
          spritesheet: "dungeon_objects1",
          tileSize: 16,
          tiles: [
            { row: 2, start: 8, end: 8 },
            { row: 3, start: 8, end: 8 },
            { row: 4, start: 8, end: 8 },
            { row: 5, start: 8, end: 8 },
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
          spritesheet: "dungeon_objects1",
          tileSize: 16,
          tiles: [
            { row: 2, start: 8, end: 8 },
            { row: 3, start: 8, end: 8 },
            { row: 4, start: 8, end: 8 },
            { row: 5, start: 8, end: 8 },
          ],
        },
        key: "cloudladder_texture",
      },
      {
        name: ComponentName.TRANSITION,
        config: {
          to: MapName.ISLES,
          x: 184,
          y: 168,
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
          spritesheet: "entrances",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 8 },
            { row: 2, start: 1, end: 8 },
            { row: 3, start: 1, end: 8 },
            { row: 4, start: 1, end: 8 },
            { row: 5, start: 1, end: 8 },
            { row: 6, start: 1, end: 8 },
            { row: 7, start: 1, end: 8 },
          ],
        },
        key: "dungeon_entrance_texture",
      },
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
  [EntityName.CAVE_ENTRANCE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "entrances",
          tileSize: 16,
          tiles: [
            { row: 8, start: 1, end: 8 },
            { row: 9, start: 1, end: 8 },
            { row: 10, start: 1, end: 8 },
            { row: 11, start: 1, end: 8 },
            { row: 12, start: 1, end: 8 },
            { row: 13, start: 1, end: 8 },
            { row: 14, start: 1, end: 8 },
          ],
        },
        key: "cave_entrance_texture",
      },
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
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "cave_objects",
          tileSize: 16,
          tiles: [
            { row: 27, start: 33, end: 36 },
            { row: 28, start: 33, end: 36 },
            { row: 29, start: 33, end: 36 },
            { row: 30, start: 33, end: 36 },
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
          offsetY: 0,
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
