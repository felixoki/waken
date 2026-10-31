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
  [EntityName.DOWN_BED]: {
    category: BuildCategory.FURNITURE,
    cost: [
      { item: EntityName.WOOD, quantity: 6 },
      { item: EntityName.WOOL, quantity: 4 },
      { item: EntityName.GOOSE_DOWN, quantity: 6 },
      { item: EntityName.DEER_HIDE, quantity: 2 },
    ],
    maps: [MapName.HOME],
  },
  [EntityName.PELT_BED]: {
    category: BuildCategory.FURNITURE,
    cost: [
      { item: EntityName.WOOD, quantity: 6 },
      { item: EntityName.DEER_HIDE, quantity: 3 },
      { item: EntityName.FOX_PELT, quantity: 2 },
      { item: EntityName.WOLF_PELT, quantity: 2 },
      { item: EntityName.BEAR_PELT, quantity: 1 },
    ],
    maps: [MapName.HOME],
  },
  [EntityName.KING_SIZE_BED]: {
    category: BuildCategory.FURNITURE,
    cost: [
      { item: EntityName.WOOD, quantity: 12 },
      { item: EntityName.IRON1, quantity: 6 },
      { item: EntityName.PLUME, quantity: 8 },
      { item: EntityName.WOOL, quantity: 8 },
      { item: EntityName.GOOSE_DOWN, quantity: 12 },
      { item: EntityName.BEAR_PELT, quantity: 3 },
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
