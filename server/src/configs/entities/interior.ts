import {
  ComponentName,
  DamageType,
  Direction,
  EntityDefinition,
  EntityName,
  SoundName,
} from "../../types";

export const interior: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.BARREL1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_market_objects",
          tileSize: 16,
          tiles: [
            { row: 33, start: 21, end: 23 },
            { row: 34, start: 21, end: 23 },
            { row: 35, start: 21, end: 23 },
            { row: 36, start: 21, end: 23 },
          ],
        },
        key: "barrel1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BARREL2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects1",
          tileSize: 16,
          tiles: [
            { row: 6, start: 13, end: 13 },
            { row: 7, start: 13, end: 13 },
          ],
        },
        key: "barrel2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BARREL3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_tavern_interior",
          tileSize: 16,
          tiles: [
            { row: 7, start: 7, end: 8 },
            { row: 8, start: 7, end: 8 },
            { row: 9, start: 7, end: 8 },
          ],
        },
        key: "barrel3_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BARRELS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_market_objects",
          tileSize: 16,
          tiles: [
            { row: 19, start: 27, end: 29 },
            { row: 20, start: 27, end: 29 },
            { row: 21, start: 27, end: 29 },
          ],
        },
        key: "barrels1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BARRELS2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 15, start: 11, end: 12 },
            { row: 16, start: 11, end: 12 },
            { row: 17, start: 11, end: 12 },
          ],
        },
        key: "barrels2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOX1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 38, start: 8, end: 9 },
            { row: 39, start: 8, end: 9 },
          ],
        },
        key: "box1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 35, start: 8, end: 10 },
            { row: 36, start: 8, end: 10 },
            { row: 37, start: 8, end: 10 },
          ],
        },
        key: "boxes1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES_FISH1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 18, start: 1, end: 4 },
            { row: 19, start: 1, end: 4 },
            { row: 20, start: 1, end: 4 },
            { row: 21, start: 1, end: 4 },
            { row: 22, start: 1, end: 4 },
          ],
        },
        key: "boxes_fish1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES_FISH2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 23, start: 1, end: 4 },
            { row: 24, start: 1, end: 4 },
            { row: 25, start: 1, end: 4 },
          ],
        },
        key: "boxes_fish2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.BOXES_FISH3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 23, start: 5, end: 7 },
            { row: 24, start: 5, end: 7 },
            { row: 25, start: 5, end: 7 },
          ],
        },
        key: "boxes_fish3_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.FISH_STAND1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_fishing_dock_house",
          tileSize: 16,
          tiles: [
            { row: 18, start: 5, end: 9 },
            { row: 19, start: 5, end: 9 },
            { row: 20, start: 5, end: 9 },
          ],
        },
        key: "fish_stand1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TORCH1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 100,
          intensity: 0.8,
          color: 0xffd980,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "torch",
          tileSize: 16,
          offset: { x: 0, y: -4 },
          tiles: [
            { row: 1, start: 1, end: 2 },
            { row: 2, start: 1, end: 2 },
            { row: 3, start: 1, end: 2 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 10,
          repeat: -1,
          autoplay: true,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.FIRE, loop: true },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CHEST1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 16,
          offsetX: 4,
          offsetY: 16,
          static: true,
          collides: true,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "chests",
          tileSize: 16,
          tiles: [
            { row: 1, start: 11, end: 12 },
            { row: 2, start: 11, end: 12 },
          ],
          frames: 4,
          direction: "vertical",
          frameRate: 8,
          repeat: 0,
          autoplay: false,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 16 } },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Chest",
      description: "A sturdy wooden chest used to store valuables.",
    },
  },
  [EntityName.SPIKE_TRAP1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 48,
          height: 64,
          offsetX: 0,
          offsetY: 32,
          static: true,
          collides: false,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "spike_trap",
          tileSize: 16,
          tiles: [
            { row: 1, start: 6, end: 8 },
            { row: 2, start: 6, end: 8 },
            { row: 3, start: 6, end: 8 },
            { row: 4, start: 6, end: 8 },
            { row: 5, start: 6, end: 8 },
            { row: 6, start: 6, end: 8 },
          ],
          frames: 5,
          direction: "vertical",
          frameRate: 12,
          repeat: 0,
          autoplay: false,
        },
      },
      {
        name: ComponentName.TRAP,
        config: {
          name: EntityName.SPIKE_TRAP1,
          damage: { type: DamageType.PIERCING, amount: 90 },
          knockback: 0,
          hitbox: { width: 48, height: 64 },
          delay: 150,
          duration: 250,
          cooldown: 1000,
        },
      },
      {
        name: ComponentName.JUMPABLE,
        config: { clearance: 8 },
      },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.GLIMMER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.GLIMMER,
        config: {
          radius: 70,
          intensity: 0.4,
          color: 0xff9940,
        },
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.FIREBOWL1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 100,
          intensity: 0.8,
          color: 0xffd980,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "firebowl",
          tileSize: 16,
          tiles: [
            { row: 1, start: 9, end: 11 },
            { row: 2, start: 9, end: 11 },
            { row: 3, start: 9, end: 11 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 10,
          repeat: -1,
          autoplay: true,
        },
      },
      {
        name: ComponentName.AMBIENT_SOUND,
        config: { name: SoundName.FIRE, loop: true },
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.CUPBOARD1]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 5, start: 8, end: 10 },
            { row: 6, start: 8, end: 10 },
            { row: 7, start: 8, end: 10 },
            { row: 8, start: 8, end: 10 },
          ],
        },
        key: "cupboard1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.CUPBOARD2]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 5, start: 11, end: 12 },
            { row: 6, start: 11, end: 12 },
            { row: 7, start: 11, end: 12 },
            { row: 8, start: 11, end: 12 },
          ],
        },
        key: "cupboard2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.WEAPONRACK1]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 27, start: 8, end: 10 },
            { row: 28, start: 8, end: 10 },
            { row: 29, start: 8, end: 10 },
          ],
        },
        key: "weaponrack1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOXES2]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 21, start: 5, end: 6 },
            { row: 22, start: 5, end: 6 },
            { row: 23, start: 5, end: 6 },
          ],
        },
        key: "boxes2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOXES3]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 21, start: 7, end: 8 },
            { row: 22, start: 7, end: 8 },
            { row: 23, start: 7, end: 8 },
          ],
        },
        key: "boxes3_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOXES4]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_tavern_house",
          tileSize: 16,
          tiles: [
            { row: 22, start: 1, end: 3 },
            { row: 23, start: 1, end: 3 },
            { row: 24, start: 1, end: 3 },
            { row: 25, start: 1, end: 3 },
          ],
        },
        key: "boxes4_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOXES5]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects1",
          tileSize: 16,
          tiles: [
            { row: 4, start: 22, end: 23 },
            { row: 5, start: 22, end: 23 },
          ],
        },
        key: "boxes5_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOXES6]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 18, start: 11, end: 12 },
            { row: 19, start: 11, end: 12 },
            { row: 20, start: 11, end: 12 },
          ],
        },
        key: "boxes6_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOXES7]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects1",
          tileSize: 16,
          tiles: [
            { row: 2, start: 20, end: 21 },
            { row: 3, start: 20, end: 21 },
            { row: 4, start: 20, end: 21 },
          ],
        },
        key: "boxes7_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOXES8]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 18, start: 13, end: 14 },
            { row: 19, start: 13, end: 14 },
            { row: 20, start: 13, end: 14 },
          ],
        },
        key: "boxes8_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BOWL1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 10,
          offsetX: 4,
          offsetY: 18,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects2",
          tileSize: 16,
          tiles: [
            { row: 11, start: 5, end: 5 },
            { row: 12, start: 5, end: 5 },
          ],
        },
        key: "bowl1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.VASES1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects1",
          tileSize: 16,
          tiles: [
            { row: 8, start: 5, end: 5 },
            { row: 9, start: 5, end: 5 },
          ],
        },
        key: "vases1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.VASES2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "dungeon_objects1",
          tileSize: 16,
          tiles: [
            { row: 8, start: 2, end: 3 },
            { row: 9, start: 2, end: 3 },
          ],
        },
        key: "vases2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.BANQUET_TABLE]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_tavern_interior",
          tileSize: 16,
          tiles: [
            { row: 4, start: 1, end: 4 },
            { row: 5, start: 1, end: 4 },
            { row: 6, start: 1, end: 4 },
          ],
        },
        key: "banquet_table_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.TABLE1]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_tavern_house",
          tileSize: 16,
          tiles: [
            { row: 26, start: 1, end: 3 },
            { row: 27, start: 1, end: 3 },
            { row: 28, start: 1, end: 3 },
            { row: 29, start: 1, end: 3 },
          ],
        },
        key: "table1_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.TABLE2]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_tavern_house",
          tileSize: 16,
          tiles: [
            { row: 26, start: 4, end: 6 },
            { row: 27, start: 4, end: 6 },
          ],
        },
        key: "table2_texture",
      },
    ],
    states: [],
    behaviors: [],
  },

  [EntityName.TABLE3]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 28,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_tavern_interior",
          tileSize: 16,
          tiles: [
            { row: 10, start: 4, end: 6 },
            { row: 11, start: 4, end: 6 },
            { row: 12, start: 4, end: 6 },
          ],
        },
        key: "table3_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
};
