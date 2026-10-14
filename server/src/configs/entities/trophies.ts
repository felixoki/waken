import {
  ComponentName,
  Direction,
  EffectName,
  EntityDefinition,
  EntityName,
  Modifier,
  Rarity,
} from "../../types";

const trophy = (
  key: string,
  index: number,
  displayName: string,
  description: string,
  rarity: Rarity,
  modifier: Modifier,
): EntityDefinition => ({
  facing: Direction.DOWN,
  moving: [],
  components: [
    {
      name: ComponentName.TEXTURE,
      config: {
        spritesheet: "icons14",
        tileSize: 16,
        tiles: [
          { row: 1, start: index * 2 + 1, end: index * 2 + 2 },
          { row: 2, start: index * 2 + 1, end: index * 2 + 2 },
        ],
      },
      key: `${key}_texture`,
    },
    { name: ComponentName.POINTABLE },
    { name: ComponentName.PICKABLE },
    { name: ComponentName.HOVERABLE },
  ],
  states: [],
  behaviors: [],
  modifier,
  metadata: {
    displayName,
    description,
    stackable: false,
    rarity,
    icon: { spritesheet: "icons14", row: 3, col: index + 1 },
    weight: 1.5,
  },
});

export const trophies: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.PERCH_TROPHY]: trophy(
    EntityName.PERCH_TROPHY,
    0,
    "Mounted Perch",
    "A respectable perch, cleaned and mounted on a board.",
    Rarity.COMMON,
    { unique: true, bonus: { health: 15 } },
  ),
  [EntityName.CARP_TROPHY]: trophy(
    EntityName.CARP_TROPHY,
    1,
    "Mounted Carp",
    "A heavy river carp, preserved with some pride.",
    Rarity.COMMON,
    { unique: true, bonus: { health: 25 } },
  ),
  [EntityName.PIKE_TROPHY]: trophy(
    EntityName.PIKE_TROPHY,
    2,
    "Mounted Pike",
    "All teeth and temper, fixed behind glass.",
    Rarity.UNCOMMON,
    { unique: true, bonus: { health: 35 }, multipliers: { damage: 1.05 } },
  ),
  [EntityName.CAVEFISH_TROPHY]: trophy(
    EntityName.CAVEFISH_TROPHY,
    3,
    "Mounted Cavefish",
    "Pale and strange, kept out of the light.",
    Rarity.UNCOMMON,
    { unique: true, bonus: { health: 25 }, resist: { [EffectName.POISONED]: 0.5 } },
  ),
};
