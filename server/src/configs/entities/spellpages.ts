import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  SpellName,
} from "../../types";

const page = (
  spell: SpellName,
  displayName: string,
  description: string,
): EntityDefinition => ({
  facing: Direction.DOWN,
  moving: [],
  components: [
    {
      name: ComponentName.TEXTURE,
      config: {
        spritesheet: "icons4",
        tileSize: 16,
        tiles: [
          { row: 5, start: 2, end: 3 },
          { row: 6, start: 2, end: 3 },
        ],
      },
      key: "spell_page_texture",
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
