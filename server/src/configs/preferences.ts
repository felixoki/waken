import { EntityName } from "../types";

export const preferences: Partial<Record<EntityName, EntityName>> = {
  [EntityName.GREENGROCER]: EntityName.CARROT,
  [EntityName.BAKER]: EntityName.BREAD,
  [EntityName.FISHWIFE]: EntityName.VENISON_MEAT,
  [EntityName.BEVERAGE_SALER]: EntityName.WINE,
};
