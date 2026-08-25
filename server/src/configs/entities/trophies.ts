import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  Icon,
  Rarity,
} from "../../types";

const trophy = (
  displayName: string,
  description: string,
  rarity: Rarity,
  icon: Icon,
): EntityDefinition => ({
  facing: Direction.DOWN,
  moving: [],
  components: [
    { name: ComponentName.POINTABLE },
    { name: ComponentName.HOVERABLE },
  ],
  states: [],
  behaviors: [],
  metadata: {
    displayName,
    description,
    stackable: false,
    rarity,
    icon,
    weight: 1.5,
  },
});

const PERCH_ICON: Icon = { spritesheet: "icons1", row: 2, col: 25 };
const CARP_ICON: Icon = { spritesheet: "icons1", row: 4, col: 13 };
const PIKE_ICON: Icon = { spritesheet: "icons1", row: 4, col: 7 };
const CAVEFISH_ICON: Icon = { spritesheet: "icons1", row: 2, col: 1 };

export const trophies: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.PERCH_TROPHY1]: trophy(
    "Mounted Perch",
    "A respectable perch, cleaned and mounted on a board.",
    Rarity.COMMON,
    PERCH_ICON,
  ),
  [EntityName.PERCH_TROPHY2]: trophy(
    "Silver Perch",
    "A perch large enough that the fishwife raised an eyebrow.",
    Rarity.UNCOMMON,
    PERCH_ICON,
  ),
  [EntityName.PERCH_TROPHY3]: trophy(
    "Perch of the Deep Reeds",
    "The kind of perch the old anglers swore was a story.",
    Rarity.RARE,
    PERCH_ICON,
  ),

  [EntityName.CARP_TROPHY1]: trophy(
    "Mounted Carp",
    "A heavy river carp, preserved with some pride.",
    Rarity.COMMON,
    CARP_ICON,
  ),
  [EntityName.CARP_TROPHY2]: trophy(
    "Silver Carp",
    "A carp that fought hard enough to be worth remembering.",
    Rarity.UNCOMMON,
    CARP_ICON,
  ),
  [EntityName.CARP_TROPHY3]: trophy(
    "Carp of the Still Water",
    "Broad as a shield. The fishwife weighed it twice.",
    Rarity.RARE,
    CARP_ICON,
  ),

  [EntityName.PIKE_TROPHY1]: trophy(
    "Mounted Pike",
    "All teeth and temper, fixed behind glass.",
    Rarity.UNCOMMON,
    PIKE_ICON,
  ),
  [EntityName.PIKE_TROPHY2]: trophy(
    "Silver Pike",
    "A pike that took the line twice before it tired.",
    Rarity.RARE,
    PIKE_ICON,
  ),
  [EntityName.PIKE_TROPHY3]: trophy(
    "Pike of the Black Channel",
    "A monster of a fish. Few have landed its equal.",
    Rarity.LEGENDARY,
    PIKE_ICON,
  ),

  [EntityName.CAVEFISH_TROPHY1]: trophy(
    "Mounted Cavefish",
    "Pale and strange, kept out of the light.",
    Rarity.UNCOMMON,
    CAVEFISH_ICON,
  ),
  [EntityName.CAVEFISH_TROPHY2]: trophy(
    "Silver Cavefish",
    "Grown far past what the sunless pools should allow.",
    Rarity.RARE,
    CAVEFISH_ICON,
  ),
  [EntityName.CAVEFISH_TROPHY3]: trophy(
    "Cavefish of the Sunless Pool",
    "The fishwife had no name for something this size.",
    Rarity.LEGENDARY,
    CAVEFISH_ICON,
  ),
};
