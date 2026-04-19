import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  GrowthStage,
} from "../../types";

export const crops: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.FARMPLOT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering4",
          tileSize: 16,
          tiles: [],
        },
        key: "farmplot_texture",
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
      { name: ComponentName.FARMABLE },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CARROT_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carrot Seed",
      description: "Plant to grow a carrot.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 1, col: 1 },
    },
  },
  [EntityName.CARROT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering5",
          tileSize: 16,
          tiles: [{ row: 21, start: 12, end: 12 }],
        },
        key: "carrot_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "gathering4",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [{ row: 7, start: 1, end: 1 }],
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.33,
              tiles: [
                { row: 6, start: 2, end: 2 },
                { row: 7, start: 2, end: 2 },
              ],
              offsetY: -8,
            },
            {
              stage: GrowthStage.MATURE,
              at: 0.66,
              tiles: [
                { row: 6, start: 3, end: 3 },
                { row: 7, start: 3, end: 3 },
              ],
              offsetY: -8,
            },
          ],
          duration: 9_000,
          yield: [{ name: EntityName.CARROT, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: false,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carrot",
      description: "A crunchy orange root vegetable.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 1, col: 1 },
    },
  },
  [EntityName.TOMATO_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Tomato Seed",
      description: "Plant to grow a tomato.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 1, col: 2 },
    },
  },
  [EntityName.TOMATO]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering5",
          tileSize: 16,
          tiles: [{ row: 19, start: 2, end: 2 }],
        },
        key: "tomato_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "gathering4",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [{ row: 3, start: 17, end: 18 }],
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.33,
              tiles: [
                { row: 2, start: 19, end: 20 },
                { row: 3, start: 19, end: 20 },
              ],
              offsetY: -8,
            },
            {
              stage: GrowthStage.MATURE,
              at: 0.66,
              tiles: [
                { row: 1, start: 23, end: 24 },
                { row: 2, start: 23, end: 24 },
                { row: 3, start: 23, end: 24 },
              ],
              offsetY: -16,
            },
          ],
          duration: 9_000,
          yield: [{ name: EntityName.TOMATO, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: false,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Tomato",
      description: "A plump red fruit.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 1, col: 2 },
    },
  },
  [EntityName.CABBAGE_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Cabbage Seed",
      description: "Plant to grow a cabbage.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 1, col: 3 },
    },
  },
  [EntityName.CABBAGE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering5",
          tileSize: 16,
          tiles: [{ row: 20, start: 7, end: 7 }],
        },
        key: "cabbage_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "gathering4",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [
                { row: 4, start: 1, end: 2 },
                { row: 5, start: 1, end: 2 },
              ],
              offsetY: -4,
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.33,
              tiles: [
                { row: 4, start: 3, end: 4 },
                { row: 5, start: 3, end: 4 },
              ],
              offsetY: -4,
            },
            {
              stage: GrowthStage.MATURE,
              at: 0.66,
              tiles: [
                { row: 4, start: 5, end: 6 },
                { row: 5, start: 5, end: 6 },
              ],
              offsetY: -4,
            },
          ],
          duration: 9_000,
          yield: [{ name: EntityName.CABBAGE, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: false,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Cabbage",
      description: "A leafy green vegetable.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 1, col: 3 },
    },
  },
};
