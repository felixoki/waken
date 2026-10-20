import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  Rarity,
} from "../../types";

export const fish: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.CARP]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 15, start: 2, end: 3 },
            { row: 16, start: 2, end: 3 },
          ],
        },
        key: "carp_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carp",
      description: "A sturdy river carp.",
      stackable: false,
      rarity: Rarity.COMMON,
      icon: { spritesheet: "items", row: 16, col: 1 },
      weight: 3.8,
    },
  },
  [EntityName.PERCH]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 15, start: 8, end: 9 },
            { row: 16, start: 8, end: 9 },
          ],
        },
        key: "perch_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Perch",
      description: "A small striped perch, common in these waters.",
      stackable: false,
      rarity: Rarity.COMMON,
      icon: { spritesheet: "items", row: 16, col: 7 },
      weight: 0.8,
    },
  },
  [EntityName.PIKE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 15, start: 11, end: 12 },
            { row: 16, start: 11, end: 12 },
          ],
        },
        key: "pike_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Pike",
      description: "A large predatory pike, common in freshwater lakes.",
      stackable: false,
      rarity: Rarity.RARE,
      icon: { spritesheet: "items", row: 16, col: 10 },
      weight: 5.6,
    },
  },
  [EntityName.CAVEFISH]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 15, start: 5, end: 6 },
            { row: 16, start: 5, end: 6 },
          ],
        },
        key: "cavefish_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Cavefish",
      description: "A pale, eyeless fish from the sunless pools.",
      stackable: false,
      rarity: Rarity.RARE,
      icon: { spritesheet: "items", row: 16, col: 4 },
      weight: 1.1,
    },
  },
};
