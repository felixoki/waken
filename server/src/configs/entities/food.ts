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
            { row: 11, start: 32, end: 33 },
            { row: 12, start: 32, end: 33 },
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
