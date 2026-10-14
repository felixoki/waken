import {
  ComponentName,
  DamageType,
  Direction,
  EffectName,
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
      weight: 1.2,
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
      weight: 0.6,
    },
  },
  [EntityName.ROBE4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 5, start: 11, end: 12 },
            { row: 6, start: 11, end: 12 },
          ],
        },
        key: "robe4_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.ROBE, config: { sheet: "robe4" } },
    ],
    states: [],
    behaviors: [],
    modifier: {
      multipliers: { damage: 1.05 },
      bonus: { health: 20, mana: 20 },
      immunities: [EffectName.COLD],
    },
    metadata: {
      displayName: "Noble garb",
      description: "A warm red robe scattered with yellow stars and moons.",
      stackable: false,
      icon: { spritesheet: "icons6", row: 6, col: 10 },
      weight: 0.6,
    },
  },
  [EntityName.ROBE5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 5, start: 14, end: 15 },
            { row: 6, start: 14, end: 15 },
          ],
        },
        key: "robe5_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.ROBE, config: { sheet: "robe5" } },
    ],
    states: [],
    behaviors: [],
    modifier: {
      multipliers: { damage: 1.15, defense: 0.85 },
      immunities: [EffectName.COLD],
      taken: { [DamageType.BURNING]: 1.1 },
    },
    metadata: {
      displayName: "Bellan's fleece",
      description: "A leather robe under a pelt hood and a ragged mantle, with fleece round the face.",
      stackable: false,
      icon: { spritesheet: "icons6", row: 6, col: 13 },
      weight: 0.6,
    },
  },
  [EntityName.ROBE1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 5, start: 2, end: 3 },
            { row: 6, start: 2, end: 3 },
          ],
        },
        key: "robe1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.ROBE, config: { sheet: "robe1" } },
    ],
    states: [],
    behaviors: [],
    modifier: {
      multipliers: { healthRegen: 1.05 },
      bonus: { health: 25, crit: 0.15 },
      immunities: [EffectName.BURNING],
    },
    metadata: {
      displayName: "It had no name",
      description: "An indigo robe with a pale mask on the back of the hood and a crescent on each side.",
      stackable: false,
      icon: { spritesheet: "icons6", row: 6, col: 1 },
      weight: 0.6,
    },
  },
  [EntityName.ROBE3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 5, start: 8, end: 9 },
            { row: 6, start: 8, end: 9 },
          ],
        },
        key: "robe3_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.ROBE, config: { sheet: "robe3" } },
    ],
    states: [],
    behaviors: [],
    modifier: {
      multipliers: { speed: 1.1, manaRegen: 1.05 },
      immunities: [EffectName.POISONED],
    },
    metadata: {
      displayName: "Moth-eaten",
      description: "A dark robe, frayed at the hem and full of moth holes.",
      stackable: false,
      icon: { spritesheet: "icons6", row: 6, col: 7 },
      weight: 0.6,
    },
  },
  [EntityName.ROBE2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons6",
          tileSize: 16,
          tiles: [
            { row: 5, start: 5, end: 6 },
            { row: 6, start: 5, end: 6 },
          ],
        },
        key: "robe2_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.ROBE, config: { sheet: "robe2" } },
    ],
    states: [],
    behaviors: [],
    modifier: {
      multipliers: { damage: 1.1, speed: 1.05, manaRegen: 1.25 },
      bonus: { mana: 50, reflect: 0.15 },
    },
    metadata: {
      displayName: "Scales and feathers",
      description:
        "A blue-black robe of scales and heron plumes, a few of which glint blue.",
      stackable: false,
      icon: { spritesheet: "icons6", row: 6, col: 4 },
      weight: 0.6,
    },
  },
};
