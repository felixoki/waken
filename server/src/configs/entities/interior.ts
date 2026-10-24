import {
  ComponentName,
  DamageType,
  Direction,
  EntityDefinition,
  EntityName,
  SoundName,
  StoryFlag,
} from "../../types";

const BARREL_LOOT = [
  { name: EntityName.ERGOT, quantity: 1, stackable: true, chance: 0.25 },
  { name: EntityName.WHEAT, quantity: 1, stackable: true, chance: 0.5 },
];

const BAG_LOOT = [
  { name: EntityName.BREAD, quantity: 1, stackable: true, chance: 0.5 },
  { name: EntityName.CABBAGE, quantity: 1, stackable: true, chance: 0.4 },
  { name: EntityName.CANDLE, quantity: 2, stackable: true, chance: 0.3 },
  { name: EntityName.SPELL_PAGE_SHIELD, quantity: 1, stackable: false, chance: 0.04 },
  { name: EntityName.SPELL_PAGE_HEAL_PARTY, quantity: 1, stackable: false, chance: 0.04 },
];

const POTIONS_LOOT = [
  { name: EntityName.POTION1, quantity: 1, stackable: true, chance: 0.35 },
  { name: EntityName.POTION2, quantity: 1, stackable: true, chance: 0.35 },
  { name: EntityName.POTION3, quantity: 1, stackable: true, chance: 0.25 },
  { name: EntityName.POTION4, quantity: 1, stackable: true, chance: 0.15 },
  { name: EntityName.POTION5, quantity: 1, stackable: true, chance: 0.15 },
  { name: EntityName.POTION6, quantity: 1, stackable: true, chance: 0.15 },
];

const SPELLPAGES_LOOT = [
  { name: EntityName.SPELL_PAGE_SHIELD, quantity: 1, stackable: false, chance: 0.2 },
  { name: EntityName.SPELL_PAGE_HEAL_PARTY, quantity: 1, stackable: false, chance: 0.2 },
  { name: EntityName.SPELL_PAGE_BLINK, quantity: 1, stackable: false, chance: 0.08 },
  { name: EntityName.SPELL_PAGE_DARK_WAVE, quantity: 1, stackable: false, chance: 0.05 },
];

const REMAINS_LOOT = [
  { name: EntityName.BONE, quantity: 2, stackable: true, chance: 1 },
  { name: EntityName.BONE, quantity: 2, stackable: true, chance: 0.35 },
];

const ALTAR_LOOT = [
  { name: EntityName.BONE, quantity: 3, stackable: true, chance: 0.8 },
  { name: EntityName.POTION4, quantity: 1, stackable: true, chance: 0.3 },
  { name: EntityName.POTION5, quantity: 1, stackable: true, chance: 0.3 },
  { name: EntityName.POTION6, quantity: 1, stackable: true, chance: 0.3 },
  { name: EntityName.SPELL_PAGE_DARK_WAVE, quantity: 1, stackable: false, chance: 0.15 },
  { name: EntityName.SPELL_PAGE_SUNDER, quantity: 1, stackable: false, chance: 0.1 },
  { name: EntityName.SPELL_PAGE_WELLSPRING, quantity: 1, stackable: false, chance: 0.1 },
  { name: EntityName.SPELL_PAGE_DELTA_WAVE, quantity: 1, stackable: false, chance: 0.1 },
  { name: EntityName.SPELL_PAGE_HYPNIC_JERK, quantity: 1, stackable: false, chance: 0.05 },
];

export const interior: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.BARREL1]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 28,
          height: 8,
          offsetX: 5,
          offsetY: 31,
          pushable: false,
        },
      },
      { name: ComponentName.DAMAGEABLE, config: { loot: BARREL_LOOT } },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 6, start: 1, end: 3 },
            { row: 7, start: 1, end: 3 },
            { row: 8, start: 1, end: 3 },
            { row: 9, start: 1, end: 3 },
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
    maxHealth: 10,
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 4,
          offsetX: 2,
          offsetY: 9,
          pushable: false,
        },
      },
      { name: ComponentName.DAMAGEABLE, config: { loot: BARREL_LOOT } },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 6, start: 4, end: 4 },
            { row: 7, start: 4, end: 4 },
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
    maxHealth: 10,
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 21,
          height: 6,
          offsetX: 7,
          offsetY: 22,
          pushable: false,
        },
      },
      { name: ComponentName.DAMAGEABLE, config: { loot: BARREL_LOOT } },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 6, start: 5, end: 6 },
            { row: 7, start: 5, end: 6 },
            { row: 8, start: 5, end: 6 },
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
    maxHealth: 10,
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 10,
          offsetX: 8,
          offsetY: 20,
          pushable: false,
        },
      },
      { name: ComponentName.DAMAGEABLE, config: { loot: BARREL_LOOT } },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 6, start: 8, end: 10 },
            { row: 7, start: 8, end: 10 },
            { row: 8, start: 8, end: 10 },
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
    maxHealth: 10,
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 21,
          height: 6,
          offsetX: 9,
          offsetY: 28,
          pushable: false,
        },
      },
      { name: ComponentName.DAMAGEABLE, config: { loot: BARREL_LOOT } },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 6, start: 11, end: 12 },
            { row: 7, start: 11, end: 12 },
            { row: 8, start: 11, end: 12 },
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
          width: 9,
          height: 4,
          offsetX: 10,
          offsetY: 9,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 1, end: 2 },
            { row: 18, start: 1, end: 2 },
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
          width: 18,
          height: 5,
          offsetX: 12,
          offsetY: 19,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 3, end: 5 },
            { row: 18, start: 3, end: 5 },
            { row: 19, start: 3, end: 5 },
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
          width: 39,
          height: 12,
          offsetX: 13,
          offsetY: 42,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 23, end: 26 },
            { row: 18, start: 23, end: 26 },
            { row: 19, start: 23, end: 26 },
            { row: 20, start: 23, end: 26 },
            { row: 21, start: 23, end: 26 },
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
          width: 36,
          height: 11,
          offsetX: 8,
          offsetY: 22,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 27, end: 30 },
            { row: 18, start: 27, end: 30 },
            { row: 19, start: 27, end: 30 },
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
          width: 31,
          height: 9,
          offsetX: 8,
          offsetY: 20,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 20, start: 1, end: 3 },
            { row: 21, start: 1, end: 3 },
            { row: 22, start: 1, end: 3 },
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
          width: 54,
          height: 12,
          offsetX: 12,
          offsetY: 19,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 36, start: 1, end: 5 },
            { row: 37, start: 1, end: 5 },
            { row: 38, start: 1, end: 5 },
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
          radius: 130,
          intensity: 1.1,
          color: 0xffac58,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          offset: { x: 0, y: -4 },
          tiles: [
            { row: 59, start: 25, end: 26 },
            { row: 60, start: 25, end: 26 },
            { row: 61, start: 25, end: 26 },
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
  [EntityName.CANDLES1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 28,
          intensity: 0.5,
          color: 0xffac58,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 3, end: 4 },
            { row: 60, start: 3, end: 4 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 6,
          repeat: -1,
          autoplay: true,
        },
      },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
        config: { item: EntityName.CANDLE, quantity: 1 },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Candles",
    },
  },
  [EntityName.CANDLES2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 34,
          intensity: 0.55,
          color: 0xffac58,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 5, end: 6 },
            { row: 60, start: 5, end: 6 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 6,
          repeat: -1,
          autoplay: true,
        },
      },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
        config: { item: EntityName.CANDLE, quantity: 2 },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Candles",
    },
  },
  [EntityName.CANDLES3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 40,
          intensity: 0.6,
          color: 0xffac58,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 7, end: 8 },
            { row: 60, start: 7, end: 8 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 6,
          repeat: -1,
          autoplay: true,
        },
      },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
        config: { item: EntityName.CANDLE, quantity: 3 },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Candles",
    },
  },
  [EntityName.LEVER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 16, end: 16 },
          ],
          frames: 5,
          direction: "vertical",
          frameRate: 14,
          repeat: 0,
          autoplay: false,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.SWITCH, config: { trigger: true } },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Lever",
    },
  },
  [EntityName.CLOSED_DOOR]: {
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
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 11, end: 12 },
            { row: 60, start: 11, end: 12 },
            { row: 61, start: 11, end: 12 },
          ],
          frames: 5,
          direction: "vertical",
          frameRate: 10,
          repeat: 0,
          autoplay: false,
        },
      },
      { name: ComponentName.SWITCH, config: { trigger: false } },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.TEMPLE_DOOR]: {
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
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 23, end: 24 },
            { row: 60, start: 23, end: 24 },
            { row: 61, start: 23, end: 24 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 10,
          repeat: 0,
          autoplay: false,
        },
      },
      { name: ComponentName.SWITCH, config: { trigger: false } },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.ALTAR]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 44,
          height: 14,
          offsetX: 2,
          offsetY: 14,
          static: true,
          collides: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 16, loot: ALTAR_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 2, start: 1, end: 3 },
            { row: 3, start: 1, end: 3 },
          ],
        },
        key: "altar_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Altar",
    },
  },
  [EntityName.BAG1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 18,
          height: 6,
          offsetX: 8,
          offsetY: 16,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: BAG_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 4, start: 1, end: 2 },
            { row: 5, start: 1, end: 2 },
          ],
        },
        key: "bag1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bag",
    },
  },
  [EntityName.POTIONS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 6,
          offsetX: 8,
          offsetY: 16,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: POTIONS_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 39, start: 1, end: 2 },
            { row: 40, start: 1, end: 2 },
          ],
        },
        key: "potions1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Potions",
    },
  },
  [EntityName.SLEEPING_BAG1]: {
    facing: Direction.DOWN,
    moving: [],
    flat: true,
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 10, start: 6, end: 8 },
            { row: 11, start: 6, end: 8 },
          ],
        },
        key: "sleeping_bag1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Sleeping bag",
    },
  },
  [EntityName.SLEEPING_BAG2]: {
    facing: Direction.DOWN,
    moving: [],
    flat: true,
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 10, start: 9, end: 10 },
            { row: 11, start: 9, end: 10 },
          ],
        },
        key: "sleeping_bag2_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Sleeping bag",
    },
  },
  [EntityName.BOOKS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 13, start: 1, end: 2 },
            { row: 14, start: 1, end: 2 },
          ],
        },
        key: "books1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Books",
    },
  },
  [EntityName.SACK1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 5,
          offsetX: 15,
          offsetY: 13,
          static: true,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 44, start: 1, end: 2 },
            { row: 45, start: 1, end: 2 },
          ],
        },
        key: "sack1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Sack",
    },
  },
  [EntityName.SKULLS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 18,
          height: 6,
          offsetX: 6,
          offsetY: 15,
          static: true,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 46, start: 1, end: 2 },
            { row: 47, start: 1, end: 2 },
          ],
        },
        key: "skulls1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Skulls",
    },
  },
  [EntityName.COFFIN1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 18,
          height: 20,
          offsetX: 14,
          offsetY: 24,
          static: true,
          collides: true,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 29, start: 1, end: 2 },
            { row: 30, start: 1, end: 2 },
            { row: 31, start: 1, end: 2 },
          ],
        },
        key: "coffin1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Coffin",
    },
  },
  [EntityName.BOXES9]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 15,
          height: 4,
          offsetX: 10,
          offsetY: 9,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 21, end: 22 },
            { row: 18, start: 21, end: 22 },
          ],
        },
        key: "boxes9_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Boxes",
    },
  },
  [EntityName.VASES3]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.VASES_BREAK },
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 4,
          offsetX: 2,
          offsetY: 9,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 54, start: 4, end: 4 },
            { row: 55, start: 4, end: 4 },
          ],
        },
        key: "vases3_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Vase",
    },
  },
  [EntityName.CANDELABRA]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 6,
          height: 6,
          offsetX: 13,
          offsetY: 16,
          static: true,
        },
      },
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 40,
          intensity: 0.6,
          color: 0xffac58,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 1, end: 2 },
            { row: 60, start: 1, end: 2 },
          ],
          frames: 3,
          direction: "vertical",
          frameRate: 6,
          repeat: -1,
          autoplay: true,
        },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Candelabra",
    },
  },
  [EntityName.ALCHEMIST_TABLE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 22,
          height: 40,
          offsetX: 5,
          offsetY: 16,
          static: true,
          collides: true,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 50, start: 1, end: 2 },
            { row: 51, start: 1, end: 2 },
            { row: 52, start: 1, end: 2 },
            { row: 53, start: 1, end: 2 },
          ],
        },
        key: "alchemist_table_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Alchemist table",
    },
  },
  [EntityName.BAG2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 6,
          offsetX: 9,
          offsetY: 6,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: BAG_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 4, start: 3, end: 4 },
          ],
        },
        key: "bag2_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bag",
    },
  },
  [EntityName.BAG3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 5,
          offsetX: 3,
          offsetY: 7,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: BAG_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 4, start: 5, end: 5 },
          ],
        },
        key: "bag3_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Satchel",
    },
  },
  [EntityName.BARREL4]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 4,
          offsetX: 2,
          offsetY: 9,
          pushable: false,
        },
      },
      { name: ComponentName.DAMAGEABLE, config: { loot: BARREL_LOOT } },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 6, start: 7, end: 7 },
            { row: 7, start: 7, end: 7 },
          ],
        },
        key: "barrel4_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Barrel",
    },
  },
  [EntityName.BARRELS3]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 10,
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 22,
          height: 7,
          offsetX: 6,
          offsetY: 10,
          pushable: false,
        },
      },
      { name: ComponentName.DAMAGEABLE, config: { loot: BARREL_LOOT } },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 6, start: 13, end: 14 },
            { row: 7, start: 13, end: 14 },
          ],
        },
        key: "barrels3_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Barrels",
    },
  },
  [EntityName.CARPET1]: {
    facing: Direction.DOWN,
    moving: [],
    flat: true,
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 23, start: 1, end: 5 },
            { row: 24, start: 1, end: 5 },
            { row: 25, start: 1, end: 5 },
            { row: 26, start: 1, end: 5 },
          ],
        },
        key: "carpet1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carpet",
    },
  },
  [EntityName.CARPET2]: {
    facing: Direction.DOWN,
    moving: [],
    flat: true,
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 23, start: 6, end: 9 },
            { row: 24, start: 6, end: 9 },
            { row: 25, start: 6, end: 9 },
            { row: 26, start: 6, end: 9 },
          ],
        },
        key: "carpet2_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carpet",
    },
  },
  [EntityName.CHAIR1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 5,
          offsetX: 7,
          offsetY: 14,
          static: true,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 27, start: 1, end: 1 },
            { row: 28, start: 1, end: 1 },
          ],
        },
        key: "chair1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Stool",
    },
  },
  [EntityName.MORTAR_AND_PESTLE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 1, start: 1, end: 1 },
          ],
        },
        key: "mortar_and_pestle_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Mortar and pestle",
    },
  },
  [EntityName.PILLOWS1]: {
    facing: Direction.DOWN,
    moving: [],
    flat: true,
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 10, start: 3, end: 5 },
            { row: 11, start: 3, end: 5 },
          ],
        },
        key: "pillows1_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Pillows",
    },
  },
  [EntityName.REMAINS2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: REMAINS_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 41, start: 4, end: 5 },
            { row: 42, start: 4, end: 5 },
            { row: 43, start: 4, end: 5 },
          ],
        },
        key: "remains2_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Remains",
    },
  },
  [EntityName.REMAINS3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: REMAINS_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 41, start: 6, end: 7 },
            { row: 42, start: 6, end: 7 },
            { row: 43, start: 6, end: 7 },
          ],
        },
        key: "remains3_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Remains",
    },
  },
  [EntityName.SPELLPAGES]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 6,
          offsetX: 8,
          offsetY: 15,
          static: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: SPELLPAGES_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 48, start: 1, end: 2 },
            { row: 49, start: 1, end: 2 },
          ],
        },
        key: "spellpages_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Spell pages",
    },
  },
  [EntityName.REMAINS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8, loot: REMAINS_LOOT } },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 41, start: 1, end: 3 },
            { row: 42, start: 1, end: 3 },
          ],
        },
        key: "remains_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Remains",
    },
  },
  [EntityName.BED]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 10, start: 1, end: 2 },
            { row: 11, start: 1, end: 2 },
            { row: 12, start: 1, end: 2 },
          ],
        },
        key: "bed_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 21,
          height: 30,
          offsetX: 6,
          offsetY: 2,
          static: true,
          collides: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.SLEEPABLE,
        config: {
          anchor: { x: -1, y: -7 },
          exits: {
            [Direction.LEFT]: { x: -20.5, y: -4.5 },
            [Direction.RIGHT]: { x: 20.5, y: -4.5 },
          },
          facing: Direction.DOWN,
          depth: 8,
        },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bed",
      description: "A simple bed. Sleep here to slip into the dream.",
    },
  },
  [EntityName.CHEST1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 21,
          height: 6,
          offsetX: 6,
          offsetY: 16,
          static: true,
          collides: true,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 9, end: 10 },
            { row: 60, start: 9, end: 10 },
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
  [EntityName.MILL_HOPPER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 24,
          height: 8,
          offsetX: 4,
          offsetY: 20,
          static: true,
          collides: false,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 27, end: 28 },
            { row: 60, start: 27, end: 28 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 8,
          repeat: 0,
          autoplay: false,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8 } },
      {
        name: ComponentName.CONVERTER,
        config: {
          inputs: [{ item: EntityName.WHEAT, quantity: 2 }],
          output: { item: EntityName.FLOUR, quantity: 1 },
          days: 1,
          drives: EntityName.WINDMILL_SAILS,
        },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Hopper",
      description: "Pour wheat in, and the millstones grind it to flour by the next day.",
    },
  },
  [EntityName.FORGE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.BODY,
        config: {
          width: 44,
          height: 30,
          offsetX: 2,
          offsetY: 30,
          static: true,
          collides: true,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 29, end: 31 },
            { row: 60, start: 29, end: 31 },
            { row: 61, start: 29, end: 31 },
            { row: 62, start: 29, end: 31 },
          ],
          frames: 6,
          direction: "vertical",
          frameRate: 10,
          repeat: -1,
          autoplay: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.STORAGE, config: { slots: 8 } },
      {
        name: ComponentName.CONVERTER,
        config: {
          inputs: [
            { item: EntityName.IRON_ORE, quantity: 2 },
            { item: EntityName.WOOD, quantity: 1 },
          ],
          output: { item: EntityName.IRON1, quantity: 1 },
          days: 1,
          requires: StoryFlag.FORGE_OPEN,
        },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Forge",
      description: "Ore and wood go in. By the next day there is iron.",
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
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 17, end: 19 },
            { row: 60, start: 17, end: 19 },
            { row: 61, start: 17, end: 19 },
            { row: 62, start: 17, end: 19 },
            { row: 63, start: 17, end: 19 },
            { row: 64, start: 17, end: 19 },
          ],
          frames: 5,
          wrap: 4,
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
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 8,
          offsetX: 15,
          offsetY: 21,
          static: true,
        },
      },
      {
        name: ComponentName.LIGHT,
        config: {
          radius: 100,
          intensity: 1.1,
          color: 0xffac58,
        },
      },
      {
        name: ComponentName.TEXTURE_ANIMATION,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 59, start: 13, end: 15 },
            { row: 60, start: 13, end: 15 },
            { row: 61, start: 13, end: 15 },
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
          width: 37,
          height: 11,
          offsetX: 6,
          offsetY: 31,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 32, start: 1, end: 3 },
            { row: 33, start: 1, end: 3 },
            { row: 34, start: 1, end: 3 },
            { row: 35, start: 1, end: 3 },
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
          width: 23,
          height: 7,
          offsetX: 5,
          offsetY: 35,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 32, start: 4, end: 5 },
            { row: 33, start: 4, end: 5 },
            { row: 34, start: 4, end: 5 },
            { row: 35, start: 4, end: 5 },
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
          width: 39,
          height: 12,
          offsetX: 4,
          offsetY: 19,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 56, start: 1, end: 3 },
            { row: 57, start: 1, end: 3 },
            { row: 58, start: 1, end: 3 },
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
          width: 19,
          height: 6,
          offsetX: 8,
          offsetY: 20,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 6, end: 7 },
            { row: 18, start: 6, end: 7 },
            { row: 19, start: 6, end: 7 },
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
          width: 23,
          height: 7,
          offsetX: 5,
          offsetY: 24,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 8, end: 9 },
            { row: 18, start: 8, end: 9 },
            { row: 19, start: 8, end: 9 },
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
          width: 28,
          height: 8,
          offsetX: 15,
          offsetY: 36,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 10, end: 12 },
            { row: 18, start: 10, end: 12 },
            { row: 19, start: 10, end: 12 },
            { row: 20, start: 10, end: 12 },
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
          width: 25,
          height: 8,
          offsetX: 2,
          offsetY: 11,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 13, end: 14 },
            { row: 18, start: 13, end: 14 },
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
          width: 24,
          height: 7,
          offsetX: 5,
          offsetY: 26,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 15, end: 16 },
            { row: 18, start: 15, end: 16 },
            { row: 19, start: 15, end: 16 },
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
          width: 22,
          height: 7,
          offsetX: 5,
          offsetY: 20,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 17, end: 18 },
            { row: 18, start: 17, end: 18 },
            { row: 19, start: 17, end: 18 },
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
          width: 21,
          height: 6,
          offsetX: 3,
          offsetY: 27,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 17, start: 19, end: 20 },
            { row: 18, start: 19, end: 20 },
            { row: 19, start: 19, end: 20 },
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
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      { name: ComponentName.DESTRUCTIBLE },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 4,
          offsetX: 1,
          offsetY: 9,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 15, start: 1, end: 1 },
            { row: 16, start: 1, end: 1 },
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
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.VASES_BREAK },
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 4,
          offsetX: 3,
          offsetY: 9,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 54, start: 1, end: 1 },
            { row: 55, start: 1, end: 1 },
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
    maxHealth: 10,
    components: [
      { name: ComponentName.DAMAGEABLE },
      {
        name: ComponentName.DESTRUCTIBLE,
        config: { sound: SoundName.VASES_BREAK },
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 15,
          height: 4,
          offsetX: 10,
          offsetY: 9,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 54, start: 2, end: 3 },
            { row: 55, start: 2, end: 3 },
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
          width: 43,
          height: 12,
          offsetX: 14,
          offsetY: 16,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 50, start: 3, end: 6 },
            { row: 51, start: 3, end: 6 },
            { row: 52, start: 3, end: 6 },
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
          width: 39,
          height: 12,
          offsetX: 4,
          offsetY: 30,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 50, start: 7, end: 9 },
            { row: 51, start: 7, end: 9 },
            { row: 52, start: 7, end: 9 },
            { row: 53, start: 7, end: 9 },
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
          width: 39,
          height: 12,
          offsetX: 4,
          offsetY: 1,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 50, start: 10, end: 12 },
            { row: 51, start: 10, end: 12 },
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
          width: 37,
          height: 11,
          offsetX: 6,
          offsetY: 11,
          pushable: false,
        },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "interior",
          tileSize: 16,
          tiles: [
            { row: 50, start: 13, end: 15 },
            { row: 51, start: 13, end: 15 },
            { row: 52, start: 13, end: 15 },
          ],
        },
        key: "table3_texture",
      },
    ],
    states: [],
    behaviors: [],
  },
};
