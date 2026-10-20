import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  GrowthStage,
} from "../../types";
import { DAY } from "../../globals";

export const crops: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.FARMPLOT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
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
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 11, end: 12 },
            { row: 4, start: 11, end: 12 },
          ],
        },
        key: "carrot_seed_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carrot Seed",
      description: "A humble seed that grows into a crunchy carrot.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 10 },
      weight: 0.01,
    },
  },
  [EntityName.CARROT_PLANT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 4, start: 2, end: 2 },
          ],
        },
        key: "carrot_plant_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 11,
          offsetX: 2,
          offsetY: 16,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [
                { row: 4, start: 16, end: 16 },
              ],
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.5,
              tiles: [
                { row: 4, start: 17, end: 17 },
                { row: 5, start: 17, end: 17 },
              ],
              offsetY: -8,
            },
            {
              stage: GrowthStage.MATURE,
              at: 1.0,
              tiles: [
                { row: 4, start: 18, end: 18 },
                { row: 5, start: 18, end: 18 },
              ],
              offsetY: -8,
            },
          ],
          duration: 2 * DAY,
          yield: [{ name: EntityName.CARROT, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: true,
        },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carrot",
      description: "A crunchy orange root vegetable grown from seed.",
    },
  },
  [EntityName.CARROT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 8, end: 9 },
            { row: 4, start: 8, end: 9 },
          ],
        },
        key: "carrot_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carrot",
      description: "A crunchy orange root vegetable grown from seed.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 7 },
      weight: 0.1,
    },
  },
  [EntityName.TOMATO_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 5, start: 5, end: 6 },
            { row: 6, start: 5, end: 6 },
          ],
        },
        key: "tomato_seed_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Tomato Seed",
      description: "A small seed that ripens into a plump red tomato.",
      stackable: true,
      icon: { spritesheet: "items", row: 6, col: 4 },
      weight: 0.01,
    },
  },
  [EntityName.TOMATO_PLANT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 4, start: 7, end: 7 },
          ],
        },
        key: "tomato_plant_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 17,
          height: 20,
          offsetX: 6,
          offsetY: 24,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [
                { row: 4, start: 31, end: 32 },
              ],
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.5,
              tiles: [
                { row: 5, start: 1, end: 2 },
                { row: 6, start: 1, end: 2 },
              ],
              offsetY: -8,
            },
            {
              stage: GrowthStage.MATURE,
              at: 1.0,
              tiles: [
                { row: 33, start: 1, end: 2 },
                { row: 34, start: 1, end: 2 },
                { row: 35, start: 1, end: 2 },
              ],
              offsetY: -16,
            },
          ],
          duration: 2 * DAY,
          yield: [{ name: EntityName.TOMATO, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: true,
        },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Tomato",
      description: "A plump red fruit grown on a low-lying vine.",
    },
  },
  [EntityName.TOMATO]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 5, start: 2, end: 3 },
            { row: 6, start: 2, end: 3 },
          ],
        },
        key: "tomato_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Tomato",
      description: "A plump red fruit grown on a low-lying vine.",
      stackable: true,
      icon: { spritesheet: "items", row: 6, col: 1 },
      weight: 0.15,
    },
  },
  [EntityName.CABBAGE_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 5, end: 6 },
            { row: 4, start: 5, end: 6 },
          ],
        },
        key: "cabbage_seed_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Cabbage Seed",
      description: "A seed that grows into a full head of cabbage.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 4 },
      weight: 0.01,
    },
  },
  [EntityName.CABBAGE_PLANT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 4, start: 1, end: 1 },
          ],
        },
        key: "cabbage_plant_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 9,
          offsetX: 8,
          offsetY: 16,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [
                { row: 4, start: 10, end: 11 },
                { row: 5, start: 10, end: 11 },
              ],
              offsetY: -4,
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.5,
              tiles: [
                { row: 4, start: 12, end: 13 },
                { row: 5, start: 12, end: 13 },
              ],
              offsetY: -4,
            },
            {
              stage: GrowthStage.MATURE,
              at: 1.0,
              tiles: [
                { row: 4, start: 14, end: 15 },
                { row: 5, start: 14, end: 15 },
              ],
              offsetY: -4,
            },
          ],
          duration: 2 * DAY,
          yield: [{ name: EntityName.CABBAGE, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: true,
        },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Cabbage",
      description: "A dense leafy green vegetable grown in rows.",
    },
  },
  [EntityName.CABBAGE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 2, end: 3 },
            { row: 4, start: 2, end: 3 },
          ],
        },
        key: "cabbage_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Cabbage",
      description: "A dense leafy green vegetable grown in rows.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 1 },
      weight: 1,
    },
  },
  [EntityName.WHEAT_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 5, start: 11, end: 12 },
            { row: 6, start: 11, end: 12 },
          ],
        },
        key: "wheat_seed_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wheat seed",
      description: "A small seed that grows into a stalk of wheat.",
      stackable: true,
      icon: { spritesheet: "items", row: 6, col: 10 },
      weight: 0.01,
    },
  },
  [EntityName.WHEAT_PLANT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 4, start: 8, end: 9 },
            { row: 5, start: 8, end: 9 },
          ],
        },
        key: "wheat_plant_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 11,
          offsetX: 7,
          offsetY: 16,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [
                { row: 5, start: 31, end: 32 },
                { row: 6, start: 31, end: 32 },
              ],
              offsetY: -8,
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.5,
              tiles: [
                { row: 33, start: 3, end: 4 },
                { row: 34, start: 3, end: 4 },
              ],
              offsetY: -8,
            },
            {
              stage: GrowthStage.MATURE,
              at: 1.0,
              tiles: [
                { row: 33, start: 5, end: 6 },
                { row: 34, start: 5, end: 6 },
              ],
              offsetY: -8,
            },
          ],
          duration: 1 * DAY,
          yield: [{ name: EntityName.WHEAT, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: true,
        },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wheat",
      description: "A stalk of wheat grown in fields.",
    },
  },
  [EntityName.WHEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 5, start: 8, end: 9 },
            { row: 6, start: 8, end: 9 },
          ],
        },
        key: "wheat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wheat",
      description: "A stalk of wheat grown in fields.",
      stackable: true,
      icon: { spritesheet: "items", row: 6, col: 7 },
      weight: 0.05,
    },
  },
  [EntityName.GRAPE_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 17, end: 18 },
            { row: 4, start: 17, end: 18 },
          ],
        },
        key: "grape_seed_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Grape seed",
      description: "A small seed that grows into a grapevine.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 16 },
      weight: 0.01,
    },
  },
  [EntityName.GRAPE_PLANT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 4, start: 3, end: 4 },
            { row: 5, start: 3, end: 4 },
            { row: 6, start: 3, end: 4 },
          ],
        },
        key: "grape_plant_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 20,
          offsetX: 8,
          offsetY: 24,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [
                { row: 4, start: 19, end: 20 },
                { row: 5, start: 19, end: 20 },
                { row: 6, start: 19, end: 20 },
              ],
              offsetY: -16,
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.5,
              tiles: [
                { row: 4, start: 21, end: 22 },
                { row: 5, start: 21, end: 22 },
                { row: 6, start: 21, end: 22 },
              ],
              offsetY: -16,
            },
            {
              stage: GrowthStage.MATURE,
              at: 1.0,
              tiles: [
                { row: 4, start: 23, end: 24 },
                { row: 5, start: 23, end: 24 },
                { row: 6, start: 23, end: 24 },
              ],
              offsetY: -16,
            },
          ],
          duration: 1000,
          yield: [{ name: EntityName.GRAPE, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: true,
        },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Grape",
      description: "A bunch of grapes grown on a vine.",
    },
  },
  [EntityName.GRAPE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 14, end: 15 },
            { row: 4, start: 14, end: 15 },
          ],
        },
        key: "grape_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Grape",
      description: "A bunch of grapes grown on a vine.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 13 },
      weight: 0.4,
    },
  },
  [EntityName.HOPS_SEED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 23, end: 24 },
            { row: 4, start: 23, end: 24 },
          ],
        },
        key: "hops_seed_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Hops seed",
      description: "A small seed that grows into a climbing hop bine.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 22 },
      weight: 0.01,
    },
  },
  [EntityName.HOPS_PLANT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 4, start: 5, end: 6 },
            { row: 5, start: 5, end: 6 },
            { row: 6, start: 5, end: 6 },
          ],
        },
        key: "hops_plant_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 9,
          height: 20,
          offsetX: 11,
          offsetY: 24,
          collides: false,
          static: false,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          stages: [
            {
              stage: GrowthStage.SEED,
              at: 0.0,
              tiles: [
                { row: 4, start: 25, end: 26 },
                { row: 5, start: 25, end: 26 },
                { row: 6, start: 25, end: 26 },
              ],
              offsetY: -16,
            },
            {
              stage: GrowthStage.SPROUT,
              at: 0.5,
              tiles: [
                { row: 4, start: 27, end: 28 },
                { row: 5, start: 27, end: 28 },
                { row: 6, start: 27, end: 28 },
              ],
              offsetY: -16,
            },
            {
              stage: GrowthStage.MATURE,
              at: 1.0,
              tiles: [
                { row: 4, start: 29, end: 30 },
                { row: 5, start: 29, end: 30 },
                { row: 6, start: 29, end: 30 },
              ],
              offsetY: -16,
            },
          ],
          duration: 1 * DAY,
          yield: [{ name: EntityName.HOPS, quantity: 1, stackable: true }],
          regrows: false,
          needsWater: true,
        },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Hops",
      description: "Fragrant cones grown on a climbing hop bine.",
    },
  },
  [EntityName.HOPS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 3, start: 20, end: 21 },
            { row: 4, start: 20, end: 21 },
          ],
        },
        key: "hops_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Hops",
      description: "Fragrant cones grown on a climbing hop bine.",
      stackable: true,
      icon: { spritesheet: "items", row: 4, col: 19 },
      weight: 0.05,
    },
  },
};
