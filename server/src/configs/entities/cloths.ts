import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const cloths: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.VEST]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 5, start: 29, end: 30 },
            { row: 6, start: 29, end: 30 },
          ],
        },
        key: "vest_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Vest",
      description: "A sturdy vest made from tough materials.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 6, col: 28 },
    },
  },
  [EntityName.TUNIC]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 5, start: 26, end: 27 },
            { row: 6, start: 26, end: 27 },
          ],
        },
        key: "tunic_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Tunic",
      description: "A sturdy tunic made from tough materials.",
      stackable: true,
      icon: { spritesheet: "icons8", row: 6, col: 25 },
    },
  },
};
