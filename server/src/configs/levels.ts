import { MapName } from "../types";
import { BiomeName, Level } from "../types/generation";

export const levels: Level[] = [
  {
    depth: 0,
    map: MapName.FOREST,
    biomes: [
      { biome: BiomeName.MOUNTAIN, requires: 2 },
      { biome: BiomeName.FOREST, spawn: true },
      { biome: BiomeName.SWAMP, requires: 1 },
    ],
  },
  {
    depth: 1,
    map: MapName.DUNGEON,
    requires: 3,
    biomes: [{ biome: BiomeName.DUNGEON, spawn: true }],
  },
  {
    depth: 2,
    map: MapName.TEMPLE,
    requires: 4,
    biomes: [{ biome: BiomeName.TEMPLE, spawn: true }],
  },
  { depth: 3, map: MapName.ISLES, requires: 5 },
];
