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
      description: "A small mushroom with a pale red cap dotted with white spots.",
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
      description: "A lush green fern with broad, arching fronds common to shaded groves.",
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
      description: "A poisonous plant with dark berries and bold purple blossoms.",
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
      description: "A tall, golden flower with a broad face that follows the sun.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 1, col: 4 },
    },
  },
  [EntityName.RASPBERRY]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering1",
          tileSize: 16,
          tiles: [
            { row: 10, start: 1, end: 3 },
            { row: 11, start: 1, end: 3 },
            { row: 12, start: 1, end: 3 },
          ],
        },
        key: "raspberry_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 32,
          offsetX: 8,
          offsetY: 16,
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
      displayName: "Raspberry",
      description: "A thorny bush bearing clusters of small, bright red berries.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 10, col: 13 },
    },
  },
  [EntityName.DAFFODIL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering6",
          tileSize: 16,
          tiles: [
            { row: 7, start: 1, end: 1 },
            { row: 8, start: 1, end: 1 },
          ],
        },
        key: "daffodil_texture",
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
      displayName: "Daffodil",
      description: "A bright yellow flower with a cheerful trumpet-shaped centre.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 16, col: 7 },
    },
  },
  [EntityName.BLUE_LOTUS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering6",
          tileSize: 16,
          tiles: [
            { row: 1, start: 3, end: 4 },
            { row: 2, start: 3, end: 4 },
          ],
        },
        key: "blue_lotus_texture",
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
      displayName: "Blue lotus",
      description: "A rare aquatic flower with bold blue petals and a sweet scent.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 4, col: 31 },
    },
  },
  [EntityName.CLARY_SAGE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering6",
          tileSize: 16,
          tiles: [
            { row: 5, start: 3, end: 4 },
            { row: 6, start: 3, end: 4 },
          ],
        },
        key: "clary_sage_texture",
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
      displayName: "Clary sage",
      description: "An aromatic herb with soft leaves and delicate purple blooms.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 14, col: 31 },
    },
  },
  [EntityName.BEARDED_TOOTH_FUNGUS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "gathering1",
          tileSize: 16,
          tiles: [
            { row: 17, start: 7, end: 8 },
            { row: 18, start: 7, end: 8 },
          ],
        },
        key: "bearded_tooth_fungus_texture",
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
      displayName: "Bearded tooth fungus",
      description: "A peculiar white fungus adorned with cascading tooth-like spines.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 18, col: 13 },
    },
  },
  [EntityName.DROP_OF_THE_BELLAN_TRAIL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Drop of the Bellan Trail",
      description: "A mysterious potion crafted from rare aquatic flowers and forest herbs.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 4, col: 28 },
    },
  },
  [EntityName.SUNGOLD_POTION]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Sungold potion",
      description: "A warm golden potion distilled from sunflowers and belladonna.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 14, col: 28 },
    },
  },
};
