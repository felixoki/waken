import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  EffectName,
  SpellName,
  StateName,
} from "../../types";

export const equipment: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.AMULET1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [{ row: 11, start: 26, end: 27 }, { row: 12, start: 26, end: 27 }],
        },
        key: "amulet_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    bonuses: [
      {
        spell: SpellName.SLASH,
        effects: [[EffectName.BURNING, 4000]],
      },
    ],
    metadata: {
      displayName: "Kro Dai",
      description: "A dark amulet that infuses Slash with burning damage.",
      icon: { spritesheet: "icons2", row: 12, col: 25 },
    },
  },
  [EntityName.HOE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Hoe",
      description: "A worn iron hoe well-suited for breaking up soil.",
      icon: { spritesheet: "icons2", row: 12, col: 10 },
    },
  },
  [EntityName.AXE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Axe",
      description: "A heavy iron axe good for chopping wood.",
      icon: { spritesheet: "icons7", row: 20, col: 1 },
    },
  },
  [EntityName.LANTERN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.LIGHT,
        config: {
          color: 0xffa040,
          radius: 75,
          intensity: 1.5,
        },
      },
      {
        name: ComponentName.FOLLOW,
        config: {
          offsets: {
            [Direction.DOWN]: { x: 6, y: 8 },
            [Direction.UP]: { x: -6, y: -2 },
            [Direction.LEFT]: { x: -8, y: 6 },
            [Direction.RIGHT]: { x: 8, y: 6 },
          },
        },
      },
    ],
    states: [StateName.IDLE],
    behaviors: [],
    metadata: {
      displayName: "Lantern",
      description: "A oil lantern that casts a warm glow in the dark.",
      icon: { spritesheet: "icons6", row: 1, col: 5 },
    },
  },
};
