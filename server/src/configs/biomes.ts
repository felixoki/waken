import { EntityName, FishName, Item, SurfaceName } from "../types";
import {
  BiomeConfig,
  BiomeName,
  GeneratorName,
  RoomDifficulty,
  RoomInteriorOrigin,
  RoomName,
  RoomType,
  TerrainName,
} from "../types/generation";
import { groundStamps, grassStamps, flowerStamps, snowStamps } from "./details";

const CHEST_LOOT: (Item & { chance: number })[] = [
  { name: EntityName.WOOD, quantity: 5, stackable: true, chance: 0.75 },
  { name: EntityName.IRON1, quantity: 3, stackable: true, chance: 0.25 },
  { name: EntityName.QUARTZ1, quantity: 5, stackable: true, chance: 0.5 },
  { name: EntityName.POTION1, quantity: 1, stackable: true, chance: 0.1 },
  { name: EntityName.POTION2, quantity: 1, stackable: true, chance: 0.1 },

  { name: EntityName.AMULET1, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.RING1, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.RING2, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.RING3, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.AMULET2, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.BOOTS1, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.HARE_FOOT, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.BELL, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.FEATHER, quantity: 1, stackable: false, chance: 0.01 },
  { name: EntityName.HAT1, quantity: 1, stackable: false, chance: 0.01 },

  { name: EntityName.SPELL_PAGE_METEOR_SHOWER, quantity: 1, stackable: false, chance: 0.025 },
  { name: EntityName.SPELL_PAGE_LIGHTNING_STRIKE, quantity: 1, stackable: false, chance: 0.05 },
  { name: EntityName.SPELL_PAGE_HYPERBEAM, quantity: 1, stackable: false, chance: 0.001 },
  { name: EntityName.SPELL_PAGE_BLINK, quantity: 1, stackable: false, chance: 0.02 },
  { name: EntityName.SPELL_PAGE_SHIELD, quantity: 1, stackable: false, chance: 0.25 },
  { name: EntityName.SPELL_PAGE_HEAL_PARTY, quantity: 1, stackable: false, chance: 0.25 },
  { name: EntityName.SPELL_PAGE_ABSORB_LIFE, quantity: 1, stackable: false, chance: 0.05 },

  { name: EntityName.CARROT_SEED, quantity: 3, stackable: true, chance: 0.2 },
  { name: EntityName.CABBAGE_SEED, quantity: 3, stackable: true, chance: 0.2 },
  { name: EntityName.WHEAT_SEED, quantity: 4, stackable: true, chance: 0.2 },
  { name: EntityName.TOMATO_SEED, quantity: 2, stackable: true, chance: 0.12 },
  { name: EntityName.GRAPE_SEED, quantity: 2, stackable: true, chance: 0.06 },
  { name: EntityName.HOPS_SEED, quantity: 2, stackable: true, chance: 0.06 },
];

export const forest: BiomeConfig = {
  id: BiomeName.FOREST,
  label: "Forest",
  width: 256,
  height: 256,
  tileWidth: 16,
  tileHeight: 16,

  tilesets: [
    "dungeon_walls_floor",
    "dungeon_decorative_cracks_floor",
    "cave_walls_floor",
  ],

  noise: {
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    scale: 0.05,
  },

  layers: [
    {
      terrain: TerrainName.WATER,
      tileset: "village_farm_ground_grass",
      threshold: -0.5,
    },
    { terrain: TerrainName.GROUND, tileset: "village_home", threshold: -0.3 },
    {
      terrain: TerrainName.GRASS,
      tileset: "village_home",
      threshold: null,
      surface: SurfaceName.GRASS,
    },
  ],

  borders: [
    {
      from: TerrainName.GROUND,
      to: TerrainName.WATER,
      tileset: "water_coasts",
      collides: true,
    },
    {
      from: TerrainName.GRASS,
      to: TerrainName.WATER,
      tileset: "water_coasts",
      collides: true,
    },
    {
      from: TerrainName.GRASS,
      to: TerrainName.GROUND,
      tileset: "village_home",
    },
  ],

  terrain: [TerrainName.GROUND, TerrainName.GRASS],

  objects: [
    {
      entities: [
        EntityName.TREE1,
        EntityName.TREE2,
        EntityName.TREE4,
        EntityName.TREE5,
      ],
      terrain: [TerrainName.GRASS],
      density: 0.5,
      spacing: 2,
      margin: 2,
      cluster: true,
    },
    {
      entities: [EntityName.REED1, EntityName.REED2, EntityName.REED3],
      terrain: [TerrainName.GRASS],
      density: 0.3,
      spacing: 0,
      group: { min: 3, max: 4, radius: 1 },
    },
    {
      entities: [
        EntityName.ROCK1,
        EntityName.ROCK2,
        EntityName.ROCK3,
        EntityName.ROCK8,
      ],
      terrain: [TerrainName.GRASS],
      density: 0.1,
      spacing: 3,
      margin: 2,
    },
    {
      entities: [
        EntityName.BUSH1,
        EntityName.BUSH2,
        EntityName.BUSH3,
        EntityName.BUSH4,
      ],
      terrain: [TerrainName.GRASS],
      density: 0.3,
      spacing: 2,
      cluster: true,
    },
    {
      entities: [
        EntityName.SUNFLOWER,
        EntityName.DAFFODIL,
        EntityName.BLUE_LOTUS,
        EntityName.CLARY_SAGE,
        EntityName.BELLADONNA,
        EntityName.BEARDED_TOOTH_FUNGUS,
        EntityName.RASPBERRY,
      ],
      terrain: [TerrainName.GRASS],
      density: 0.2,
      spacing: 2,
    },
    {
      entities: [EntityName.HENBANE, EntityName.OPIUM_POPPY],
      terrain: [TerrainName.GRASS],
      count: { min: 6, max: 10 },
      spacing: 20,
      margin: 1,
    },
    {
      entities: [EntityName.DEER],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 15, max: 25 },
      spacing: 5,
      group: { min: 0, max: 2, radius: 2 },
    },
    {
      entities: [EntityName.FOX, EntityName.HARE],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 5, max: 10 },
      spacing: 5,
    },
    {
      entities: [EntityName.GROUSE],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 2, max: 6 },
      spacing: 4,
      group: { min: 0, max: 1, radius: 2 },
    },
    {
      entities: [EntityName.BOAR],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 10, max: 18 },
      spacing: 5,
      group: { min: 0, max: 2, radius: 3 },
    },
    {
      entities: [EntityName.BEAR],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 1, max: 3 },
      spacing: 8,
    },
    {
      entities: [EntityName.WOLF1, EntityName.WOLF2],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 5, max: 10 },
      spacing: 8,
      group: { min: 0, max: 2, radius: 3 },
    },
    {
      entities: [EntityName.GOBLIN1],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 7, max: 15 },
      spacing: 5,
      group: { min: 1, max: 2, radius: 3 },
    },
    {
      entities: [EntityName.TROLL],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 2, max: 4 },
      spacing: 8,
    },
    {
      entities: [EntityName.SHADOW_WANDERER],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 1, max: 3 },
      spacing: 10,
    },
    {
      entities: [EntityName.HERON],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 1, max: 3 },
      spacing: 10,
    },
    {
      entities: [EntityName.SILVER_SWORD],
      terrain: [TerrainName.GRASS],
      count: { min: 1, max: 1 },
      spacing: 4,
      margin: 2,
    },
  ],

  generator: GeneratorName.TERRAIN,
  exclusion: 0,
  smoothing: { iterations: 2, threshold: 4 },

  details: [
    {
      tileset: "ground_grass_details",
      terrains: [TerrainName.GROUND],
      density: 0.4,
      stamps: groundStamps,
      gap: 0,
      cluster: true,
    },
    {
      tileset: "village_home",
      terrains: [TerrainName.GRASS],
      density: 0.03,
      stamps: flowerStamps,
      gap: 1,
    },
    {
      tileset: "ground_grass_details",
      terrains: [TerrainName.GRASS],
      density: 0.45,
      stamps: grassStamps,
      gap: 0,
      cluster: true,
    },
  ],
};

export const dungeon: BiomeConfig = {
  id: BiomeName.DUNGEON,
  label: "Dungeon",
  width: 128,
  height: 128,
  tileWidth: 16,
  tileHeight: 16,

  noise: {
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    scale: 0.05,
  },

  layers: [
    {
      terrain: TerrainName.VOID,
      tileset: "dungeon_walls_floor",
      threshold: null,
    },
    {
      terrain: TerrainName.RECESSED,
      tileset: "dungeon_walls_floor",
      threshold: null,
      surface: SurfaceName.STONE,
    },
    {
      terrain: TerrainName.FLOOR,
      tileset: "dungeon_walls_floor",
      threshold: null,
      surface: SurfaceName.STONE,
    },
    {
      terrain: TerrainName.ELEVATED,
      tileset: "dungeon_walls_floor",
      threshold: null,
      surface: SurfaceName.STONE,
    },
  ],

  borders: [],
  ledge: "dungeon_walls_floor",
  walls: "dungeon_walls_floor",
  terrain: [TerrainName.FLOOR, TerrainName.ELEVATED, TerrainName.RECESSED],
  objects: [],
  generator: GeneratorName.ROOM,
  exclusion: 0,
  smoothing: null,

  rooms: {
    assignment: {
      easyDepth: 2,
      chance: { hidden: 0.1, puzzle: 0.12 },
    },
    hasRecesses: true,
    distribution: {
      large: {
        count: { min: 1, max: 2 },
        size: { width: { min: 80, max: 100 }, height: { min: 16, max: 20 } },
      },
      small: {
        count: { min: 8, max: 15 },
        size: { width: { min: 14, max: 16 }, height: { min: 14, max: 16 } },
      },
    },
    templates: [
      {
        id: RoomName.SEWER1,
        type: RoomType.SEWER,
        difficulty: RoomDifficulty.EASY,
        weight: 10,
        depth: { min: 0, max: 4 },
        water: { coverage: 0.15 },
        enemies: [
          {
            entities: [EntityName.RAT, EntityName.GOBLIN1],
            count: { min: 4, max: 6 },
          },
        ],
        traps: [
          {
            entities: [EntityName.SPIKE_TRAP1],
            count: { min: 2, max: 4 },
          },
        ],
      },
      {
        id: RoomName.FEAST1,
        type: RoomType.FEAST,
        difficulty: RoomDifficulty.HARD,
        weight: 6,
        depth: { min: 2, max: undefined },
        enemies: [
          {
            entities: [EntityName.ORC1, EntityName.GOBLIN2],
            count: { min: 3, max: 5 },
          },
        ],
      },
      {
        id: RoomName.FEAST3,
        type: RoomType.FEAST,
        difficulty: RoomDifficulty.HARD,
        weight: 6,
        depth: { min: 4, max: undefined },
        enemies: [
          {
            entities: [EntityName.GOBLIN2, EntityName.ORC2],
            count: { min: 3, max: 4 },
          },
        ],
      },
    ],
    interior: [
      {
        origin: RoomInteriorOrigin.TOP_RIGHT,
        entities: [
          { name: EntityName.BOXES2, x: -128, y: -4 },
          { name: EntityName.CUPBOARD1, x: -88, y: -14 },
          { name: EntityName.WEAPONRACK1, x: -24, y: -6 },
          { name: EntityName.TABLE1, x: -136, y: 42 },
          { name: EntityName.TABLE2, x: -48, y: 100 },
          { name: EntityName.BOXES3, x: -16, y: 46 },
          { name: EntityName.FIREBOWL1, x: -74, y: 56 },
          { name: EntityName.CHEST1, x: -20, y: 100, loot: CHEST_LOOT },
        ],
      },
      {
        origin: RoomInteriorOrigin.TOP_RIGHT,
        entities: [
          { name: EntityName.BARREL1, x: -106, y: 12 },
          { name: EntityName.BARREL2, x: -56, y: -2 },
          { name: EntityName.VASES1, x: -136, y: 12 },
          { name: EntityName.VASES2, x: -80, y: 12 },
          { name: EntityName.BOXES4, x: -24, y: -2 },
          { name: EntityName.BOXES5, x: -52, y: 28 },
          { name: EntityName.CHEST1, x: -16, y: 52, loot: CHEST_LOOT },
          { name: EntityName.BANQUET_TABLE, x: -93, y: 82 },
        ],
      },
      {
        origin: RoomInteriorOrigin.TOP_LEFT,
        entities: [
          { name: EntityName.WEAPONRACK1, x: 25, y: -4 },
          { name: EntityName.VASES2, x: 64, y: 8 },
          { name: EntityName.BARREL2, x: 88, y: 8 },
          { name: EntityName.TABLE1, x: 104, y: 34 },
          { name: EntityName.FIREBOWL1, x: 54, y: 56 },
          { name: EntityName.TABLE3, x: 87, y: 82 },
          { name: EntityName.CHICKEN, x: 64, y: 100 },
          { name: EntityName.CHEST1, x: 24, y: 46, loot: CHEST_LOOT },
        ],
      },
      {
        origin: RoomInteriorOrigin.TOP_LEFT,
        entities: [
          { name: EntityName.BARREL3, x: 17, y: 12 },
          { name: EntityName.BARRELS1, x: 55, y: 12 },
          { name: EntityName.BARREL3, x: 113, y: 12 },
          { name: EntityName.BARREL2, x: 136, y: 14 },
          { name: EntityName.TABLE2, x: 39, y: 56 },
          { name: EntityName.TABLE3, x: 104, y: 66 },
          { name: EntityName.CHICKEN, x: 64, y: 100 },
          { name: EntityName.CHEST1, x: 20, y: 100, loot: CHEST_LOOT },
        ],
      },
      {
        origin: RoomInteriorOrigin.BOTTOM_LEFT,
        entities: [
          { name: EntityName.BOXES6, x: 15, y: -24 },
          { name: EntityName.BARRELS2, x: 51, y: -24 },
          { name: EntityName.ROOSTER, x: 64, y: -8 },
          { name: EntityName.CHEST1, x: 96, y: -24, loot: CHEST_LOOT },
        ],
      },
      {
        origin: RoomInteriorOrigin.BOTTOM_RIGHT,
        entities: [
          { name: EntityName.BOXES7, x: -16, y: -16 },
          { name: EntityName.CHEST1, x: -56, y: -16, loot: CHEST_LOOT },
        ],
      },
      {
        origin: RoomInteriorOrigin.TOP_RIGHT,
        entities: [
          { name: EntityName.BOXES6, x: -96, y: 8 },
          { name: EntityName.CUPBOARD2, x: -64, y: -14 },
          { name: EntityName.BOWL1, x: -40, y: 12 },
          { name: EntityName.BOXES8, x: -18, y: 12 },
          { name: EntityName.GOAT, x: -64, y: 32 },
          { name: EntityName.GOAT, x: -32, y: 48 },
          { name: EntityName.CHEST1, x: -16, y: 48, loot: CHEST_LOOT },
        ],
      },
    ],
  },
};

export const cave: BiomeConfig = {
  id: BiomeName.CAVE,
  label: "Cave",
  width: 48,
  height: 48,
  tileWidth: 16,
  tileHeight: 16,

  noise: {
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    scale: 0.05,
  },

  layers: [
    { terrain: TerrainName.VOID, tileset: "cave_walls_floor", threshold: null },
    {
      terrain: TerrainName.WATER,
      tileset: "cave_water_coasts",
      threshold: null,
    },
    {
      terrain: TerrainName.RECESSED,
      tileset: "cave_walls_floor",
      threshold: null,
      surface: SurfaceName.STONE,
    },
    {
      terrain: TerrainName.FLOOR,
      tileset: "cave_walls_floor",
      threshold: null,
      surface: SurfaceName.STONE,
    },
    {
      terrain: TerrainName.ELEVATED,
      tileset: "cave_walls_floor",
      threshold: null,
      surface: SurfaceName.STONE,
    },
  ],

  borders: [
    {
      from: TerrainName.FLOOR,
      to: TerrainName.WATER,
      tileset: "cave_water_coasts",
      collides: true,
    },
  ],
  ledge: "cave_walls_floor",
  walls: "cave_walls_floor",
  details: [
    {
      tileset: "ground_grass_details",
      terrains: [TerrainName.FLOOR],
      density: 0.4,
      stamps: groundStamps,
      gap: 0,
      cluster: true,
    },
  ],
  terrain: [TerrainName.FLOOR, TerrainName.ELEVATED, TerrainName.RECESSED],
  objects: [
    {
      entities: [EntityName.QUARTZ_ORE],
      terrain: [TerrainName.FLOOR],
      count: { min: 1, max: 3 },
      spacing: 3,
      margin: 1,
      wallAdjacent: true,
    },
    {
      entities: [EntityName.CHEST1],
      terrain: [TerrainName.FLOOR],
      count: { min: 1, max: 1 },
      spacing: 3,
      margin: 1,
      wallAdjacent: true,
      loot: CHEST_LOOT,
    },
  ],
  generator: GeneratorName.ROOM,
  exclusion: 0,
  smoothing: null,

  rooms: {
    assignment: {
      easyDepth: 1,
      chance: { hidden: 0, puzzle: 0 },
    },
    erosion: {
      band: 0.5,
      scale: 0.13,
      threshold: 0.6,
      smoothing: 0,
      clearance: 1,
      quantize: 3,
      north: 4,
    },
    water: {
      chance: 0.6,
      scale: 0.2,
      radius: { min: 4, max: 6 },
      threshold: 0.6,
      fish: [FishName.CAVEFISH],
    },
    distribution: {
      large: {
        count: { min: 1, max: 1 },
        size: { width: { min: 22, max: 30 }, height: { min: 16, max: 22 } },
      },
      small: {
        count: { min: 0, max: 0 },
        size: { width: { min: 999, max: 999 }, height: { min: 999, max: 999 } },
      },
    },
    templates: [
      {
        id: RoomName.CAVE1,
        type: RoomType.CAVE,
        difficulty: RoomDifficulty.EASY,
        weight: 10,
        depth: { min: 0, max: undefined },
        enemies: [
          {
            entities: [EntityName.BEAR],
            count: { min: 1, max: 1 },
          },
        ],
      },
    ],
    interior: [],
  },
};

export const mountain: BiomeConfig = {
  id: BiomeName.MOUNTAIN,
  label: "Mountain",
  width: 256,
  height: 160,
  tileWidth: 16,
  tileHeight: 16,

  noise: {
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    scale: 0.02,
  },

  layers: [
    {
      terrain: TerrainName.GRASS,
      tileset: "village_home",
      threshold: null,
      surface: SurfaceName.GRASS,
    },
    {
      terrain: TerrainName.EARTH,
      tileset: "forest_ground_grass",
      threshold: null,
      surface: SurfaceName.DIRT,
    },
    {
      terrain: TerrainName.SNOW,
      tileset: "mountains_ground",
      threshold: null,
      surface: SurfaceName.SNOW,
    },
  ],

  terraces: {
    earth: 6,
    snow: 4,
    foot: 16,
    gap: 6,
    summit: 16,
    dome: 1.25,
    rough: 0.45,
    scarps: 2,
    ridge: 5,
    tread: 3,
    stairs: { every: 40, tilesets: ["stairs_grass", "mountains_ground"] },
    patches: 6,
  },

  tilesets: ["stairs_grass"],

  borders: [],

  terrain: [TerrainName.GRASS],

  objects: [
    {
      entities: [
        EntityName.TREE1,
        EntityName.TREE2,
        EntityName.TREE4,
        EntityName.TREE5,
      ],
      terrain: [TerrainName.GRASS],
      elevation: { min: 0, max: 0 },
      density: 0.5,
      spacing: 2,
      margin: 2,
      cluster: true,
    },
    {
      entities: [
        EntityName.TREE1,
        EntityName.TREE2,
        EntityName.TREE4,
        EntityName.TREE5,
      ],
      terrain: [TerrainName.GRASS],
      elevation: { min: 1, max: 6 },
      density: 0.45,
      spacing: 2,
      margin: 1,
      cluster: true,
    },
    {
      entities: [EntityName.REED1, EntityName.REED2, EntityName.REED3],
      terrain: [TerrainName.GRASS],
      density: 0.3,
      spacing: 0,
      group: { min: 3, max: 4, radius: 1 },
    },
    {
      entities: [EntityName.TREE6, EntityName.TREE7, EntityName.TREE8],
      terrain: [TerrainName.SNOW],
      density: 0.35,
      spacing: 2,
      margin: 2,
      cluster: true,
    },
    {
      entities: [EntityName.WOLF3],
      terrain: [TerrainName.EARTH, TerrainName.SNOW],
      count: { min: 4, max: 7 },
      spacing: 10,
      group: { min: 1, max: 2, radius: 3 },
    },
    {
      entities: [EntityName.EDELWEISS],
      terrain: [TerrainName.SNOW],
      count: { min: 2, max: 4 },
      spacing: 25,
      margin: 1,
    },
    {
      entities: [EntityName.ANCIENT_TROLL],
      terrain: [TerrainName.EARTH, TerrainName.SNOW],
      count: { min: 1, max: 2 },
      spacing: 20,
    },
    {
      entities: [EntityName.HEXGEIST],
      terrain: [TerrainName.EARTH, TerrainName.SNOW],
      count: { min: 3, max: 5 },
      spacing: 12,
    },
    {
      entities: [EntityName.BLOODGEIST1],
      terrain: [TerrainName.EARTH, TerrainName.SNOW],
      count: { min: 3, max: 5 },
      spacing: 12,
    },
  ],

  details: [
    {
      tileset: "ground_grass_details",
      terrains: [TerrainName.EARTH],
      density: 0.5,
      stamps: groundStamps,
      gap: 0,
      cluster: true,
    },
    {
      tileset: "village_home",
      terrains: [TerrainName.GRASS],
      density: 0.03,
      stamps: flowerStamps,
      gap: 1,
    },
    {
      tileset: "ground_grass_details",
      terrains: [TerrainName.GRASS],
      density: 0.45,
      stamps: grassStamps,
      gap: 0,
      cluster: true,
    },
    {
      tileset: "snow_details",
      terrains: [TerrainName.SNOW],
      density: 0.5,
      stamps: snowStamps,
      gap: 0,
      cluster: true,
    },
  ],

  peak: { entity: EntityName.CLOUDLADDER, requires: 3 },

  generator: GeneratorName.TERRACE,
  exclusion: 0,
  smoothing: null,
};
