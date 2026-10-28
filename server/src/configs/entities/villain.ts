import { TRANSFORM_RANGE } from "../../globals";
import {
  ComponentName,
  DialogueEffectName,
  Direction,
  EntityDefinition,
  EntityName,
  NodeId,
  SpellName,
  StateName,
} from "../../types";

const KEEPING = "keeping";
const KNOWLEDGE = "knowledge";
const CULT = "cult";
const REMNANTS = "remnants";
const THRESHOLD = "threshold";

export const villain: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.VILLAIN]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 500,
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.SPELL_PAGE_DRAGON_FORM,
              quantity: 1,
              stackable: false,
              chance: 1,
            },
            {
              name: EntityName.VILLAGE_PORTAL,
              quantity: 1,
              stackable: false,
              chance: 1,
            },
          ],
        },
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 64,
          height: 48,
          offsetX: 24,
          offsetY: 20,
          pushable: false,
        },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.CASTING,
      StateName.FLYING,
    ],
    attacks: [
      {
        state: StateName.CASTING,
        spell: SpellName.DRAGON_FORM,
        range: TRANSFORM_RANGE,
      },
    ],
    metadata: { name: "Mir Rof" },
    dialogue: {
      [NodeId.GREETING]: {
        text: "I'm glad you came.",
        choices: [
          {
            text: "Why? You scare everyone we care about. We won't allow it any longer.",
            next: KEEPING,
          },
        ],
      },
      [KEEPING]: {
        text: "*looks past you, at the stones* Others were here long before you and me. With knowledge far beyond ours, and it ended them. *pause* Their secrets are still in this world though, and I am the only one who keeps them. *pause* I tried to protect you from it.",
        choices: [
          {
            text: "Maybe they're not your secrets to keep to begin with. Knowledge is for everyone.",
            next: KNOWLEDGE,
          },
        ],
      },
      [KNOWLEDGE]: {
        text: "Everyone. *almost smiles* Tell me, who holds power in a world of knowledge, other than those who know?",
        choices: [
          { text: "Don't you seek power yourself, through your cult?", next: CULT },
        ],
      },
      [CULT]: {
        text: "My cult? I'm but a memory. The Ed Tar are a mere means to an end. *pause* It's a dangerous path, obedience and faith. There's a true power in belief. But by itself it doesn't grant you the weapons knowing something gives you.",
        choices: [
          {
            text: "And what is it you know, that you think you're protecting us from?",
            next: REMNANTS,
          },
        ],
      },
      [REMNANTS]: {
        text: "*is quiet for a long time* Not all of them are gone. Remnants, if you will, of a different age. I shield this world from them. *pause* You should go now.",
        choices: [
          {
            text: "We are not leaving until you leave our friends alone.",
            next: THRESHOLD,
          },
        ],
      },
      [THRESHOLD]: {
        text: "You have become quite good at wandering the realms, I'll give you that. *pause* But you've not yet crossed the threshold of the possible. *closes his eyes* I have.",
        choices: [
          {
            text: "Fight.",
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.DRAGON]: {
    facing: Direction.DOWN,
    moving: [],
    maxHealth: 500,
    components: [],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.FLYING,
      StateName.CASTING,
    ],
    attacks: [
      { state: StateName.CASTING, spell: SpellName.BITE, range: 200 },
      { state: StateName.CASTING, spell: SpellName.FIRE_BREATH, range: 200 },
      { state: StateName.CASTING, spell: SpellName.METEOR_SHOWER, range: 320 },
    ],
  },
};
