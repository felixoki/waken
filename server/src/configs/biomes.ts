import { EntityName } from "../types";
import { BiomeConfig, BiomeName, TerrainName } from "../types/generation";

export const forest: BiomeConfig = {
  id: BiomeName.FOREST,
  width: 72,
  height: 72,
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
      threshold: -0.3,
    },
    { terrain: TerrainName.GROUND, tileset: "village_home", threshold: -0.1 },
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
      queryProperty: "terrain",
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
      cluster: true,
    },
    {
      entities: [EntityName.REED1, EntityName.REED2, EntityName.REED3],
      terrain: [TerrainName.GRASS],
      density: 0.5,
      spacing: 0,
      group: { min: 3, max: 8, radius: 1 },
    },
    {
      entities: [
        EntityName.ROCK1,
        EntityName.ROCK2,
        EntityName.ROCK3,
        EntityName.ROCK8,
        EntityName.ROCKS1,
        EntityName.ROCKS3,
        EntityName.ROCKS5,
        EntityName.ROCKS6,
      ],
      terrain: [TerrainName.GRASS],
      density: 0.05,
      spacing: 3,
    },
    {
      entities: [EntityName.ROCK4],
      terrain: [TerrainName.GROUND],
      density: 0.05,
      spacing: 3,
    },
    {
      entities: [
        EntityName.BUSH1,
        EntityName.BUSH2,
        EntityName.BUSH3,
        EntityName.BUSH4,
      ],
      terrain: [TerrainName.GRASS],
      density: 0.1,
      spacing: 2,
      cluster: true,
    },
    {
      entities: [EntityName.FLYAMINATA1, EntityName.BASKETFERN],
      terrain: [TerrainName.GRASS],
      density: 0.05,
      spacing: 2,
    },
    {
      entities: [EntityName.DUCK, EntityName.DRAKE],
      terrain: [TerrainName.WATER],
      density: 0.02,
      spacing: 4,
    },
    {
      entities: [EntityName.ORC1],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      density: 0.005,
      spacing: 15,
      group: { min: 1, max: 2, radius: 3 },
    },
  ],

  exclusion: 8,
};
