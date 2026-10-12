import {
  ComponentName,
  DamageType,
  Direction,
  EntityDefinition,
  EntityName,
  EffectName,
  Rarity,
  SpellName,
  StateName,
  TriggerName,
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
      weight: 0.1,
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
      weight: 0.02,
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
      weight: 2,
    },
  },
  [EntityName.HAMMER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 9, start: 17, end: 18 },
            { row: 10, start: 17, end: 18 },
          ],
        },
        key: "hammer_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Hammer",
      description:
        "A sturdy builder's hammer for raising walls and furnishing rooms.",
      icon: { spritesheet: "icons8", row: 10, col: 16 },
      weight: 1.5,
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
        "A hollow stone that cradles a captured creature's soul.",
      icon: { spritesheet: "icons3", row: 6, col: 25 },
      weight: 0.5,
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
      weight: 1,
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
      weight: 1.8,
    },
  },
  [EntityName.BUCKET]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 7, start: 32, end: 33 },
            { row: 8, start: 32, end: 33 },
          ],
        },
        key: "bucket_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Bucket",
      description: "A tin pail. Hold it to milk tamed goats, sheep and cows.",
      icon: { spritesheet: "icons8", row: 8, col: 31 },
      weight: 1,
    },
  },
  [EntityName.AXE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons7",
          tileSize: 16,
          tiles: [
            { row: 19, start: 2, end: 3 },
            { row: 20, start: 2, end: 3 },
          ],
        },
        key: "axe_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Axe",
      description: "A heavy iron axe good for chopping wood.",
      icon: { spritesheet: "icons7", row: 20, col: 1 },
      weight: 2.5,
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
      weight: 3,
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
      description: "A lantern that casts a warm glow in the dark.",
      icon: { spritesheet: "icons8", row: 8, col: 16 },
      weight: 0.8,
    },
  },
  [EntityName.COMPASS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 7, start: 23, end: 24 },
            { row: 8, start: 23, end: 24 },
          ],
        },
        key: "compass_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Wayward compass",
      description:
        "A compass that will spawn embers to show you the way to the closest point of interest.",
      icon: { spritesheet: "icons8", row: 8, col: 22 },
      rarity: Rarity.RARE,
      weight: 0.4,
    },
  },
  [EntityName.MAP]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons8",
          tileSize: 16,
          tiles: [
            { row: 7, start: 26, end: 27 },
            { row: 8, start: 26, end: 27 },
          ],
        },
        key: "map_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Sleepwanderer's map",
      description:
        "A blank map that fills itself in as you wander a dream. Hold it to read it.",
      icon: { spritesheet: "icons8", row: 8, col: 25 },
      rarity: Rarity.RARE,
      weight: 0.2,
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
      weight: 0.05,
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
      weight: 1,
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
      weight: 0.3,
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
      weight: 0.02,
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
      weight: 0.02,
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
      weight: 0.1,
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
      weight: 0.01,
    },
  },
  [EntityName.JAR_OF_PICKLES]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "pickles",
          tileSize: 16,
          tiles: [
            { row: 1, start: 2, end: 3 },
            { row: 2, start: 2, end: 3 },
          ],
        },
        key: "pickles_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { max: { health: 150 } },
    metadata: {
      displayName: "Jar of pickles",
      description:
        "Sour, salty and oddly fortifying. Just having it on you makes you feel sturdier.",
      icon: { spritesheet: "pickles", row: 2, col: 1 },
      rarity: Rarity.RARE,
      weight: 0.8,
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
      weight: 0.2,
    },
  },
  [EntityName.SILVER_SWORD]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons2",
          tileSize: 16,
          tiles: [
            { row: 3, start: 11, end: 12 },
            { row: 4, start: 11, end: 12 },
          ],
        },
        key: "silver_sword_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { multipliers: { damage: 1.75, defense: 0.5 } },
    bonuses: [{ effects: [[EffectName.SEARING, 4000]] }],
    metadata: {
      displayName: "The Silver Sword of Inrah",
      description:
        "A legendary blade that sharpens every blow, dulls every wound, and sets your spells searing.",
      icon: { spritesheet: "icons2", row: 4, col: 10 },
      rarity: Rarity.LEGENDARY,
      weight: 2.5,
    },
  },
  [EntityName.LUMP_OF_SUGAR]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons4",
          tileSize: 16,
          tiles: [
            { row: 7, start: 14, end: 15 },
            { row: 8, start: 14, end: 15 },
          ],
        },
        key: "lump_of_sugar_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { multipliers: { capture: 2 } },
    metadata: {
      displayName: "Lump of sugar",
      description:
        "A sweet lump that wins a creature over long before it is worn down.",
      icon: { spritesheet: "icons4", row: 8, col: 13 },
      weight: 0.05,
    },
  },
  [EntityName.WOOL_SOCK]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons7",
          tileSize: 16,
          tiles: [
            { row: 3, start: 26, end: 27 },
            { row: 4, start: 26, end: 27 },
          ],
        },
        key: "wool_sock_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    trigger: {
      name: EntityName.WOOL_SOCK,
      on: TriggerName.ROLL,
      damage: { type: DamageType.PHYSICAL, amount: 12 },
      knockback: 20,
      radius: 44,
    },
    metadata: {
      displayName: "Wool sock",
      description:
        "A scratchy sock full of static. Roll past your enemies and it snaps sparks at them.",
      icon: { spritesheet: "icons7", row: 4, col: 25 },
      weight: 0.05,
    },
  },
  [EntityName.NECKLACE1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons11",
          tileSize: 16,
          tiles: [
            { row: 11, start: 2, end: 3 },
            { row: 12, start: 2, end: 3 },
          ],
        },
        key: "necklace1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { kill: { mana: 40 } },
    metadata: {
      displayName: "Ral Vey",
      description:
        "A string of purple pearls that drinks in mana from everything you put to rest.",
      icon: { spritesheet: "icons11", row: 12, col: 1 },
      weight: 0.1,
    },
  },
  [EntityName.TRUMPET_SNAIL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [
            { row: 7, start: 29, end: 30 },
            { row: 8, start: 29, end: 30 },
          ],
        },
        key: "trumpet_snail_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { multipliers: { speed: 0.85, defense: 0.75 } },
    metadata: {
      displayName: "Trumpet snail",
      description:
        "Slow and sturdy. It lends you its pace, and its shell.",
      icon: { spritesheet: "icons1", row: 8, col: 28 },
      weight: 0.1,
    },
  },
  [EntityName.AMULET3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons11",
          tileSize: 16,
          tiles: [
            { row: 9, start: 26, end: 27 },
            { row: 10, start: 26, end: 27 },
          ],
        },
        key: "amulet3_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    trigger: {
      name: EntityName.AMULET3,
      on: TriggerName.BLINK,
      damage: { type: DamageType.PHYSICAL, amount: 40 },
      knockback: 0,
      radius: 90,
      lifesteal: 1,
    },
    metadata: {
      displayName: "Lir Dai",
      description:
        "A hungry amulet. Blink away and it drinks the life of everything you leave behind.",
      icon: { spritesheet: "icons11", row: 10, col: 25 },
      weight: 0.1,
    },
  },
  [EntityName.WINTER_COAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons7",
          tileSize: 16,
          tiles: [
            { row: 1, start: 11, end: 12 },
            { row: 2, start: 11, end: 12 },
          ],
        },
        key: "winter_coat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    modifier: { immunities: [EffectName.COLD] },
    metadata: {
      displayName: "Winter coat",
      description:
        "A thick lined coat. Carry it and the cold cannot get to you.",
      icon: { spritesheet: "icons7", row: 2, col: 10 },
      weight: 2,
    },
  },
};
