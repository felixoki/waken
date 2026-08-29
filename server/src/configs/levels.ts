import { MapName } from "../types";
import { BiomeName } from "../types/generation";

export const levels: { depth: number; map: MapName; biome?: BiomeName }[] = [
  { depth: 0, map: MapName.FOREST, biome: BiomeName.FOREST },
  { depth: 1, map: MapName.DUNGEON, biome: BiomeName.DUNGEON },
  { depth: 2, map: MapName.ISLES },
];
