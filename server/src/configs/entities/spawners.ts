import { Direction, EntityDefinition, EntityName } from "../../types";

export const spawners: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.SPAWNER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
  },
  [EntityName.TEXTURE_SPAWNER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
  },
};
