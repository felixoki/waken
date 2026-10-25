import { EntityName, Improvement, ImprovementName } from "../types/index.js";

export const improvements: Record<ImprovementName, Improvement> = {
  [ImprovementName.STORAGE]: {
    tier: 2,
    cost: [
      { item: EntityName.WOOD, quantity: 40 },
      { item: EntityName.QUARTZ1, quantity: 20 },
    ],
    displayName: "Storage",
    description: "The village store holds up to 150 of each good.",
  },
  [ImprovementName.COURIER]: {
    tier: 3,
    cost: [
      { item: EntityName.DEER_HIDE, quantity: 20 },
      { item: EntityName.GAME_MEAT, quantity: 20 },
    ],
    displayName: "Courier",
    description: "Drag goods into the village store from anywhere.",
  },
  [ImprovementName.ORDERS]: {
    tier: 3,
    cost: [
      { item: EntityName.GLASS, quantity: 20 },
      { item: EntityName.IRON1, quantity: 20 },
    ],
    displayName: "Orders",
    description: "Craft any unlocked recipe from anywhere.",
  },
};
