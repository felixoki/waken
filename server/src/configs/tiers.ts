import { EntityName } from "../types/entities.js";
import { Ingredient } from "../types/crafter.js";

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
      { item: EntityName.GAME_MEAT, quantity: 30 },
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
  {
    tier: 4,
    requirements: [
      { item: EntityName.WOOD, quantity: 150 },
      { item: EntityName.WOOL, quantity: 30 },
      { item: EntityName.IBEX_HORN, quantity: 10 },
    ],
  },
  {
    tier: 5,
    requirements: [
      { item: EntityName.WOOD, quantity: 150 },
      { item: EntityName.IRON1, quantity: 100 },
      { item: EntityName.RAT_CLAWS, quantity: 30 },
    ],
  },
];
