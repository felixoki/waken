import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  SoundName,
} from "../../types";

export const rocks: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.QUARTZ_ORE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 9, start: 7, end: 9 },
            { row: 10, start: 7, end: 9 },
            { row: 11, start: 7, end: 9 },
          ],
        },
        key: "quartz_ore_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 16,
          offsetX: 8,
          offsetY: 28,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.MINEABLE,
        config: { drop: { name: EntityName.QUARTZ1, quantity: 2 } },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Quartz Ore",
      description: "A jagged outcrop studded with raw quartz.",
    },
  },
  [EntityName.AZURITE_ORE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 9, start: 1, end: 3 },
            { row: 10, start: 1, end: 3 },
            { row: 11, start: 1, end: 3 },
          ],
        },
        key: "azurite_ore_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 16,
          offsetX: 8,
          offsetY: 28,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.MINEABLE,
        config: { drop: { name: EntityName.AZURITE1, quantity: 2 } },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Azurite Ore",
      description: "A blocky outcrop of deep blue azurite.",
    },
  },
  [EntityName.IRON_VEIN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 9, start: 4, end: 6 },
            { row: 10, start: 4, end: 6 },
            { row: 11, start: 4, end: 6 },
          ],
        },
        key: "iron_vein_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 16,
          offsetX: 8,
          offsetY: 28,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.MINEABLE,
        config: { drop: { name: EntityName.IRON_ORE, quantity: 2 } },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Iron Ore",
      description: "A dark, heavy outcrop veined with iron.",
    },
  },
  [EntityName.CAVE_ROCK1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 1, end: 2 },
            { row: 18, start: 1, end: 2 },
            { row: 19, start: 1, end: 2 },
            { row: 20, start: 1, end: 2 },
          ],
        },
        key: "cave_rock1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 22,
          height: 16,
          offsetX: 6,
          offsetY: 39,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CAVE_ROCK2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 3, end: 4 },
            { row: 18, start: 3, end: 4 },
            { row: 19, start: 3, end: 4 },
          ],
        },
        key: "cave_rock2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 13,
          offsetX: 6,
          offsetY: 31,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CAVE_ROCK3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 5, end: 6 },
            { row: 18, start: 5, end: 6 },
            { row: 19, start: 5, end: 6 },
          ],
        },
        key: "cave_rock3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 13,
          offsetX: 6,
          offsetY: 31,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CAVE_ROCK4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 7, end: 8 },
            { row: 18, start: 7, end: 8 },
            { row: 19, start: 7, end: 8 },
          ],
        },
        key: "cave_rock4_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 13,
          offsetX: 6,
          offsetY: 31,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CAVE_ROCK5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 9, end: 10 },
            { row: 18, start: 9, end: 10 },
          ],
        },
        key: "cave_rock5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 10,
          offsetX: 6,
          offsetY: 18,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CAVE_ROCK6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 11, end: 12 },
            { row: 18, start: 11, end: 12 },
          ],
        },
        key: "cave_rock6_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 10,
          offsetX: 6,
          offsetY: 18,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 13, end: 16 },
            { row: 18, start: 13, end: 16 },
            { row: 19, start: 13, end: 16 },
            { row: 20, start: 13, end: 16 },
          ],
        },
        key: "rock1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 40,
          height: 24,
          offsetX: 8,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 17, end: 19 },
            { row: 18, start: 17, end: 19 },
            { row: 19, start: 17, end: 19 },
          ],
        },
        key: "rock2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 16,
          offsetX: 8,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 20, end: 22 },
            { row: 18, start: 20, end: 22 },
            { row: 19, start: 20, end: 22 },
          ],
        },
        key: "rock3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 12,
          offsetX: 12,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 23, end: 26 },
            { row: 18, start: 23, end: 26 },
            { row: 19, start: 23, end: 26 },
            { row: 20, start: 23, end: 26 },
          ],
        },
        key: "rock4_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 52,
          height: 24,
          offsetX: 8,
          offsetY: 24,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCK8]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 27, end: 28 },
            { row: 18, start: 27, end: 28 },
          ],
        },
        key: "rock8_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 8, offsetX: 8, offsetY: 16, static: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 17, start: 29, end: 31 },
            { row: 18, start: 29, end: 31 },
            { row: 19, start: 29, end: 31 },
          ],
        },
        key: "rocks1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 16,
          offsetX: 16,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 19, start: 9, end: 10 },
            { row: 20, start: 9, end: 10 },
          ],
        },
        key: "rocks3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 19, start: 11, end: 12 },
            { row: 20, start: 11, end: 12 },
          ],
        },
        key: "rocks5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ROCKS6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 19, start: 27, end: 28 },
            { row: 20, start: 27, end: 28 },
          ],
        },
        key: "rocks6_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 12,
          offsetY: 12,
          static: true,
        },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.RUIN1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 36, start: 1, end: 5 },
            { row: 37, start: 1, end: 5 },
            { row: 38, start: 1, end: 5 },
            { row: 39, start: 1, end: 5 },
            { row: 40, start: 1, end: 5 },
            { row: 41, start: 1, end: 5 },
            { row: 42, start: 1, end: 5 },
          ],
        },
        key: "ruin1_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 66,
          height: 23,
          offsetX: 8,
          offsetY: 63,
          static: true,
        },
      },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.MINE },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.RUIN2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 36, start: 6, end: 10 },
            { row: 37, start: 6, end: 10 },
            { row: 38, start: 6, end: 10 },
            { row: 39, start: 6, end: 10 },
          ],
        },
        key: "ruin2_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 68,
          height: 12,
          offsetX: 6,
          offsetY: 39,
          static: true,
        },
      },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.MINE },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.RUIN3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 36, start: 11, end: 14 },
            { row: 37, start: 11, end: 14 },
            { row: 38, start: 11, end: 14 },
            { row: 39, start: 11, end: 14 },
          ],
        },
        key: "ruin3_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 47,
          height: 12,
          offsetX: 9,
          offsetY: 34,
          static: true,
        },
      },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.MINE },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.RUIN4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 36, start: 15, end: 18 },
            { row: 37, start: 15, end: 18 },
            { row: 38, start: 15, end: 18 },
          ],
        },
        key: "ruin4_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 37,
          height: 11,
          offsetX: 3,
          offsetY: 24,
          static: true,
        },
      },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.MINE },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.RUIN5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 36, start: 19, end: 20 },
            { row: 37, start: 19, end: 20 },
          ],
        },
        key: "ruin5_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 7,
          offsetX: 6,
          offsetY: 8,
          static: true,
        },
      },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.MINE },
      },
    ],
    states: [],
    behaviors: [],
  },
};
