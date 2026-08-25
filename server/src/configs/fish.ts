import { EntityName, FishConfig, FishName, Rarity } from "../types/index.js";

export const fish: Record<FishName, FishConfig> = {
  [FishName.PERCH]: {
    rarity: Rarity.COMMON,
    encounter: 100,
    weight: { min: 0.2, max: 2.5, skew: 3.0 },
    difficulty: { speed: 0.32, erratic: 1.7, bar: 0.095, drain: 18 },
    trophies: [
      { minWeight: 1.5, item: EntityName.PERCH_TROPHY1 },
      { minWeight: 2.1, item: EntityName.PERCH_TROPHY2 },
      { minWeight: 2.4, item: EntityName.PERCH_TROPHY3 },
    ],
  },
  [FishName.CARP]: {
    rarity: Rarity.COMMON,
    encounter: 70,
    weight: { min: 1, max: 12, skew: 3.0 },
    difficulty: { speed: 0.37, erratic: 2.5, bar: 0.095, drain: 21 },
    trophies: [
      { minWeight: 7, item: EntityName.CARP_TROPHY1 },
      { minWeight: 10, item: EntityName.CARP_TROPHY2 },
      { minWeight: 11.5, item: EntityName.CARP_TROPHY3 },
    ],
  },
  [FishName.PIKE]: {
    rarity: Rarity.RARE,
    encounter: 20,
    weight: { min: 2, max: 18, skew: 3.5 },
    difficulty: { speed: 0.44, erratic: 3.5, bar: 0.095, drain: 25 },
    trophies: [
      { minWeight: 10.8, item: EntityName.PIKE_TROPHY1 },
      { minWeight: 14.8, item: EntityName.PIKE_TROPHY2 },
      { minWeight: 17.2, item: EntityName.PIKE_TROPHY3 },
    ],
  },
  [FishName.CAVEFISH]: {
    rarity: Rarity.RARE,
    encounter: 15,
    weight: { min: 0.3, max: 4, skew: 3.5 },
    difficulty: { speed: 0.4, erratic: 3.0, bar: 0.095, drain: 23 },
    trophies: [
      { minWeight: 2.3, item: EntityName.CAVEFISH_TROPHY1 },
      { minWeight: 3.3, item: EntityName.CAVEFISH_TROPHY2 },
      { minWeight: 3.8, item: EntityName.CAVEFISH_TROPHY3 },
    ],
  },
};
