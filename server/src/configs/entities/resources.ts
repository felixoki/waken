import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const resources: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.QUARTZ1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "crystals",
          tileSize: 16,
          tiles: [{ row: 8, start: 18, end: 18 }],
        },
        key: "quartz1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Quartz",
      description: "A small translucent crystal with a faint pale glow.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 14, col: 19 },
    },
  },
  [EntityName.WOOD]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 1, start: 29, end: 30 },
            { row: 2, start: 29, end: 30 },
          ],
        },
        key: "wood_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wood",
      description: "A rough-cut log split from a felled tree.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 2, col: 28 },
    },
  },
  [EntityName.BONE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 1, start: 14, end: 15 },
            { row: 2, start: 14, end: 15 },
          ],
        },
        key: "bone_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bone",
      description: "A cracked bone stripped clean by tooth and claw.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 2, col: 13 },
    },
  },
  [EntityName.IRON1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 9, start: 20, end: 21 },
            { row: 10, start: 20, end: 21 },
          ],
        },
        key: "iron1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Iron",
      description: "A rough chunk of iron ore pulled from the earth.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 10, col: 19 },
    },
  },
  [EntityName.GLASS]: {
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
      displayName: "Glass",
      description: "A shard of refined glass, smooth and transparent.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 4, col: 4 },
    },
  },
  [EntityName.VIAL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 5, start: 27, end: 28 },
            { row: 6, start: 27, end: 28 },
          ],
        },
        key: "vial_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Vial",
      description: "A slender glass vial used for storing liquids.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 6, col: 28 },
    },
  },
  [EntityName.DEER_HIDE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 9, start: 11, end: 12 },
            { row: 10, start: 11, end: 12 },
          ],
        },
        key: "deer_hide_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Deer hide",
      description: "A supple hide stripped from a forest deer.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 10, col: 10 },
    },
  },
};
