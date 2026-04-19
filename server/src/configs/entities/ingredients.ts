import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const ingredients: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.FLYAMINATA1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 41, start: 5, end: 6 },
            { row: 42, start: 5, end: 6 },
          ],
        },
        key: "flyaminata1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 16, offsetX: 8, offsetY: 8, static: true },
      },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
      },
      {
        name: ComponentName.HOVERABLE,
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Fly aminata",
      description: "A small, delicate mushroom with a pale cap.",
      stackable: true,
    },
  },
  [EntityName.BASKETFERN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 55, start: 2, end: 2 },
            { row: 56, start: 2, end: 2 },
          ],
        },
        key: "basketfern_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 24, offsetX: 0, offsetY: 8, static: true },
      },
      {
        name: ComponentName.POINTABLE,
      },
      {
        name: ComponentName.PICKABLE,
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Basket fern",
      description: "A lush green fern typical for this region.",
      stackable: true,
    },
  },
  [EntityName.BELLADONNA]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering1",
          tileSize: 16,
          tiles: [
            { row: 15, start: 7, end: 8 },
            { row: 16, start: 7, end: 8 },
          ],
        },
        key: "belladonna_texture",
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
      {
        name: ComponentName.POINTABLE,
      },
      {
        name: ComponentName.PICKABLE,
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Belladonna",
      description: "A poisonous plant with striking purple flowers.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 16, col: 13 },
    },
  },
  [EntityName.SUNFLOWER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering3",
          tileSize: 16,
          tiles: [
            { row: 25, start: 5, end: 6 },
            { row: 26, start: 5, end: 6 },
            { row: 27, start: 5, end: 6 },
          ],
        },
        key: "sunflower_texture",
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
      {
        name: ComponentName.POINTABLE,
      },
      {
        name: ComponentName.PICKABLE,
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Sunflower",
      description: "A tall, bright flower that follows the sun.",
      stackable: true,
    },
  },
};
