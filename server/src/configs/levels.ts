import { MapName } from "../types";
import { BiomeName, Level } from "../types/generation";

export const levels: Level[] = [
  {
    depth: 0,
    map: MapName.FOREST,
    biomes: [
      { biome: BiomeName.MOUNTAIN, requires: 2 },
      { biome: BiomeName.FOREST, spawn: true },
    ],
  },
  {
    depth: 1,
    map: MapName.DUNGEON,
    requires: 1,
    biomes: [{ biome: BiomeName.DUNGEON, spawn: true }],
  },
  { depth: 2, map: MapName.ISLES, requires: 3 },
];
