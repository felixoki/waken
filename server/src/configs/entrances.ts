import { EntityName } from "../types";
import { EntranceDef } from "../types/generation";

export const CAVE_ENTRANCE_DEF: EntranceDef = {
  width: 8,
  height: 7,
  entity: EntityName.CAVE_ENTRANCE,
  count: 3,
  spacing: 20,
};

export const entrances = [CAVE_ENTRANCE_DEF];
