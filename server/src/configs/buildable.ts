import { BuildableConfig, BuildCategory, EntityName } from "../types";

export const buildable: Partial<Record<EntityName, BuildableConfig>> = {
  [EntityName.CHEST1]: {
    category: BuildCategory.FURNITURE,
    cost: [{ item: EntityName.WOOD, quantity: 2 }],
  },
};
