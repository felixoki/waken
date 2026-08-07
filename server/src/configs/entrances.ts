import { EntityName } from "../types";
import { EntranceDef } from "../types/generation";

export const DUNGEON_ENTRANCE_DEF: EntranceDef = {
  width: 8,
  height: 7,
  entity: EntityName.DUNGEON_ENTRANCE,
  guards: EntityName.ORC1,
  count: 1,
  spacing: 20,
};

export const CAVE_ENTRANCE_DEF: EntranceDef = {
  width: 8,
  height: 7,
  entity: EntityName.CAVE_ENTRANCE,
  count: 3,
  spacing: 20,
};

export const entrances = [DUNGEON_ENTRANCE_DEF, CAVE_ENTRANCE_DEF];
