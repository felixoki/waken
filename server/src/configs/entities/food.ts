import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const food: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.VENISON_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 19, start: 5, end: 6 },
            { row: 20, start: 5, end: 6 },
          ],
        },
        key: "venison_meat_texture",
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
      displayName: "Venison",
      description: "A cut of fresh venison taken from wild game.",
      stackable: true,
      icon: { spritesheet: "items", row: 20, col: 4 },
      weight: 1.5,
    },
  },
  [EntityName.BOAR_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 8, end: 9 },
            { row: 18, start: 8, end: 9 },
          ],
        },
        key: "boar_meat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Boar meat",
      description: "A cut of tough meat taken from a wild boar.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 16 },
      weight: 1.5,
    },
  },
  [EntityName.RASPBERRY_JAM]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 23, end: 24 },
            { row: 18, start: 23, end: 24 },
          ],
        },
        key: "raspberry_jam_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Raspberry jam",
      description: "A jar of raspberries boiled down into a sweet preserve.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 22 },
      weight: 0.4,
    },
  },
  [EntityName.STRAWBERRY_JAM]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 19, start: 2, end: 3 },
            { row: 20, start: 2, end: 3 },
          ],
        },
        key: "strawberry_jam_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Strawberry jam",
      description: "A jar of strawberries boiled down into a sweet preserve.",
      stackable: true,
      icon: { spritesheet: "items", row: 20, col: 1 },
      weight: 0.4,
    },
  },
  [EntityName.CHICKEN_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 14, end: 15 },
            { row: 18, start: 14, end: 15 },
          ],
        },
        key: "chicken_meat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Chicken meat",
      description: "A lean cut of meat from a farmyard fowl.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 16 },
      weight: 1,
    },
  },
  [EntityName.GOOSE_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 17, end: 18 },
            { row: 18, start: 17, end: 18 },
          ],
        },
        key: "goose_meat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Goose meat",
      description: "A dark, fatty cut of meat from a goose.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 16 },
      weight: 1.5,
    },
  },
  [EntityName.BEEF]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 2, end: 3 },
            { row: 18, start: 2, end: 3 },
          ],
        },
        key: "beef_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Beef",
      description: "A heavy cut of meat taken from cattle.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 1 },
      weight: 1.5,
    },
  },
  [EntityName.MILK]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 20, end: 21 },
            { row: 18, start: 20, end: 21 },
          ],
        },
        key: "milk_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Milk",
      description: "A pail of fresh, creamy milk.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 19 },
      weight: 1,
    },
  },
  [EntityName.BREAD]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 11, end: 12 },
            { row: 18, start: 11, end: 12 },
          ],
        },
        key: "bread_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bread",
      description: "A freshly baked loaf of bread.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 10 },
      weight: 0.5,
    },
  },
  [EntityName.BEER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 17, start: 5, end: 6 },
            { row: 18, start: 5, end: 6 },
          ],
        },
        key: "beer_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Beer",
      description: "A frothy mug of home-brewed beer.",
      stackable: true,
      icon: { spritesheet: "items", row: 18, col: 4 },
      weight: 0.5,
    },
  },
  [EntityName.WINE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 19, start: 8, end: 9 },
            { row: 20, start: 8, end: 9 },
          ],
        },
        key: "wine_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wine",
      description: "A bottle of fine wine.",
      stackable: true,
      icon: { spritesheet: "items", row: 20, col: 7 },
      weight: 0.75,
    },
  },
};
