import {
  ComponentName,
  Direction,
  EffectName,
  EntityDefinition,
  EntityName,
} from "../../types";

export const ingredients: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.BELLADONNA]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 2, end: 3 },
            { row: 13, start: 2, end: 3 },
          ],
        },
        key: "belladonna_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 14,
          offsetX: 6,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Belladonna",
      description:
        "A poisonous plant with dark berries and bold purple blossoms.",
      stackable: true,
      icon: { spritesheet: "nature", row: 13, col: 1 },
      weight: 0.02,
    },
  },
  [EntityName.SUNFLOWER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 23, end: 24 },
            { row: 13, start: 23, end: 24 },
            { row: 14, start: 23, end: 24 },
          ],
        },
        key: "sunflower_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 17,
          height: 20,
          offsetX: 7,
          offsetY: 24,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Sunflower",
      description:
        "A tall, golden flower with a broad face that follows the sun.",
      stackable: true,
      icon: { spritesheet: "nature", row: 14, col: 22 },
      weight: 0.05,
    },
  },
  [EntityName.RASPBERRY]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 12, end: 14 },
            { row: 2, start: 12, end: 14 },
            { row: 3, start: 12, end: 14 },
          ],
        },
        key: "raspberry_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 32,
          offsetX: 8,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Raspberry",
      description:
        "A thorny bush bearing clusters of small, bright red berries.",
      stackable: true,
      icon: { spritesheet: "nature", row: 3, col: 11 },
      weight: 0.01,
    },
  },
  [EntityName.STRAWBERRY]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 23, end: 24 },
            { row: 22, start: 23, end: 24 },
          ],
        },
        key: "strawberry_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Strawberry",
      description: "A handful of ripe, sweet strawberries.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 22 },
      weight: 0.01,
    },
  },
  [EntityName.STRAWBERRY_BUSH]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 1, start: 15, end: 17 },
            { row: 2, start: 15, end: 17 },
            { row: 3, start: 15, end: 17 },
          ],
        },
        key: "strawberry_bush_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 32,
          height: 32,
          offsetX: 8,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      { name: ComponentName.BOUNCE },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
        config: { item: EntityName.STRAWBERRY, quantity: 1 },
      },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Strawberry bush",
    },
  },
  [EntityName.DAFFODIL]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 11, end: 11 },
            { row: 13, start: 11, end: 11 },
          ],
        },
        key: "daffodil_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 11,
          height: 10,
          offsetX: 3,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Daffodil",
      description:
        "A bright yellow flower with a cheerful trumpet-shaped centre.",
      stackable: true,
      icon: { spritesheet: "nature", row: 14, col: 15 },
      weight: 0.03,
    },
  },
  [EntityName.BLUE_LOTUS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 5, end: 6 },
            { row: 13, start: 5, end: 6 },
          ],
        },
        key: "blue_lotus_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 11,
          height: 8,
          offsetX: 11,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Blue lotus",
      description:
        "A rare aquatic flower with bold blue petals and a sweet scent.",
      stackable: true,
      icon: { spritesheet: "nature", row: 13, col: 4 },
      weight: 0.04,
    },
  },
  [EntityName.CLARY_SAGE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 8, end: 9 },
            { row: 13, start: 8, end: 9 },
          ],
        },
        key: "clary_sage_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 13,
          height: 11,
          offsetX: 10,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Clary sage",
      description:
        "An aromatic herb with soft leaves and delicate purple blooms.",
      stackable: true,
      icon: { spritesheet: "nature", row: 13, col: 7 },
      weight: 0.02,
    },
  },
  [EntityName.BEARDED_TOOTH_FUNGUS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 7, start: 2, end: 3 },
            { row: 8, start: 2, end: 3 },
          ],
        },
        key: "bearded_tooth_fungus_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 20,
          height: 14,
          offsetX: 5,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Bearded tooth fungus",
      description:
        "A peculiar white fungus adorned with cascading tooth-like spines.",
      stackable: true,
      icon: { spritesheet: "nature", row: 8, col: 1 },
      weight: 0.1,
    },
  },
  [EntityName.HENBANE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 16, end: 18 },
            { row: 13, start: 16, end: 18 },
            { row: 14, start: 16, end: 18 },
          ],
        },
        key: "henbane_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 25,
          height: 21,
          offsetX: 12,
          offsetY: 24,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Henbane",
      description:
        "A poisonous weed with pale yellow flowers and clammy leaves.",
      stackable: true,
      icon: { spritesheet: "nature", row: 14, col: 15 },
      weight: 0.02,
    },
  },
  [EntityName.EDELWEISS]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 13, end: 14 },
            { row: 13, start: 13, end: 14 },
          ],
        },
        key: "edelweiss_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 8,
          offsetY: 16,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Edelweiss",
      description: "A star of pale felted petals that only opens above the snowline.",
      stackable: true,
      icon: { spritesheet: "nature", row: 13, col: 12 },
      weight: 0.02,
    },
  },
  [EntityName.OPIUM_POPPY]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "nature",
          tileSize: 16,
          tiles: [
            { row: 12, start: 20, end: 21 },
            { row: 13, start: 20, end: 21 },
            { row: 14, start: 20, end: 21 },
          ],
        },
        key: "opium_poppy_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 14,
          height: 22,
          offsetX: 9,
          offsetY: 24,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.BOUNCE,
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
      displayName: "Opium poppy",
      description: "A bare stalk hung with swollen pods of milky sap.",
      stackable: true,
      icon: { spritesheet: "nature", row: 14, col: 19 },
      weight: 0.02,
    },
  },
  [EntityName.POTION1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 2, end: 3 },
            { row: 22, start: 2, end: 3 },
          ],
        },
        key: "potion1_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.CONSUMABLE,
        config: { effect: EffectName.REGAIN, duration: 5000, restore: { mana: 60 } },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Drop of the Bellan Trail",
      description:
        "A mysterious potion crafted from rare aquatic flowers and forest herbs.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 19 },
      weight: 0.3,
    },
  },
  [EntityName.POTION2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 5, end: 6 },
            { row: 22, start: 5, end: 6 },
          ],
        },
        key: "potion2_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.CONSUMABLE,
        config: { effect: EffectName.REGAIN, duration: 5000, restore: { health: 60 } },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Sungold potion",
      description:
        "A warm golden potion distilled from sunflowers and belladonna.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 4 },
      weight: 0.3,
    },
  },
  [EntityName.POTION3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 8, end: 9 },
            { row: 22, start: 8, end: 9 },
          ],
        },
        key: "potion3_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.CONSUMABLE,
        config: { effect: EffectName.REGAIN, duration: 5000, restore: { health: 100 } },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Troll blood",
      description:
        "A thick, potent brew rendered from troll scales and deadly herbs.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 7 },
      weight: 0.3,
    },
  },
  [EntityName.POTION4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.CONSUMABLE,
        config: { unlock: 1 },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 11, end: 12 },
            { row: 22, start: 11, end: 12 },
          ],
        },
        key: "potion4_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "The Further",
      description: "A pale draught brewed from henbane and opium poppy.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 10 },
      weight: 0.2,
    },
  },
  [EntityName.POTION5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.CONSUMABLE,
        config: { unlock: 2 },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 14, end: 15 },
            { row: 22, start: 14, end: 15 },
          ],
        },
        key: "potion5_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Rimewake",
      description: "A frost-cold draught brewed in the wake of rime.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 13 },
      weight: 0.2,
    },
  },
  [EntityName.POTION6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.CONSUMABLE,
        config: { unlock: 3 },
      },
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 17, end: 18 },
            { row: 22, start: 17, end: 18 },
          ],
        },
        key: "potion6_texture",
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Giant's Stalk",
      description: "A draught that climbs through the night, rooted in an ancient troll's heart.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 16 },
      weight: 0.2,
    },
  },
  [EntityName.SOUP_OF_THE_HIKER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "items",
          tileSize: 16,
          tiles: [
            { row: 21, start: 20, end: 21 },
            { row: 22, start: 20, end: 21 },
          ],
        },
        key: "soup_of_the_hiker_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
      {
        name: ComponentName.CONSUMABLE,
        config: { effect: EffectName.WARM, duration: 180000 },
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Soup of the hiker",
      description:
        "A thick broth of boar, milk and troll scales that keeps the cold out for a while.",
      stackable: true,
      icon: { spritesheet: "items", row: 22, col: 19 },
      weight: 0.4,
    },
  },
};
