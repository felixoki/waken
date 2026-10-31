import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const flora: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.GLOWSHROOM1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 40,
          intensity: 0.7,
          color: 0x7fe8c4,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 7, start: 5, end: 6 },
            { row: 8, start: 5, end: 6 },
          ],
        },
        key: "glowshroom1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 6,
          offsetX: 11,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      { name: ComponentName.BOUNCE },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Glowshroom",
      description: "A cluster of small mushrooms that glows faintly green.",
      stackable: true,
      icon: { spritesheet: "nature", row: 8, col: 4 },
      weight: 0.05,
    },
  },
  [EntityName.GLOWSHROOM2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 56,
          intensity: 0.8,
          color: 0x7fe8c4,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 7, start: 7, end: 8 },
            { row: 8, start: 7, end: 8 },
          ],
        },
        key: "glowshroom2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 17,
          height: 8,
          offsetX: 6,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      { name: ComponentName.BOUNCE },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
        config: { item: EntityName.GLOWSHROOM1, quantity: 2 },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Glowshroom",
      description: "A cluster of small mushrooms that glows faintly green.",
    },
  },
  [EntityName.GLOWSHROOM3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 72,
          intensity: 0.9,
          color: 0x7fe8c4,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 7, start: 9, end: 10 },
            { row: 8, start: 9, end: 10 },
          ],
        },
        key: "glowshroom3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 16,
          offsetX: 4,
          offsetY: 14,
          collides: false,
          static: true,
        },
      },
      { name: ComponentName.BOUNCE },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
        config: { item: EntityName.GLOWSHROOM1, quantity: 3 },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Glowshroom",
      description: "A cluster of small mushrooms that glows faintly green.",
    },
  },
  [EntityName.TREE1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 23, start: 5, end: 8 },
            { row: 24, start: 5, end: 8 },
            { row: 25, start: 5, end: 8 },
            { row: 26, start: 5, end: 8 },
            { row: 27, start: 5, end: 8 },
          ],
        },
        key: "tree1_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 25,
          offsetX: 24,
          offsetY: 47,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 23, start: 9, end: 12 },
            { row: 24, start: 9, end: 12 },
            { row: 25, start: 9, end: 12 },
            { row: 26, start: 9, end: 12 },
          ],
        },
        key: "tree2_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 32,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 23, start: 13, end: 18 },
            { row: 24, start: 13, end: 18 },
            { row: 25, start: 13, end: 18 },
            { row: 26, start: 13, end: 18 },
            { row: 27, start: 13, end: 18 },
          ],
        },
        key: "tree4_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 25,
          offsetX: 36,
          offsetY: 47,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 23, start: 19, end: 22 },
            { row: 24, start: 19, end: 22 },
            { row: 25, start: 19, end: 22 },
            { row: 26, start: 19, end: 22 },
            { row: 27, start: 19, end: 22 },
          ],
        },
        key: "tree5_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 25,
          offsetX: 24,
          offsetY: 47,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 23, start: 23, end: 27 },
            { row: 24, start: 23, end: 27 },
            { row: 25, start: 23, end: 27 },
            { row: 26, start: 23, end: 27 },
            { row: 27, start: 23, end: 27 },
          ],
        },
        key: "tree6_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 25,
          offsetX: 28,
          offsetY: 47,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE7]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 23, start: 28, end: 32 },
            { row: 24, start: 28, end: 32 },
            { row: 25, start: 28, end: 32 },
            { row: 26, start: 28, end: 32 },
            { row: 27, start: 28, end: 32 },
            { row: 28, start: 28, end: 32 },
          ],
        },
        key: "tree7_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 33,
          offsetX: 32,
          offsetY: 55,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE8]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 28, start: 1, end: 5 },
            { row: 29, start: 1, end: 5 },
            { row: 30, start: 1, end: 5 },
            { row: 31, start: 1, end: 5 },
            { row: 32, start: 1, end: 5 },
          ],
        },
        key: "tree8_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 25,
          offsetX: 32,
          offsetY: 47,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.APPLETREE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 23, start: 1, end: 4 },
            { row: 24, start: 1, end: 4 },
            { row: 25, start: 1, end: 4 },
            { row: 26, start: 1, end: 4 },
          ],
        },
        key: "appletree2_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 24,
          offsetY: 32,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.STUMP1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 21, start: 1, end: 3 },
            { row: 22, start: 1, end: 3 },
          ],
        },
        key: "stump1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 28, height: 8, offsetX: 12, offsetY: 8, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.STUMP2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 21, start: 4, end: 5 },
            { row: 22, start: 4, end: 5 },
          ],
        },
        key: "stump2_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 12, height: 8, offsetX: 12, offsetY: 8, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 3 },
            { row: 2, start: 1, end: 3 },
            { row: 3, start: 1, end: 3 },
          ],
        },
        key: "bush1_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 12,
          offsetX: 12,
          offsetY: 24,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 4, end: 5 },
            { row: 2, start: 4, end: 5 },
          ],
        },
        key: "bush2_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 12,
          offsetX: 8,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 6, end: 8 },
            { row: 2, start: 6, end: 8 },
            { row: 3, start: 6, end: 8 },
          ],
        },
        key: "bush3_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 27,
          height: 14,
          offsetX: 10,
          offsetY: 24,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 9, end: 10 },
            { row: 2, start: 9, end: 10 },
          ],
        },
        key: "bush4_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 15,
          height: 8,
          offsetX: 8,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 15, start: 1, end: 1 },
          ],
        },
        key: "reed1_texture",
      },
      { name: ComponentName.WINDSWAY },
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
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 15, start: 2, end: 2 },
          ],
        },
        key: "reed2_texture",
      },
      { name: ComponentName.WINDSWAY },
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
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.REED3]: {
    facing: Direction.DOWN,
    moving: [],
    offset: { y: -8 },
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 15, start: 3, end: 3 },
            { row: 16, start: 3, end: 3 },
          ],
        },
        key: "reed3_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 24,
          offsetX: 0,
          offsetY: 8,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE9]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 43, start: 1, end: 6 },
            { row: 44, start: 1, end: 6 },
            { row: 45, start: 1, end: 6 },
            { row: 46, start: 1, end: 6 },
            { row: 47, start: 1, end: 6 },
            { row: 48, start: 1, end: 6 },
            { row: 49, start: 1, end: 6 },
          ],
        },
        key: "tree9_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 33,
          offsetX: 40,
          offsetY: 63,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE10]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 43, start: 7, end: 11 },
            { row: 44, start: 7, end: 11 },
            { row: 45, start: 7, end: 11 },
            { row: 46, start: 7, end: 11 },
            { row: 47, start: 7, end: 11 },
            { row: 48, start: 7, end: 11 },
          ],
        },
        key: "tree10_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 18,
          height: 25,
          offsetX: 24,
          offsetY: 55,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TREE11]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 27, start: 9, end: 12 },
            { row: 28, start: 9, end: 12 },
            { row: 29, start: 9, end: 12 },
            { row: 30, start: 9, end: 12 },
          ],
        },
        key: "tree11_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 9,
          offsetX: 29,
          offsetY: 39,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.FELLABLE,
        config: {
          drop: { name: EntityName.WOOD, quantity: 1 },
          bonus: { name: EntityName.HAZELNUT, quantity: 1, chance: 0.25 },
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 18, end: 20 },
            { row: 2, start: 18, end: 20 },
            { row: 3, start: 18, end: 20 },
          ],
        },
        key: "bush5_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 34,
          height: 10,
          offsetX: 7,
          offsetY: 20,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 21, end: 23 },
            { row: 2, start: 21, end: 23 },
            { row: 3, start: 21, end: 23 },
          ],
        },
        key: "bush6_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 30,
          height: 9,
          offsetX: 9,
          offsetY: 22,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BUSH7]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 24, end: 25 },
            { row: 2, start: 24, end: 25 },
            { row: 3, start: 24, end: 25 },
          ],
        },
        key: "bush7_texture",
      },
      { name: ComponentName.WINDSWAY },
      {
        name: ComponentName.BODY,
        config: {
          width: 18,
          height: 5,
          offsetX: 6,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
      },
    ],
    states: [],
    behaviors: [],
  },
};
