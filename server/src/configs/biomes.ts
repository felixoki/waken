import { EntityName, MapName } from "../types";
import {
  BiomeConfig,
  BiomeName,
  GeneratorName,
  RoomDifficulty,
  RoomName,
  RoomPattern,
  RoomType,
  TerrainName,
  TrapName,
  TrapTrigger,
} from "../types/generation";
import { groundStamps, grassStamps, flowerStamps } from "./details";

export const levels = [
  { depth: 0, map: MapName.FOREST, biome: BiomeName.FOREST },
];

export const forest: BiomeConfig = {
  id: BiomeName.FOREST,
  width: 256,
  height: 256,
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
      entities: [EntityName.FOX],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 5, max: 10 },
      spacing: 5,
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
      group: { min: 1, max: 3, radius: 3 },
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
        size: { width: { min: 10, max: 12 }, height: { min: 10, max: 12 } },
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
        setpieces: [
          {
            pattern: RoomPattern.CLUSTER,
            entities: [EntityName.RAT],
            count: { min: 3, max: 6 },
          },
          {
            pattern: RoomPattern.WALL,
            entities: [EntityName.TORCH1],
            count: { min: 2, max: 4 },
          },
          {
            pattern: RoomPattern.LINE,
            entities: [EntityName.BARREL1],
            count: { min: 1, max: 3 },
          },
        ],
        traps: [
          { name: TrapName.SPIKE1, density: 0.05, trigger: TrapTrigger.STEP },
        ],
        loot: {
          entities: [],
          count: { min: 0, max: 0 },
          density: 0,
        },
      },
      {
        id: RoomName.FEAST1,
        type: RoomType.FEAST,
        difficulty: RoomDifficulty.HARD,
        weight: 6,
        depth: { min: 3, max: undefined },
        setpieces: [
          {
            pattern: RoomPattern.CLUSTER,
            entities: [EntityName.FISH_STAND1],
            count: { min: 1, max: 2 },
          },
          {
            pattern: RoomPattern.RING,
            entities: [EntityName.ORC1, EntityName.GOBLIN1],
            count: { min: 4, max: 7 },
          },
          {
            pattern: RoomPattern.WALL,
            entities: [EntityName.TORCH1],
            count: { min: 3, max: 6 },
          },
        ],
        traps: [
          { name: TrapName.SPIKE1, density: 0.15, trigger: TrapTrigger.STEP },
        ],
        loot: {
          entities: [EntityName.CHEST1],
          count: { min: 1, max: 3 },
          density: 0.2,
        },
      },
    ],
  },
};
