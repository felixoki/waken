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
          tiles: [
            { row: 11, start: 26, end: 27 },
            { row: 12, start: 26, end: 27 },
          ],
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
      icon: { spritesheet: "icons8", row: 10, col: 28 },
    },
  },
  [EntityName.FISHING_ROD]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Fishing rod",
      description:
        "A simple wooden rod strung with line. Stand near water and cast.",
      icon: { spritesheet: "icons1", row: 6, col: 19 },
    },
  },
  [EntityName.WATERING_CAN]: {
    facing: Direction.DOWN,
    moving: [],
    components: [],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Watering can",
      description:
        "A tin watering can. Equip it to water young crops as they grow.",
      icon: { spritesheet: "icons6", row: 1, col: 6 },
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
  [EntityName.PICKAXE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 9, start: 14, end: 15 },
            { row: 10, start: 14, end: 15 },
          ],
        },
        key: "pickaxe_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Pickaxe",
      description: "A sturdy iron pickaxe for breaking rock and ore.",
      icon: { spritesheet: "icons8", row: 10, col: 13 },
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
  [EntityName.HARE_FOOT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 19, start: 26, end: 27 },
            { row: 20, start: 26, end: 27 },
          ],
        },
        key: "amulet_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Hare Foot",
      description:
        "A small, furry foot from a hare. They say it brings good luck if you carry it.",
      icon: { spritesheet: "icons8", row: 20, col: 25 },
    },
  },
};
