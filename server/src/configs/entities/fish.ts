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
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 3, start: 14, end: 15 },
            { row: 4, start: 14, end: 15 },
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
      icon: { spritesheet: "icons1", row: 4, col: 13 },
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
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 1, start: 26, end: 27 },
            { row: 2, start: 26, end: 27 },
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
      icon: { spritesheet: "icons1", row: 2, col: 25 },
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
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 3, start: 8, end: 9 },
            { row: 4, start: 8, end: 9 },
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
      icon: { spritesheet: "icons1", row: 4, col: 7 },
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
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 1, start: 2, end: 3 },
            { row: 2, start: 2, end: 3 },
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
      icon: { spritesheet: "icons1", row: 2, col: 1 },
      weight: 1.1,
    },
  },
};
