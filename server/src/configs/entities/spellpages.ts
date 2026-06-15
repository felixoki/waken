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
  [EntityName.SPELL_PAGE_BUTTERFLY_EFFIGY]: page(
    SpellName.BUTTERFLY_EFFIGY,
    "Spell page: Butterfly effigy",
    "A delicate page containing the rites of the butterfly.",
  ),
  [EntityName.SPELL_PAGE_LIGHTNING_STRIKE]: page(
    SpellName.LIGHTNING_STRIKE,
    "Spell page: Lightning strike",
    "A charred page that crackles with residual static energy.",
  ),
  [EntityName.SPELL_PAGE_ABSORB_LIFE]: page(
    SpellName.ABSORB_LIFE,
    "Spell page: Absorb life",
    "A page steeped in dark matter that teaches one to drain the life of others.",
  ),
};
