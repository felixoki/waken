import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../types";

export const ingredients: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.FLYAMINATA1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 41, start: 5, end: 6 },
            { row: 42, start: 5, end: 6 },
          ],
        },
        key: "flyaminata1_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 16, offsetX: 8, offsetY: 8, static: true },
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
      displayName: "Fly aminata",
      description: "A small, delicate mushroom with a pale cap.",
      stackable: true,
    },
  },
  [EntityName.BASKETFERN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "village_home",
          tileSize: 16,
          tiles: [
            { row: 55, start: 2, end: 2 },
            { row: 56, start: 2, end: 2 },
          ],
        },
        key: "basketfern_texture",
      },
      {
        name: ComponentName.BODY,
        config: { width: 16, height: 24, offsetX: 0, offsetY: 8, static: true },
      },
      {
        name: ComponentName.POINTABLE,
      },
      {
        name: ComponentName.PICKABLE,
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Basket fern",
      description: "A lush green fern typical for this region.",
      stackable: true,
    },
  },
};
