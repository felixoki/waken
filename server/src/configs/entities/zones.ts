import { ComponentName, Direction, EntityDefinition, EntityName } from "../../types";

export const zones: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ZONE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [{ name: ComponentName.ZONE }],
    states: [],
  },
};
