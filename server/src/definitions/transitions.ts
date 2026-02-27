import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  MapName,
} from "../types";

export const transitions: Partial<Record<EntityName, EntityDefinition>> = {
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
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.JUMP]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
          static: true,
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
        key: "jump_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
};
