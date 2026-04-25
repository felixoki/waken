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
      { item: EntityName.IRON1, quantity: 20 },
      { item: EntityName.WOOD, quantity: 10 },
    ],
  },
  {
    tier: 3,
    requirements: [
      { item: EntityName.IRON1, quantity: 20 },
      { item: EntityName.GLASS, quantity: 10 },
      { item: EntityName.WOOD, quantity: 20 },
    ],
  },
];
