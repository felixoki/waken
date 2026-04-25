import { EntityName } from "../types";
import { BiomeConfig, BiomeName, TerrainName } from "../types/generation";

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
        EntityName.ROCKS1,
        EntityName.ROCKS3,
        EntityName.ROCKS5,
        EntityName.ROCKS6,
      ],
      terrain: [TerrainName.GRASS],
      density: 0.1,
      spacing: 3,
    },
    {
      entities: [EntityName.ROCK4],
      terrain: [TerrainName.GROUND],
      density: 0.1,
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
      entities: [EntityName.ORC1, EntityName.GOBLIN1],
      terrain: [TerrainName.GRASS, TerrainName.GROUND],
      count: { min: 8, max: 15 },
      spacing: 5,
      group: { min: 0, max: 1, radius: 3 },
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

  exclusion: 0,
};
