import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  SpellName,
} from "../../types";

const PAGES: SpellName[] = [
  SpellName.SHARD,
  SpellName.SLASH,
  SpellName.ILLUMINATE,
  SpellName.HURT_SHADOWS,
  SpellName.METEOR_SHOWER,
  SpellName.LIGHTNING_STRIKE,
  SpellName.DRAGON_FORM,
  SpellName.REVIVE,
  SpellName.CATCH_SOUL,
  SpellName.GAIN_MOMENTUM,
  SpellName.REFLECT_DAMAGE,
  SpellName.HEAL_PARTY,
  SpellName.SHIELD,
  SpellName.GREASE,
  SpellName.BLINK,
  SpellName.HYPERBEAM,
  SpellName.SUNDER,
  SpellName.WELLSPRING,
  SpellName.DELTA_WAVE,
  SpellName.HYPNIC_JERK,
  SpellName.DARK_WAVE,
];

const FIRST_ROW = 30;
const ACROSS = 8;

const slot = (spell: SpellName): number => PAGES.indexOf(spell);
const col = (spell: SpellName): number => (slot(spell) % ACROSS) * 3 + 1;
const row = (spell: SpellName): number =>
  FIRST_ROW + Math.floor(slot(spell) / ACROSS) * 2 + 2;

const page = (
  spell: SpellName,
  displayName: string,
  description: string,
  art: SpellName = spell,
): EntityDefinition => ({
  facing: Direction.DOWN,
  moving: [],
  components: [
    {
      name: ComponentName.TEXTURE,
      config: {
        spritesheet: "items",
        tileSize: 16,
        tiles: [
          { row: row(art) - 1, start: col(art) + 1, end: col(art) + 2 },
          { row: row(art), start: col(art) + 1, end: col(art) + 2 },
        ],
      },
      key: `spell_page_${spell}_texture`,
    },
    { name: ComponentName.POINTABLE },
    { name: ComponentName.PICKABLE },
    { name: ComponentName.HOVERABLE },
    { name: ComponentName.LEARNABLE, config: { spell } },
  ],
  states: [],
  behaviors: [],
  metadata: {
    displayName,
    description,
    icon: { spritesheet: "items", row: row(art), col: col(art) },
    stackable: false,
    weight: 0.05,
  },
});

export const spellPages: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.SPELL_PAGE_SHARD]: page(
    SpellName.SHARD,
    "Spell page: Shard",
    "A weathered page that unlocks the secrets of shard magic.",
  ),
  [EntityName.SPELL_PAGE_SLASH]: page(
    SpellName.SLASH,
    "Spell page: Slash",
    "A loose page on the art of arcane slashing.",
  ),
  [EntityName.SPELL_PAGE_ILLUMINATE]: page(
    SpellName.ILLUMINATE,
    "Spell page: Illuminate",
    "A glowing page that teaches one how to bend light.",
  ),
  [EntityName.SPELL_PAGE_HURT_SHADOWS]: page(
    SpellName.HURT_SHADOWS,
    "Spell page: Hurt shadows",
    "A dark page dense with shadow-banishing incantations.",
  ),
  [EntityName.SPELL_PAGE_METEOR_SHOWER]: page(
    SpellName.METEOR_SHOWER,
    "Spell page: Meteor shower",
    "An ancient page that teaches how to call fire from the sky.",
  ),
  [EntityName.SPELL_PAGE_LIGHTNING_STRIKE]: page(
    SpellName.LIGHTNING_STRIKE,
    "Spell page: Lightning strike",
    "A charred page that crackles with residual static energy.",
  ),
  [EntityName.SPELL_PAGE_BITE]: page(
    SpellName.BITE,
    "Spell page: Bite",
    "A torn page that smells of wet stone and old teeth.",
    SpellName.DRAGON_FORM,
  ),
  [EntityName.SPELL_PAGE_DRAGON_FORM]: page(
    SpellName.DRAGON_FORM,
    "Spell page: Dragon form",
    "A scorched page pulsing with the will of a greater river dragon.",
  ),
  [EntityName.SPELL_PAGE_REVIVE]: page(
    SpellName.REVIVE,
    "Spell page: Revive",
    "A hallowed page describing how to call a fallen ally back from the brink.",
  ),
  [EntityName.SPELL_PAGE_CATCH_SOUL]: page(
    SpellName.CATCH_SOUL,
    "Spell page: Catch Soul",
    "A gentle page inscribed with rites for soothing a weakened creature's soul.",
  ),
  [EntityName.SPELL_PAGE_GAIN_MOMENTUM]: page(
    SpellName.GAIN_MOMENTUM,
    "Spell page: Gain momentum",
    "A brisk page that teaches how to rally a party into a relentless charge.",
  ),
  [EntityName.SPELL_PAGE_REFLECT_DAMAGE]: page(
    SpellName.REFLECT_DAMAGE,
    "Spell page: Reflect damage",
    "A mirrored page describing a ward that flings harm back at its source.",
  ),
  [EntityName.SPELL_PAGE_HEAL_PARTY]: page(
    SpellName.HEAL_PARTY,
    "Spell page: Heal party",
    "A soothing page woven with dream light that mends wounds over time.",
  ),
  [EntityName.SPELL_PAGE_SHIELD]: page(
    SpellName.SHIELD,
    "Spell page: Shield",
    "A steadfast page detailing a ward that absorbs a burst of damage.",
  ),
  [EntityName.SPELL_PAGE_GREASE]: page(
    SpellName.GREASE,
    "Spell page: Grease",
    "A slick page that teaches how to coat foes in flammable oil.",
  ),
  [EntityName.SPELL_PAGE_BLINK]: page(
    SpellName.BLINK,
    "Spell page: Blink",
    "A flickering page that reveals how to slip a short distance through space.",
  ),
  [EntityName.SPELL_PAGE_HYPERBEAM]: page(
    SpellName.HYPERBEAM,
    "Spell page: Hyperbeam",
    "A searing page crackling with the secret of a channelled beam of force.",
  ),
  [EntityName.SPELL_PAGE_SUNDER]: page(
    SpellName.SUNDER,
    "Spell page: Sunder",
    "A page cracked clean through the middle, humming where the halves meet.",
  ),
  [EntityName.SPELL_PAGE_WELLSPRING]: page(
    SpellName.WELLSPRING,
    "Spell page: Wellspring",
    "A page that never quite dries, the ink rippling when you tilt it.",
  ),
  [EntityName.SPELL_PAGE_DELTA_WAVE]: page(
    SpellName.DELTA_WAVE,
    "Spell page: Delta wave",
    "A page ringed like a pond after a single drop, the ink still spreading.",
  ),
  [EntityName.SPELL_PAGE_HYPNIC_JERK]: page(
    SpellName.HYPNIC_JERK,
    "Spell page: Hypnic jerk",
    "A page that twitches in your hand just as you start to nod off.",
  ),
  [EntityName.SPELL_PAGE_DARK_WAVE]: page(
    SpellName.DARK_WAVE,
    "Spell page: Dark wave",
    "A page so black the ink seems to drink the light around it.",
  ),
};
