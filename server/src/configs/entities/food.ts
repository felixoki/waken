import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const food: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.VENISON_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [{ row: 6, start: 16, end: 16 }],
        },
        key: "venison_meat_texture",
      },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
      },
      {
        name: ComponentName.HOVERABLE,
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Venison meat",
      description: "A cut of fresh venison taken from wild game.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 6, col: 16 },
    },
  },
  [EntityName.BOAR_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [{ row: 6, start: 16, end: 16 }],
        },
        key: "boar_meat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Boar meat",
      description: "A cut of tough meat taken from a wild boar.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 6, col: 16 },
    },
  },
};
