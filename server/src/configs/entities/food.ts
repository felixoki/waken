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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 35, end: 36 },
            { row: 12, start: 35, end: 36 },
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
      icon: { spritesheet: "icons8", row: 12, col: 34 },
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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 29, end: 30 },
            { row: 12, start: 29, end: 30 },
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
      icon: { spritesheet: "icons8", row: 12, col: 28 },
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
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 9, start: 17, end: 18 },
            { row: 10, start: 17, end: 18 },
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
      icon: { spritesheet: "icons1", row: 10, col: 16 },
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
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 9, start: 29, end: 30 },
            { row: 10, start: 29, end: 30 },
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
      icon: { spritesheet: "icons1", row: 10, col: 28 },
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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 29, end: 30 },
            { row: 12, start: 29, end: 30 },
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
      icon: { spritesheet: "icons8", row: 12, col: 28 },
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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 29, end: 30 },
            { row: 12, start: 29, end: 30 },
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
      icon: { spritesheet: "icons8", row: 12, col: 28 },
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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 32, end: 33 },
            { row: 12, start: 32, end: 33 },
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
      icon: { spritesheet: "icons8", row: 12, col: 31 },
      weight: 1.5,
    },
  },
  [EntityName.GOAT_MILK]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 19, start: 23, end: 24 },
            { row: 20, start: 23, end: 24 },
          ],
        },
        key: "goat_milk_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Goat milk",
      description: "A pail of fresh, creamy milk from a well-fed goat.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 20, col: 22 },
      weight: 1,
    },
  },
  [EntityName.COW_MILK]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 19, start: 23, end: 24 },
            { row: 20, start: 23, end: 24 },
          ],
        },
        key: "cow_milk_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Cow milk",
      description: "A pail of rich, full milk from a contented cow.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 20, col: 22 },
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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 26, end: 27 },
            { row: 12, start: 26, end: 27 },
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
      icon: { spritesheet: "icons8", row: 12, col: 25 },
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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 20, end: 21 },
            { row: 12, start: 20, end: 21 },
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
      icon: { spritesheet: "icons8", row: 12, col: 19 },
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
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 11, start: 23, end: 24 },
            { row: 12, start: 23, end: 24 },
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
      icon: { spritesheet: "icons8", row: 12, col: 22 },
      weight: 0.75,
    },
  },
};
