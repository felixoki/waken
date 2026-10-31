import { EntityName, FishConfig, FishName, Rarity } from "../types/index.js";

export const fish: Record<FishName, FishConfig> = {
  [FishName.PERCH]: {
    rarity: Rarity.COMMON,
    encounter: 100,
    weight: { min: 0.2, max: 2.5, skew: 3.0 },
    difficulty: { speed: 0.32, erratic: 1.2, bar: 0.12, drain: 14.5 },
    trophy: { minWeight: 1.5, item: EntityName.PERCH_TROPHY },
    meat: 1,
  },
  [FishName.CARP]: {
    rarity: Rarity.COMMON,
    encounter: 70,
    weight: { min: 1, max: 12, skew: 3.0 },
    difficulty: { speed: 0.37, erratic: 1.75, bar: 0.12, drain: 17 },
    trophy: { minWeight: 7, item: EntityName.CARP_TROPHY },
    meat: 2,
  },
  [FishName.PIKE]: {
    rarity: Rarity.RARE,
    encounter: 20,
    weight: { min: 2, max: 18, skew: 3.5 },
    difficulty: { speed: 0.44, erratic: 2.45, bar: 0.12, drain: 20 },
    trophy: { minWeight: 10.8, item: EntityName.PIKE_TROPHY },
    meat: 3,
  },
  [FishName.CAVEFISH]: {
    rarity: Rarity.RARE,
    encounter: 15,
    weight: { min: 0.3, max: 4, skew: 3.5 },
    difficulty: { speed: 0.4, erratic: 2.1, bar: 0.12, drain: 18.5 },
    trophy: { minWeight: 2.3, item: EntityName.CAVEFISH_TROPHY },
  },
};
