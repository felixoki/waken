import { EntityName, MapName } from "../types";
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
import { groundStamps, grassStamps, flowerStamps } from "./details";

export const levels = [
  { depth: 0, map: MapName.FOREST, biome: BiomeName.FOREST },
  { depth: 1, map: MapName.DUNGEON, biome: BiomeName.DUNGEON },
];

export const forest: BiomeConfig = {
  id: BiomeName.FOREST,
  width: 256,
  height: 256,
  tileWidth: 16,
  tileHeight: 16,

  tilesets: ["dungeon_walls_floor", "dungeon_decorative_cracks_floor"],

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
    { terrain: TerrainName.GRASS, tileset: "village_home", threshold: null },
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
      entities: [EntityName.GOBLIN1, EntityName.ORC1],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 7, max: 15 },
      spacing: 5,
      group: { min: 1, max: 2, radius: 3 },
    },
    {
      entities: [EntityName.TROLL],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 2, max: 5 },
      spacing: 8,
    },
    {
      entities: [EntityName.SHADOW_WANDERER],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 1, max: 3 },
      spacing: 10,
    },
  ],

  generator: GeneratorName.TERRAIN,
  exclusion: 0,
  smoothing: { iterations: 2, threshold: 4 },

  details: [
    {
      tileset: "ground_grass_details",
      terrains: [TerrainName.GROUND],
      density: 0.06,
      stamps: groundStamps,
    },
    {
      tileset: "ground_grass_details",
      terrains: [TerrainName.GRASS],
      density: 0.06,
      stamps: grassStamps,
    },
    {
      tileset: "village_home",
      terrains: [TerrainName.GRASS],
      density: 0.03,
      stamps: flowerStamps,
    },
  ],
};

export const dungeon: BiomeConfig = {
  id: BiomeName.DUNGEON,
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
    },
    {
      terrain: TerrainName.FLOOR,
      tileset: "dungeon_walls_floor",
      threshold: null,
    },
    {
      terrain: TerrainName.ELEVATED,
      tileset: "dungeon_walls_floor",
      threshold: null,
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
            entities: [EntityName.RAT],
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
            entities: [
              EntityName.ORC1,
              EntityName.GOBLIN1,
            ],
            count: { min: 1, max: 3 },
          },
        ],
      },
      {
        id: RoomName.FEAST2,
        type: RoomType.FEAST,
        difficulty: RoomDifficulty.HARD,
        weight: 6,
        depth: { min: 3, max: undefined },
        enemies: [
          {
            entities: [
              EntityName.GOBLIN1,
              EntityName.GOBLIN2,
            ],
            count: { min: 2, max: 4 },
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
            entities: [
              EntityName.ORC1,
              EntityName.ORC2,
            ],
            count: { min: 2, max: 4 },
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
          {
            name: EntityName.CHEST1,
            x: -16,
            y: 52,
            loot: [
              {
                name: EntityName.IRON1,
                quantity: 3,
                stackable: true,
                chance: 0.8,
              },
              {
                name: EntityName.QUARTZ1,
                quantity: 2,
                stackable: true,
                chance: 0.5,
              },
              {
                name: EntityName.POTION1,
                quantity: 1,
                stackable: true,
                chance: 0.3,
              },
            ],
          },
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
        ],
      },
      {
        origin: RoomInteriorOrigin.BOTTOM_LEFT,
        entities: [
          { name: EntityName.BOXES6, x: 15, y: -24 },
          { name: EntityName.BARRELS2, x: 51, y: -24 },
        ],
      },
      {
        origin: RoomInteriorOrigin.BOTTOM_RIGHT,
        entities: [{ name: EntityName.BOXES7, x: -16, y: -16 }],
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
        ],
      },
    ],
  },
};
