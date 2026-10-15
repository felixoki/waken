import { BuildableConfig, BuildCategory, EntityName } from "../types";

export const buildable: Partial<Record<EntityName, BuildableConfig>> = {
  [EntityName.CHEST1]: {
    category: BuildCategory.FURNITURE,
    cost: [{ item: EntityName.WOOD, quantity: 2 }],
  },
  [EntityName.BED]: {
    category: BuildCategory.FURNITURE,
    cost: [
      { item: EntityName.WOOD, quantity: 4 },
      { item: EntityName.DEER_HIDE, quantity: 2 },
    ],
  },
};
