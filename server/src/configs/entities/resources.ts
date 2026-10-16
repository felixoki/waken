import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  Rarity,
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
      weight: 0.5,
    },
  },
  [EntityName.AZURITE1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 15, start: 5, end: 6 },
            { row: 16, start: 5, end: 6 },
          ],
        },
        key: "azurite1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Azurite",
      description: "Slender blue crystals of a copper mineral.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 16, col: 4 },
      weight: 0.5,
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
      weight: 2,
    },
  },
  [EntityName.CANDLE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [{ row: 8, start: 19, end: 19 }],
        },
        key: "candle_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Candle",
      description: "A stub of tallow with a wick, still good for a few hours.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 8, col: 19 },
      weight: 0.1,
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
      weight: 0.3,
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
      weight: 1.5,
    },
  },
  [EntityName.GLASS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 3, start: 5, end: 6 },
            { row: 4, start: 5, end: 6 },
          ],
        },
        key: "glass_texture",
      },
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
      weight: 0.4,
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
      weight: 0.1,
    },
  },
  [EntityName.BOTTLE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons13",
          tileSize: 16,
          tiles: [
            { row: 7, start: 2, end: 3 },
            { row: 8, start: 2, end: 3 },
          ],
        },
        key: "bottle_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bottle",
      description: "A blown glass bottle for wine and beer.",
      stackable: true,
      icon: { spritesheet: "icons13", row: 8, col: 1 },
      weight: 0.3,
    },
  },
  [EntityName.JAR]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons13",
          tileSize: 16,
          tiles: [
            { row: 15, start: 2, end: 3 },
            { row: 16, start: 2, end: 3 },
          ],
        },
        key: "jar_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Jar",
      description: "A wide glass jar with a lid, made for preserves.",
      stackable: true,
      icon: { spritesheet: "icons13", row: 16, col: 1 },
      weight: 0.3,
    },
  },
  [EntityName.FISHING_HOOK]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 5, start: 29, end: 30 },
            { row: 6, start: 29, end: 30 },
          ],
        },
        key: "fishing_hook_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Fishing hook",
      description: "A sharp metal hook for rigging a fishing line.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 6, col: 28 },
      weight: 0.01,
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
      weight: 2,
    },
  },
  [EntityName.TROLL_SCALES]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 1, start: 23, end: 24 },
            { row: 2, start: 23, end: 24 },
          ],
        },
        key: "troll_scales_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Troll scales",
      description: "A handful of coarse green scales torn from a fallen troll.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 2, col: 22 },
      weight: 1,
    },
  },
  [EntityName.ANCIENT_TROLL_HEART]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 1, start: 17, end: 18 },
            { row: 2, start: 17, end: 18 },
          ],
        },
        key: "ancient_troll_heart_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Ancient troll heart",
      description: "Still warm, and heavier than any heart should be.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 2, col: 16 },
      weight: 1,
    },
  },
  [EntityName.FOX_PELT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 3, start: 2, end: 3 },
            { row: 4, start: 2, end: 3 },
          ],
        },
        key: "fox_pelt_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Fox pelt",
      description: "A soft pelt obtained from a cunning fox.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 4, col: 1 },
      weight: 1,
    },
  },
  [EntityName.WOOL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons4",
          tileSize: 16,
          tiles: [
            { row: 1, start: 20, end: 21 },
            { row: 2, start: 20, end: 21 },
          ],
        },
        key: "wool_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wool",
      description: "A tuft of thick, soft wool from a mountain sheep.",
      stackable: true,
      icon: { spritesheet: "icons4", row: 2, col: 19 },
      weight: 1,
    },
  },
  [EntityName.BEAR_PELT]: {
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
        key: "bear_pelt_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bear pelt",
      description: "A thick pelt obtained from a wild bear.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 10, col: 10 },
      weight: 6,
    },
  },
  [EntityName.BELLAN_PELT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 3, start: 14, end: 15 },
            { row: 4, start: 14, end: 15 },
          ],
        },
        key: "bellan_pelt_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bellan's pelt",
      description: "The black pelt of Bellan.",
      stackable: true,
      rarity: Rarity.LEGENDARY,
      icon: { spritesheet: "icons6", row: 4, col: 13 },
      weight: 6,
    },
  },
  [EntityName.WOLF_PELT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 3, start: 5, end: 6 },
            { row: 4, start: 5, end: 6 },
          ],
        },
        key: "wolf_pelt_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wolf pelt",
      description: "A coarse grey pelt taken from a wolf.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 4, col: 4 },
      weight: 3,
    },
  },
  [EntityName.WOLF_FANG]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 17, start: 32, end: 33 },
            { row: 18, start: 32, end: 33 },
          ],
        },
        key: "wolf_fang_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wolf fang",
      description: "A long curved fang pulled from a wolf.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 18, col: 31 },
      weight: 0.05,
    },
  },
  [EntityName.IBEX_HORN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 9, start: 14, end: 15 },
            { row: 10, start: 14, end: 15 },
          ],
        },
        key: "ibex_horn_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Ibex horn",
      description: "A heavy ridged horn from a mountain ibex.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 10, col: 13 },
      weight: 0.5,
    },
  },
  [EntityName.BEAR_FAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 15, start: 11, end: 12 },
            { row: 16, start: 11, end: 12 },
          ],
        },
        key: "bear_fat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bear fat",
      description: "Rendered fat from a bear, used in salves and cooking.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 16, col: 10 },
      weight: 1,
    },
  },
  [EntityName.HERON_BEAK]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 19, start: 32, end: 33 },
            { row: 20, start: 32, end: 33 },
          ],
        },
        key: "heron_beak_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Heron beak",
      description: "The long, dagger-sharp beak of a heron.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 20, col: 31 },
      weight: 0.2,
    },
  },
  [EntityName.PLUME]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 3, start: 8, end: 9 },
            { row: 4, start: 8, end: 9 },
          ],
        },
        key: "plume_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Plume",
      description: "A long blue-grey plume shed from a heron.",
      stackable: true,
      icon: { spritesheet: "icons6", row: 4, col: 7 },
      weight: 0.02,
    },
  },
  [EntityName.GOOSE_DOWN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 19, start: 29, end: 30 },
            { row: 20, start: 29, end: 30 },
          ],
        },
        key: "goose_down_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Goose down",
      description: "Soft under-feathers of a goose, used to stuff bedding.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 20, col: 28 },
      weight: 0.1,
    },
  },
  [EntityName.WANDERERS_GIFT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 3, start: 14, end: 15 },
            { row: 4, start: 14, end: 15 },
          ],
        },
        key: "wanderers_gift_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wanderer's gift",
      description: "A mysterious object with a blue shimmering glow.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 4, col: 13 },
      weight: 0.5,
    },
  },
  [EntityName.WANDERERS_CLOTH]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 7, start: 2, end: 3 },
            { row: 8, start: 2, end: 3 },
          ],
        },
        key: "wanderers_cloth_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wanderer's cloth",
      description: "A pale garment left behind by those who walk in their sleep.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 8, col: 1 },
      weight: 0.2,
    },
  },
  [EntityName.RAT_CLAWS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 17, start: 14, end: 15 },
            { row: 18, start: 14, end: 15 },
          ],
        },
        key: "rat_claws_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Rat claws",
      description: "Jagged claws torn from a filthy sewer rat.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 18, col: 13 },
      weight: 0.05,
    },
  },
  [EntityName.ERGOT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 13, start: 14, end: 15 },
            { row: 14, start: 14, end: 15 },
          ],
        },
        key: "ergot_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Ergot",
      description: "Dark, spur-shaped fungus picked from spoiled grain.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 14, col: 13 },
      weight: 0.05,
    },
  },
  [EntityName.BALE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 17, start: 17, end: 18 },
            { row: 18, start: 17, end: 18 },
          ],
        },
        key: "bale_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bale",
      description: "A dish of thick amber fat taken from cattle.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 18, col: 16 },
      weight: 0.5,
    },
  },
};
