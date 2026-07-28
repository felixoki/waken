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
  [EntityName.RING1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 1, start: 23, end: 24 },
            { row: 2, start: 23, end: 24 },
          ],
        },
        key: "ring_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    bonuses: [
      {
        spell: SpellName.SHARD,
        effects: [[EffectName.COLD, 4000]],
      },
    ],
    metadata: {
      displayName: "Mir Hul",
      description: "A pale ring that infuses Shard with freezing cold.",
      icon: { spritesheet: "icons2", row: 2, col: 22 },
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
  [EntityName.SOULSTONE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons3",
          tileSize: 16,
          tiles: [
            { row: 5, start: 26, end: 27 },
            { row: 6, start: 26, end: 27 },
          ],
        },
        key: "soulstone_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Soulstone",
      description:
        "A hollow stone that cradles a tamed creature's soul until you solidify it.",
      icon: { spritesheet: "icons3", row: 6, col: 25 },
    },
  },
  [EntityName.FISHING_ROD]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 5, start: 20, end: 21 },
            { row: 6, start: 20, end: 21 },
          ],
        },
        key: "fishing_rod_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
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
    modifier: { multipliers: { crit: 1.5 } },
    metadata: {
      displayName: "Hare Foot",
      description:
        "A small, furry foot from a hare. They say it brings good luck if you carry it.",
      icon: { spritesheet: "icons8", row: 20, col: 25 },
    },
  },
  [EntityName.BOOTS1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 3, start: 5, end: 6 },
            { row: 4, start: 5, end: 6 },
          ],
        },
        key: "boots1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { multipliers: { speed: 1.5 } },
    metadata: {
      displayName: "Boots of the Strider",
      description: "Weathered boots that quicken every step you take.",
      icon: { spritesheet: "icons2", row: 4, col: 4 },
    },
  },
  [EntityName.BELL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons4",
          tileSize: 16,
          tiles: [
            { row: 9, start: 8, end: 9 },
            { row: 10, start: 8, end: 9 },
          ],
        },
        key: "bell_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { multipliers: { defense: 0.5 } },
    metadata: {
      displayName: "Sound the Alarm",
      description: "A brass bell whose ringing steels you against incoming harm.",
      icon: { spritesheet: "icons4", row: 10, col: 7 },
    },
  },
  [EntityName.RING2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 17, start: 23, end: 24 },
            { row: 18, start: 23, end: 24 },
          ],
        },
        key: "ring2_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { multipliers: { damage: 2 } },
    metadata: {
      displayName: "Tei Hul",
      description: "A heavy ring that doubles the force behind every blow.",
      icon: { spritesheet: "icons2", row: 18, col: 22 },
    },
  },
  [EntityName.RING3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 19, start: 23, end: 24 },
            { row: 20, start: 23, end: 24 },
          ],
        },
        key: "ring3_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { regen: { health: 10 } },
    metadata: {
      displayName: "Var Fai",
      description: "A verdant ring that knits your wounds closed over time.",
      icon: { spritesheet: "icons2", row: 20, col: 22 },
    },
  },
  [EntityName.AMULET2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 9, start: 26, end: 27 },
            { row: 10, start: 26, end: 27 },
          ],
        },
        key: "amulet2_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { regen: { mana: 15 } },
    metadata: {
      displayName: "Ral Mir",
      description: "A luminous amulet that steadily replenishes your mana.",
      icon: { spritesheet: "icons2", row: 10, col: 25 },
    },
  },
  [EntityName.FEATHER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 17, start: 8, end: 9 },
            { row: 18, start: 8, end: 9 },
          ],
        },
        key: "feather_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { max: { health: 150 } },
    metadata: {
      displayName: "Taken Under Their Wing",
      description: "A soft feather that bolsters your vitality.",
      icon: { spritesheet: "icons1", row: 18, col: 7 },
    },
  },
  [EntityName.HAT1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 5, start: 23, end: 24 },
            { row: 6, start: 23, end: 24 },
          ],
        },
        key: "hat1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { max: { mana: 200 } },
    metadata: {
      displayName: "Sorcerer's Hat",
      description: "A pointed hat that deepens the well of mana you can hold.",
      icon: { spritesheet: "icons8", row: 6, col: 22 },
    },
  },
};
