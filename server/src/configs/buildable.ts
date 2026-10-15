import { BuildableConfig, BuildCategory, EntityName, MapName } from "../types";

export const buildable: Partial<Record<EntityName, BuildableConfig>> = {
  [EntityName.CHEST1]: {
    category: BuildCategory.FURNITURE,
    cost: [{ item: EntityName.WOOD, quantity: 2 }],
    maps: [MapName.HOME],
  },
  [EntityName.BED]: {
    category: BuildCategory.FURNITURE,
    cost: [
      { item: EntityName.WOOD, quantity: 4 },
      { item: EntityName.DEER_HIDE, quantity: 2 },
    ],
    maps: [MapName.HOME],
  },
  [EntityName.FENCE]: {
    category: BuildCategory.WALL,
    cost: [{ item: EntityName.WOOD, quantity: 1 }],
    maps: [MapName.VILLAGE],
    replaces: [EntityName.REED1, EntityName.REED2, EntityName.REED3],
  },
};
