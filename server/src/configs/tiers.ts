import { EntityName } from "../types/entities.js";
import { Ingredient } from "../types/collectors.js";

export interface TierUpgrade {
  tier: number;
  requirements: Ingredient[];
}

export const tiers: TierUpgrade[] = [
  {
    tier: 2,
    requirements: [
      { item: EntityName.WOOD, quantity: 50 },
      { item: EntityName.QUARTZ1, quantity: 30 },
      { item: EntityName.VENISON_MEAT, quantity: 30 },
    ],
  },
  {
    tier: 3,
    requirements: [
      { item: EntityName.WOOD, quantity: 100 },
      { item: EntityName.IRON1, quantity: 50 },
      { item: EntityName.GLASS, quantity: 50 },
    ],
  },
];
