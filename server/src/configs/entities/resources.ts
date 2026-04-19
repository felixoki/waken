import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const resources: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.QUARTZ1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "crystals",
          tileSize: 16,
          tiles: [{ row: 8, start: 18, end: 18 }],
        },
        key: "quartz1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Quartz",
      description: "A small, delicate crystal with a pale glow.",
      stackable: true,
      icon: { spritesheet: "icons2", row: 14, col: 19 },
    },
  },
  [EntityName.WOOD]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 1, start: 29, end: 30 },
            { row: 2, start: 29, end: 30 },
          ],
        },
        key: "wood_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wood",
      description: "A piece of chopped wood.",
      stackable: true,
      icon: { spritesheet: "icons3", row: 2, col: 28 },
    },
  },
};
