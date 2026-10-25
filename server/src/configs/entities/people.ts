import {
  BehaviorName,
  ChoiceId,
  ComponentName,
  DialogueChoice,
  DialogueEffectName,
  DialogueNode,
  DialogueReference,
  Direction,
  EntityDefinition,
  EntityName,
  FactName,
  Mood,
  NodeId,
  Recipe,
  SoundName,
  StateName,
  StoryEffect,
  StoryEffectName,
  StoryFlag,
  StoryScope,
  VillageState,
  ErrandState,
  Condition,
} from "../../types";
import { BIG_HAND_IN, BOND_FRIEND, MEATS } from "../../globals";

const GLIMBLID = "glimblid";
const LISTEN = "listen";
const GIFT_WOOD = "gift:wood";
const GIFT_BREAD = "gift:bread";
const WINDMILL = "windmill";
const FORGE = "forge";
const ENNA_RELIEF = "enna:relief";
const ASSELME_CASE = "asselme:case";
const AUBREL_IVRO = "aubrel:ivro";
const ERRAND_OFFER = "errand:offer";
const ERRAND_CHECK = "errand:check";
const ERRAND_DROP = "errand:drop";
const ERRAND_DONE = "errand:done";
const TELLIS_GIVE = "tellis:give";
const TELLIS_REFUSE = "tellis:refuse";
const FENN_DOG = "fenn:dog";
const VALEN_DOG = "valen:dog";
const EMY_FRAME = "emy:frame";
const EMY_PEACE = "emy:peace";
const EMY_TELL = "emy:tell";

const opens = (
  villager: EntityName,
  flag: StoryFlag,
  locked: string,
  opening: string,
  open: string,
): DialogueNode[] => [
  {
    text: opening,
    choices: [{ ref: ChoiceId.GOODBYE }],
    salience: 2,
    when: { bond: { [villager]: BOND_FRIEND }, unflags: [flag] },
    story: [{ name: StoryEffectName.FLAG_SET, flag, scope: StoryScope.WORLD }],
  },
  {
    text: open,
    choices: [{ ref: ChoiceId.GOODBYE }],
    salience: 1,
    when: { flags: [flag] },
  },
  { text: locked, choices: [{ ref: ChoiceId.GOODBYE }] },
];

const flagSet = (flag: StoryFlag): StoryEffect => ({
  name: StoryEffectName.FLAG_SET,
  flag,
  scope: StoryScope.PLAYER,
});

const listen = (
  flag: StoryFlag,
  first: string,
  again: string,
): DialogueNode[] => [
  {
    text: first,
    choices: [{ ref: ChoiceId.GOODBYE }],
    salience: 1,
    when: { fresh: [flag] },
    story: [{ name: StoryEffectName.BOND_ADD, amount: 1 }, flagSet(flag)],
  },
  { text: again, choices: [{ ref: ChoiceId.GOODBYE }] },
];

const tip = (
  bond: number,
  flag: StoryFlag,
  text: string,
  page?: EntityName,
): DialogueNode[] => {
  const node: DialogueNode = {
    text,
    choices: [{ ref: ChoiceId.GOODBYE }],
    salience: 2,
    when: { bond: { [EntityName.STUDENT]: bond }, unflags: [flag] },
    story: [flagSet(flag)],
  };

  if (!page) return [node];

  return [
    node,
    { ...node, salience: 3, when: { ...node.when, carrying: [page] } },
  ];
};

const fishwifeChoices: Array<DialogueChoice | DialogueReference> = [
  {
    text: "Weigh my catch",
    effects: [
      {
        name: DialogueEffectName.FISH_WEIGH,
        params: { action: "weigh" },
      },
    ],
  },
  {
    text: "How do my records stand?",
    effects: [
      {
        name: DialogueEffectName.FISH_WEIGH,
        params: { action: "records" },
      },
    ],
  },
  { ref: ChoiceId.GOODBYE },
];

const oddaChoices: Array<DialogueChoice | DialogueReference> = [
  { text: "What do you brew here?", next: NodeId.STORY },
  { ref: ChoiceId.GOODBYE },
];

const emyChoices: Array<DialogueChoice | DialogueReference> = [
  {
    text: "I found this.",
    next: EMY_FRAME,
    when: {
      carrying: [EntityName.OLD_FRAME],
      unflags: [StoryFlag.EMY_FRAME],
    },
  },
  {
    text: "I found her. In the forest.",
    next: EMY_TELL,
    when: {
      flags: [StoryFlag.GRANDMOTHER_SEEN],
      unflags: [StoryFlag.EMY_FRAME, StoryFlag.EMY_TOLD],
    },
  },
  { ref: ChoiceId.GOODBYE },
];

const ilaChoices: Array<DialogueChoice | DialogueReference> = [
  {
    text: "Have you read anything about dream wandering?",
    next: NodeId.STORY,
  },
  { ref: ChoiceId.GOODBYE },
];

const named = (
  early: string,
  late: string,
  choices: Array<DialogueChoice | DialogueReference>,
  salience = 0,
  when: Condition = {},
): DialogueNode[] => [
  {
    text: early,
    choices,
    salience,
    when: { ...when, tier: 2, unflags: [StoryFlag.ED_TAR_KNOWN] },
  },
  {
    text: late,
    choices,
    salience,
    when: { ...when, tier: 2, flags: [StoryFlag.ED_TAR_KNOWN] },
  },
];

const bookkeeperChoices: Array<DialogueChoice | DialogueReference> = [
  {
    text: "Hand over collectables",
    effects: [{ name: DialogueEffectName.ITEM_HAND_OVER }],
  },
  {
    text: "Improve the village",
    effects: [{ name: DialogueEffectName.IMPROVEMENTS_OPEN }],
  },
  { text: "What do you keep in all these books?", next: NodeId.STORY },
  { ref: ChoiceId.GOODBYE },
];

const malieChoices: Array<DialogueChoice | DialogueReference> = [
  { text: "What's wrong?", next: NodeId.STORY },
  { ref: ChoiceId.GOODBYE },
];

const lynhaChoices: Array<DialogueChoice | DialogueReference> = [
  {
    text: "Brought you some wood.",
    next: GIFT_WOOD,
    when: { carrying: [EntityName.WOOD], fresh: [StoryFlag.LYNHA_GIFT] },
  },
  {
    text: "Brought you some bread.",
    next: GIFT_BREAD,
    when: { carrying: [EntityName.BREAD], fresh: [StoryFlag.LYNHA_GIFT] },
  },
  { ref: ChoiceId.GOODBYE },
];

const ASSELME_LINES: [StoryFlag, string][] = [
  [
    StoryFlag.ASSELME_CASE_1,
    "Out west, our friends settle quarrels nobody else will hear. They keep the roads safe and drive the bandits off.",
  ],
  [
    StoryFlag.ASSELME_CASE_2,
    "When the stores run low in a town, someone shares them out. Fairly. That someone is us.",
  ],
  [
    StoryFlag.ASSELME_CASE_3,
    "The wise in the east have rooms full of books. Ask who gets to read them.",
  ],
  [
    StoryFlag.ASSELME_CASE_4,
    "Look at the girl by the herbalist. Brightest head in the village. She should be studying in the city. There's only so much you can learn from books.",
  ],
  [
    StoryFlag.ASSELME_CASE_5,
    "Nobody forbids knowing. They just make sure it costs more than you have.",
  ],
];

const asselmeCase: DialogueNode[] = [
  ...ASSELME_LINES.map(
    ([flag, text], i): DialogueNode => ({
      text,
      choices: [{ ref: ChoiceId.GOODBYE }],
      salience: 1,
      when: {
        flags: ASSELME_LINES.slice(0, i).map(([told]) => told),
        unflags: [flag],
      },
      story: [flagSet(flag)],
    }),
  ),
  {
    text: ASSELME_LINES.map(([, text]) => text),
    choices: [{ ref: ChoiceId.GOODBYE }],
  },
];

const asselmeChoices: Array<DialogueChoice | DialogueReference> = [
  { text: "I never thought about it. Why is that?", next: NodeId.STORY },
  {
    text: "Tell me about your friends",
    next: ASSELME_CASE,
    when: { bond: { [EntityName.CITIZEN12]: BOND_FRIEND } },
  },
  { ref: ChoiceId.GOODBYE },
];

const aubrelChoices: Array<DialogueChoice | DialogueReference> = [
  { text: "Anything about Ivro?", next: AUBREL_IVRO, when: { tier: 2 } },
  {
    text: "Anything for me?",
    next: ERRAND_OFFER,
    when: { errand: ErrandState.NONE },
  },
  {
    text: "About that errand.",
    next: ERRAND_CHECK,
    when: { errand: ErrandState.ACTIVE },
  },
  {
    text: "I've got it.",
    next: ERRAND_DONE,
    when: { errand: ErrandState.READY },
  },
  { ref: ChoiceId.GOODBYE },
];

const aubrelNews = (
  text: string[],
  when: Condition,
): DialogueNode => ({ text, choices: aubrelChoices, when });

export const people: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.HERBALIST]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 1,
              output: EntityName.POTION1,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.BLUE_LOTUS, quantity: 2 },
                { item: EntityName.DAFFODIL, quantity: 2 },
                { item: EntityName.CLARY_SAGE, quantity: 2 },
              ],
            },
            {
              tier: 1,
              output: EntityName.POTION2,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.SUNFLOWER, quantity: 3 },
                { item: EntityName.BELLADONNA, quantity: 1 },
              ],
            },
            {
              tier: 2,
              output: EntityName.POTION3,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.TROLL_SCALES, quantity: 1 },
                { item: EntityName.RAT_CLAWS, quantity: 4 },
                { item: EntityName.BELLADONNA, quantity: 1 },
                { item: EntityName.CLARY_SAGE, quantity: 2 },
              ],
            },
            {
              tier: 2,
              output: EntityName.SMELLING_SALTS,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.BONE, quantity: 2 },
              ],
            },
            {
              tier: 2,
              output: EntityName.SOUP_OF_THE_HIKER,
              quantity: 1,
              ingredients: [
                { item: EntityName.TROLL_SCALES, quantity: 1 },
                { item: EntityName.GAME_MEAT, quantity: 1 },
                { item: EntityName.MILK, quantity: 1 },
              ],
            },
            {
              tier: 1,
              output: EntityName.POTION4,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.HENBANE, quantity: 2 },
                { item: EntityName.OPIUM_POPPY, quantity: 2 },
                { item: EntityName.BALE, quantity: 1 },
              ],
            },
            {
              tier: 2,
              output: EntityName.POTION5,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.ERGOT, quantity: 2 },
                { item: EntityName.RAT_CLAWS, quantity: 2 },
                { item: EntityName.TROLL_SCALES, quantity: 1 },
                { item: EntityName.OPIUM_POPPY, quantity: 2 },
              ],
            },
            {
              tier: 3,
              output: EntityName.POTION6,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.SHADOW_WANDERER, quantity: 1 },
                { item: EntityName.ANCIENT_TROLL_HEART, quantity: 1 },
                { item: EntityName.EDELWEISS, quantity: 1 },
                { item: EntityName.HERON_BEAK, quantity: 1 },
              ],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Odda",
      displayName: "Herbalist",
      description: "A village healer who brews potions from gathered herbs.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: [
            {
              text: "What do you brew here?",
              next: NodeId.STORY,
            },
          ],
        },
        {
          text: "Emy's grandmother. She bought her last bottle here. *pause* I sold it to her. I told her the price, too.",
          choices: oddaChoices,
          salience: 2,
          when: {
            bond: { [EntityName.HERBALIST]: BOND_FRIEND },
            unflags: [StoryFlag.ODDA_CONFESSED],
          },
          story: [flagSet(StoryFlag.ODDA_CONFESSED)],
        },
        {
          text: "*sits down* Then it's over. For her, at least.",
          choices: oddaChoices,
          salience: 4,
          when: {
            flags: [StoryFlag.GRANDMOTHER_FREED, StoryFlag.ODDA_CONFESSED],
            unflags: [StoryFlag.ODDA_RELIEF],
          },
          story: [
            flagSet(StoryFlag.ODDA_RELIEF),
            {
              name: StoryEffectName.FLAG_SET,
              flag: StoryFlag.ODDA_TOLD_EMY,
              scope: StoryScope.WORLD,
            },
          ],
        },
        {
          text: "I told Emy. About the bottle. I owed her that much.",
          choices: oddaChoices,
          salience: 2,
          when: {
            flags: [StoryFlag.ODDA_RELIEF],
            unflags: [StoryFlag.ODDA_LATER],
          },
          story: [flagSet(StoryFlag.ODDA_LATER)],
        },
        {
          text: "Those friends of Asselme's want twenty bottles of the deep stuff. Nobody needs twenty.",
          choices: oddaChoices,
          salience: 3,
          when: { tier: 2, unflags: [StoryFlag.ODDA_ORDERS] },
          story: [flagSet(StoryFlag.ODDA_ORDERS)],
        },
        {
          text: "I sold it to them. The market house needed the coin. *looks away*",
          choices: oddaChoices,
          salience: 2,
          when: {
            flags: [StoryFlag.ODDA_ORDERS],
            facts: { [FactName.VILLAGE]: VillageState.STRAINED },
          },
        },
        {
          text: "I told them I'm out. I'm not out.",
          choices: oddaChoices,
          salience: 1,
          when: { flags: [StoryFlag.ODDA_ORDERS] },
        },
      ],
      [NodeId.STORY]: {
        text: "Potions, mostly. A drop of the right brew and you'll sleep softly, or wake somewhere you've never been.",
        choices: [
          {
            text: "Any tips for a forager?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "Blue lotus grows where the water sits still, and it loves the moonlight, so search at dusk. Belladonna is different: beautiful, deadly, and it only forgives a careful hand.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.BLACKSMITH]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 1,
              output: EntityName.HAMMER,
              quantity: 1,
              ingredients: [{ item: EntityName.WOOD, quantity: 2 }],
            },
            {
              tier: 1,
              output: EntityName.COMPASS,
              quantity: 1,
              ingredients: [
                { item: EntityName.IRON1, quantity: 1 },
                { item: EntityName.GLASS, quantity: 1 },
              ],
            },
            {
              tier: 1,
              output: EntityName.MAP,
              quantity: 1,
              ingredients: [{ item: EntityName.DEER_HIDE, quantity: 1 }],
            },
            {
              tier: 1,
              output: EntityName.AXE,
              quantity: 1,
              ingredients: [
                { item: EntityName.WOOD, quantity: 2 },
                { item: EntityName.IRON1, quantity: 1 },
              ],
            },
            {
              tier: 1,
              output: EntityName.TUNIC,
              quantity: 1,
              ingredients: [{ item: EntityName.DEER_HIDE, quantity: 2 }],
            },
            {
              tier: 2,
              output: EntityName.LANTERN,
              quantity: 1,
              ingredients: [
                { item: EntityName.IRON1, quantity: 2 },
                { item: EntityName.GLASS, quantity: 4 },
                { item: EntityName.CANDLE, quantity: 1 },
              ],
            },
            {
              tier: 2,
              output: EntityName.HOE,
              quantity: 1,
              ingredients: [
                { item: EntityName.WOOD, quantity: 2 },
                { item: EntityName.IRON1, quantity: 1 },
              ],
            },
            {
              tier: 2,
              output: EntityName.PICKAXE,
              quantity: 1,
              ingredients: [
                { item: EntityName.WOOD, quantity: 2 },
                { item: EntityName.IRON1, quantity: 2 },
              ],
            },
            {
              tier: 2,
              output: EntityName.VEST,
              quantity: 1,
              ingredients: [
                { item: EntityName.FOX_PELT, quantity: 1 },
                { item: EntityName.BEAR_PELT, quantity: 1 },
              ],
            },
            {
              tier: 2,
              output: EntityName.WATERING_CAN,
              quantity: 1,
              ingredients: [{ item: EntityName.IRON1, quantity: 2 }],
            },
            {
              tier: 2,
              output: EntityName.BUCKET,
              quantity: 1,
              ingredients: [{ item: EntityName.IRON1, quantity: 2 }],
            },
            {
              tier: 2,
              output: EntityName.FISHING_ROD,
              quantity: 1,
              ingredients: [
                { item: EntityName.WOOD, quantity: 2 },
                { item: EntityName.FISHING_HOOK, quantity: 1 },
              ],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 20,
          offsetY: 20,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Barren",
      displayName: "Blacksmith",
      description: "A sturdy smith who forges tools and weapons from raw ore.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: [
            {
              text: "What do you make here?",
              next: NodeId.STORY,
            },
            { text: "About the forge", next: FORGE },
          ],
        },
        {
          text: "A bucket. *eyes you* Who are you milking?",
          choices: [
            { text: "What do you make here?", next: NodeId.STORY },
            { text: "About the forge", next: FORGE },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: {
            carrying: [EntityName.BUCKET],
            unflags: [StoryFlag.BARREN_BUCKET],
          },
          story: [
            {
              name: StoryEffectName.FLAG_SET,
              flag: StoryFlag.BARREN_BUCKET,
              scope: StoryScope.PLAYER,
            },
          ],
        },
      ],
      [FORGE]: opens(
        EntityName.BLACKSMITH,
        StoryFlag.FORGE_OPEN,
        "Nobody works my forge. Not yet, anyway.",
        "*wipes his hands on his apron* Ore and wood in, iron out by morning. Don't touch my bellows.",
        "Forge is yours too now. Keep it fed.",
      ),
      [NodeId.STORY]: {
        text: "I bend iron, that's the short of it. Axes for the woodcutters, hoes for the farmers, a lantern for anyone fool enough to wander after dark.",
        choices: [
          {
            text: "Any advice for me?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "Don't bring me rusted scrap and expect a blade. Good iron and seasoned wood is all I ask. Two lengths of wood and a bar of iron, and you'll walk off with an axe that truly bites.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.TANNER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 2,
              output: EntityName.BACKPACK,
              quantity: 1,
              ingredients: [
                { item: EntityName.DEER_HIDE, quantity: 6 },
                { item: EntityName.WOOD, quantity: 4 },
              ],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 20,
          offsetY: 20,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Tarro",
      displayName: "Tanner",
      description:
        "The smith's helping hand, curing hides into leather by the forge.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: [
            {
              text: "You work for the smith?",
              next: NodeId.STORY,
            },
          ],
        },
        {
          text: "*stops scraping* That's Bellan. *quietly* I never thought anyone would.",
          choices: [
            { text: "You work for the smith?", next: NodeId.STORY },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: {
            carrying: [EntityName.BELLAN_PELT],
            unflags: [StoryFlag.TARRO_BELLAN],
          },
          story: [
            {
              name: StoryEffectName.FLAG_SET,
              flag: StoryFlag.TARRO_BELLAN,
              scope: StoryScope.PLAYER,
            },
          ],
        },
      ],
      [NodeId.STORY]: {
        text: "I scrape and cure the hides he hasn't the patience for. Leather for grips, straps, bellows, all of it passes through my hands first.",
        choices: [
          {
            text: "Anything you're short of?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "Hides, always hides. Deer if you can manage it, though a fox pelt never goes to waste. Take them to the market house, the bookkeeper keeps the ledger.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.BOOKKEEPER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 54,
          height: 18,
          offsetX: 13,
          offsetY: 24,
          immovable: true,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Alya",
      displayName: "Bookkeeper",
      description:
        "Keeper of the market house ledgers, who knows what every stall owes and is owed.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: [
            {
              text: "Hand over collectables",
              effects: [{ name: DialogueEffectName.ITEM_HAND_OVER }],
            },
            {
              text: "Improve the village",
              effects: [{ name: DialogueEffectName.IMPROVEMENTS_OPEN }],
            },
            {
              text: "What do you keep in all these books?",
              next: NodeId.STORY,
            },
          ],
        },
        {
          text: "The camp boy said there was one of them among us. I wrote it down as gossip. I'll have to correct the ledger.",
          choices: bookkeeperChoices,
          when: { tier: 2 },
        },
      ],
      [NodeId.STORY]: {
        text: "Every sack, jar and barrel that crosses the market. Weights, prices, debts. If it was sold in this village, it is written down here.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.HELPER1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 8,
          offsetX: 15,
          offsetY: 26,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Enna",
      displayName: "Clerk",
      description:
        "One of the bookkeeper's clerks, copying the day's tallies into the ledger.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "Ugh, these numbers don't add up.",
          choices: [{ ref: ChoiceId.GOODBYE }],
        },
        {
          text: "Wait... can that be? How would we even store this much of that?",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 2,
          when: {
            facts: { [FactName.LAST_HAND_IN]: BIG_HAND_IN },
            unflags: [StoryFlag.ENNA_BIG_HAND_IN],
          },
          story: [
            {
              name: StoryEffectName.FLAG_SET,
              flag: StoryFlag.ENNA_BIG_HAND_IN,
              scope: StoryScope.PLAYER,
            },
          ],
        },
        {
          text: "There's flour in the ledger nobody delivered. Bread, too. I've counted three times.",
          choices: [
            {
              text: "It's the visitors. They're handing it out.",
              next: ENNA_RELIEF,
            },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: { facts: { [FactName.VILLAGE]: VillageState.STRAINED } },
        },
      ],
      [ENNA_RELIEF]: {
        text: "*lets out a breath* So it's not me. Don't tell Alya I panicked.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { facts: { [FactName.VILLAGE]: VillageState.STRAINED } },
      },
    },
  },
  [EntityName.HELPER2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 8,
          offsetX: 7,
          offsetY: 26,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      displayName: "Clerk",
      description:
        "One of the bookkeeper's clerks, checking the market's weights and measures.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "Busy day?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "Always. Someone has to check the stallholders' sums, and they are rarely in the village's favour.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.STUDENT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 23,
          offsetY: 22,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Ila",
      displayName: "Student",
      description:
        "A young reader set on the city university, full of questions about books and wandering.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: [
            "I wish I can go to the city one day and attend the university. They have a process to produce a hundred books at once. I wonder how that works.",
            "Ivro says there's one of them in the village already. People laugh at him. I don't.",
          ],
          choices: ilaChoices,
        },
        {
          text: [
            "I wish I can go to the city one day and attend the university. They have a process to produce a hundred books at once. I wonder how that works.",
            "Ivro says there's one of them in the village already. People laugh at him. I don't.",
            "They smile at everyone. They don't smile at me. I take that as a compliment.",
          ],
          choices: ilaChoices,
          salience: 1,
          when: { tier: 2 },
        },
        ...tip(
          2,
          StoryFlag.ILA_TIP_GREASE,
          "Oil doesn't burn by itself. It waits for a spark. So does everything coated in it.",
          EntityName.SPELL_PAGE_GREASE,
        ),
        ...tip(
          3,
          StoryFlag.ILA_TIP_WATER,
          "Lightning looks for the shortest way down. Wet things are shorter.",
          EntityName.SPELL_PAGE_WELLSPRING,
        ),
        ...tip(
          4,
          StoryFlag.ILA_TIP_LIGHT,
          "Shadows are only what's left where the light isn't. Make more light, and there's less of them to hide in.",
          EntityName.SPELL_PAGE_ILLUMINATE,
        ),
        ...tip(
          5,
          StoryFlag.ILA_TIP_CATCH,
          "You can't catch something that still has all its fight. That's true of fish, too.",
          EntityName.SPELL_PAGE_CATCH_SOUL,
        ),
        ...tip(
          6,
          StoryFlag.ILA_TIP_WEAKNESS,
          "Every creature has something it can't stand. Fire, cold. You just have to ask the right question.",
        ),
      ],
      [NodeId.STORY]: {
        text: "They say you can meet other wanderers if you manage to dream of the same location.",
        choices: [
          {
            text: "Do you think it really works?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "I think the hardest part must be remembering what you dreamt of afterwards.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
    },
  },
  [EntityName.GLASSBLOWER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 1,
              output: EntityName.VIAL,
              quantity: 1,
              ingredients: [{ item: EntityName.GLASS, quantity: 1 }],
            },
            {
              tier: 1,
              output: EntityName.GLASS,
              quantity: 1,
              ingredients: [
                { item: EntityName.QUARTZ1, quantity: 4 },
                { item: EntityName.BONE, quantity: 2 },
              ],
            },
            {
              tier: 1,
              output: EntityName.BOTTLE,
              quantity: 1,
              ingredients: [{ item: EntityName.GLASS, quantity: 2 }],
            },
            {
              tier: 1,
              output: EntityName.JAR,
              quantity: 1,
              ingredients: [{ item: EntityName.GLASS, quantity: 2 }],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Lonna",
      displayName: "Glassblower",
      description: "A skilled artisan who crafts glass and vials from quartz.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "What is it you craft?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I coax glass out of quartz. There's a quiet magic in watching plain sand turn into something you can see clean through.",
        choices: [
          {
            text: "Where do I find good quartz?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "You'll find veins in caves surely, but those are rarely uninhabited so tread carefully. Don't forget to bring a pickaxe.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.GREENGROCER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 2,
              output: EntityName.CARROT_SEED,
              quantity: 5,
              ingredients: [{ item: EntityName.CARROT, quantity: 1 }],
            },
            {
              tier: 2,
              output: EntityName.TOMATO_SEED,
              quantity: 5,
              ingredients: [{ item: EntityName.TOMATO, quantity: 1 }],
            },
            {
              tier: 2,
              output: EntityName.CABBAGE_SEED,
              quantity: 5,
              ingredients: [{ item: EntityName.CABBAGE, quantity: 1 }],
            },
            {
              tier: 2,
              output: EntityName.BEAN_SEED,
              quantity: 5,
              ingredients: [{ item: EntityName.BEANS, quantity: 1 }],
            },
            {
              tier: 3,
              output: EntityName.RASPBERRY_JAM,
              quantity: 1,
              ingredients: [
                { item: EntityName.RASPBERRY, quantity: 5 },
                { item: EntityName.JAR, quantity: 1 },
              ],
            },
            {
              tier: 3,
              output: EntityName.STRAWBERRY_JAM,
              quantity: 1,
              ingredients: [
                { item: EntityName.STRAWBERRY, quantity: 5 },
                { item: EntityName.JAR, quantity: 1 },
              ],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Aurin",
      displayName: "Greengrocer",
      description: "A trader who supplies fresh produce to villagers.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: [
            {
              text: "Where do you get your goods from?",
              next: NodeId.STORY,
            },
          ],
        },
        {
          text: "Not a carrot left in the village. And I'm not eating venison, before you ask.",
          choices: [
            { text: "Where do you get your goods from?", next: NodeId.STORY },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: { craving: true },
        },
        {
          text: "Three days now and nobody's asked me for a cut of anything. *smiles to herself*",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: {
            facts: { [FactName.MEATLESS]: 3 },
            unflags: [StoryFlag.AURIN_CHARM, StoryFlag.AURIN_STREAK],
          },
          story: [flagSet(StoryFlag.AURIN_STREAK)],
        },
        {
          text: "A whole week, and not one animal on a plate. *unties a cord from her neck* My grandmother carved this. She said animals can tell who means them no harm. I think they'll tell with you.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 2,
          when: {
            facts: { [FactName.MEATLESS]: 7 },
            bond: { [EntityName.GREENGROCER]: BOND_FRIEND },
            unflags: [StoryFlag.AURIN_CHARM],
          },
          story: [
            {
              name: StoryEffectName.ITEM_GIVE,
              item: EntityName.CARVED_CHARM,
              quantity: 1,
            },
            {
              name: StoryEffectName.FLAG_SET,
              flag: StoryFlag.AURIN_CHARM,
              scope: StoryScope.WORLD,
            },
          ],
        },
        {
          text: "Keep it close. They'll know.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          when: {
            flags: [StoryFlag.AURIN_CHARM],
            carrying: [EntityName.CARVED_CHARM],
          },
        },
      ],
      [NodeId.STORY]: {
        text: "I've got a farm up north, but I haven't been there a lot lately. Someone's got to mind the shop... You're welcome to use the plots yourself if you fancy growing something.",
        choices: [
          {
            text: "What sells best?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "A ripe tomato or a fat carrot will always find a buyer, and a good cut of venison even faster. Grow it, gather it, or hunt it, I'll take it off your hands.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.FISHWIFE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Ebetha",
      displayName: "Fishwife",
      description:
        "Keeper of the scales, who weighs every catch and remembers the best of them.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: {
            [Mood.HUNGRY]: [
              "Anything in the creel? The village is going without.",
              "Fish, please. Folk are getting thin.",
            ],
            [Mood.COLD]: [
              "*blows on her hands* Water's like ice today. Caught much?",
              "Cold work, this. What have you got?",
            ],
            [Mood.THIRSTY]: [
              "Dry as old netting round here. What's in the creel?",
              "*swallows* Nevermind me. Show me your catch.",
            ],
            [Mood.SLEEPLESS]:
              "Up all night. Even the fish looked tired this morning.",
            [Mood.HAPPY]: [
              "The village eats well. Let's see what you've landed.",
              "Ah, the angler! Anything worth weighing?",
              "Small ones feed the village. Big ones get you something.",
            ],
          },
          choices: fishwifeChoices,
        },
        {
          text: "Fish again. I gut them all day, I don't want to eat them too.",
          choices: fishwifeChoices,
          salience: 1,
          when: { craving: true },
        },
      ],
    },
  },
  [EntityName.BAKER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 2,
              output: EntityName.WHEAT_SEED,
              quantity: 5,
              ingredients: [{ item: EntityName.WHEAT, quantity: 1 }],
            },
            {
              tier: 3,
              output: EntityName.BREAD,
              quantity: 1,
              ingredients: [{ item: EntityName.FLOUR, quantity: 3 }],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Aunne",
      displayName: "Baker",
      description: "A warm-hearted baker who turns grain into bread for all.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: [{ text: "About the windmill", next: WINDMILL }],
        },
        {
          text: "The oven's cold. No bread for anyone tonight, me included.",
          choices: [
            { text: "About the windmill", next: WINDMILL },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: { craving: true },
        },
      ],
      [WINDMILL]: opens(
        EntityName.BAKER,
        StoryFlag.WINDMILL_OPEN,
        "The windmill's locked. I keep the key, and I'm particular about who turns it.",
        "You've been good to this village. *takes a key from her apron* The windmill. Grind what you need, and bring me some of the flour.",
        "Mind the hopper lid. It sticks.",
      ),
    },
  },
  [EntityName.WEAVER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 1,
              output: EntityName.ROBE3,
              quantity: 1,
              ingredients: [
                { item: EntityName.DEER_HIDE, quantity: 5 },
                { item: EntityName.RAT_CLAWS, quantity: 10 },
                { item: EntityName.ERGOT, quantity: 4 },
              ],
            },
            {
              tier: 1,
              output: EntityName.ROBE4,
              quantity: 1,
              ingredients: [
                { item: EntityName.FOX_PELT, quantity: 5 },
                { item: EntityName.SUNFLOWER, quantity: 10 },
                { item: EntityName.DAFFODIL, quantity: 4 },
              ],
            },
            {
              tier: 2,
              output: EntityName.ROBE1,
              quantity: 1,
              ingredients: [
                { item: EntityName.BLUE_LOTUS, quantity: 20 },
                { item: EntityName.WOLF_PELT, quantity: 6 },
                { item: EntityName.WANDERERS_CLOTH, quantity: 4 },
              ],
            },
            {
              tier: 3,
              output: EntityName.ROBE2,
              quantity: 1,
              ingredients: [
                { item: EntityName.TROLL_SCALES, quantity: 10 },
                { item: EntityName.CAVEFISH, quantity: 6 },
                { item: EntityName.BEAR_PELT, quantity: 5 },
                { item: EntityName.WANDERERS_GIFT, quantity: 1 },
                { item: EntityName.PLUME, quantity: 4 },
              ],
            },
            {
              tier: 3,
              output: EntityName.ROBE5,
              quantity: 1,
              ingredients: [
                { item: EntityName.BELLAN_PELT, quantity: 1 },
                { item: EntityName.BEAR_PELT, quantity: 4 },
                { item: EntityName.WOOL, quantity: 10 },
                { item: EntityName.AZURITE1, quantity: 5 },
                { item: EntityName.WANDERERS_GIFT, quantity: 1 },
              ],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 20,
          offsetY: 20,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Irelle",
      displayName: "Weaver",
      description: "A quiet weaver who works dreams into cloth.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
        },
        {
          text: "Those visitors' coats. *fingers the cloth you brought* Same weave. Same knots.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 3,
          when: {
            tier: 2,
            stock: { [EntityName.WANDERERS_CLOTH]: 1 },
            unflags: [StoryFlag.IRELLE_WEAVE],
          },
          story: [flagSet(StoryFlag.IRELLE_WEAVE)],
        },
        {
          text: "I've seen that weave somewhere else. In a dream. *pulls her shawl closer*",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 2,
          when: {
            flags: [StoryFlag.IRELLE_WEAVE],
            bond: { [EntityName.WEAVER]: BOND_FRIEND },
          },
        },
        {
          text: "Don't tell them I said anything. Please.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: { flags: [StoryFlag.IRELLE_WEAVE] },
        },
      ],
    },
  },
  [EntityName.BEVERAGE_SALER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.CRAFTER,
        config: {
          recipes: [
            {
              tier: 2,
              output: EntityName.GRAPE_SEED,
              quantity: 5,
              ingredients: [{ item: EntityName.GRAPE, quantity: 1 }],
            },
            {
              tier: 3,
              output: EntityName.WINE,
              quantity: 1,
              ingredients: [
                { item: EntityName.GRAPE, quantity: 5 },
                { item: EntityName.BOTTLE, quantity: 1 },
              ],
            },
            {
              tier: 2,
              output: EntityName.HOPS_SEED,
              quantity: 5,
              ingredients: [{ item: EntityName.HOPS, quantity: 1 }],
            },
            {
              tier: 3,
              output: EntityName.BEER,
              quantity: 1,
              ingredients: [
                { item: EntityName.HOPS, quantity: 5 },
                { item: EntityName.WHEAT, quantity: 3 },
                { item: EntityName.BOTTLE, quantity: 1 },
              ],
            },
          ] satisfies Recipe[],
        },
      },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    metadata: {
      name: "Garleas",
      displayName: "Beverage saler",
      description:
        "A vendor who mixes and sells refreshing drinks for villagers.",
    },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: [
            {
              text: "Are you drinking all of this on your own?",
              next: NodeId.STORY,
            },
          ],
        },
        {
          text: "Slept? I closed my eyes. Different thing.",
          choices: [
            {
              text: "Are you drinking all of this on your own?",
              next: NodeId.STORY,
            },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: { mood: Mood.HAPPY },
        },
        {
          text: "They know the voice. They called it the Daeowol. *quietly* I thought that was a tale for children.",
          choices: [
            {
              text: "Are you drinking all of this on your own?",
              next: NodeId.STORY,
            },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 2,
          when: { leaning: true },
        },
        ...named(
          "Poured one for the Almsfolk. Nice enough. Didn't stay.",
          "Poured one for the Ed Tar. *shrugs* Blood ghosts, the old ones call them. They tip well.",
          [
            {
              text: "Are you drinking all of this on your own?",
              next: NodeId.STORY,
            },
            { ref: ChoiceId.GOODBYE },
          ],
          1,
          { mood: Mood.HAPPY },
        ),
        {
          text: "*looks into his empty cup* Out of wine. That's a first.",
          choices: [
            {
              text: "Are you drinking all of this on your own?",
              next: NodeId.STORY,
            },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 2,
          when: { craving: true },
        },
      ],
      [NodeId.STORY]: {
        text: "*takes a long sip from his cup* ... *quiet burp*",
        choices: [
          {
            text: "Your daughter worries about you.",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "*waves a hand* She worries too much, that one.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
    },
  },
  [EntityName.HOST]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Aubrel" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          ref: NodeId.GREETING,
          individual: aubrelChoices.filter(
            (choice): choice is DialogueChoice => "text" in choice,
          ),
        },
        aubrelNews(
          [
            "Cart came up the coast road yesterday. Salt, nails, and a driver who wouldn't stop talking about the weather.",
            "The ford's up again. Anything heavier than a mule waits on the far side.",
            "Someone in the city printed a hundred copies of the same book. A hundred. Who's going to read them all?",
          ],
          {},
        ),
        aubrelNews(
          [
            "Word is the ford-keeper hasn't slept a full night since spring. Says something stands on the far bank and watches.",
            "Traveller swore three villages east of here have emptied out. Not burned, not robbed. Just nobody there.",
            "They say whole towns out west share their stores now. Fairly, they say. *wipes the cup* Fair to whom.",
          ],
          { tier: 2 },
        ),
        aubrelNews(
          [
            "Man in the corner said a name in his sleep last night. The whole room went quiet. Nobody would tell me what it was.",
            "Heard there's a dreamer in the city who never woke. They keep her in a glass room and write down what she says.",
            "Folk say if you dream the same place three nights running, you've been invited.",
          ],
          { tier: 3 },
        ),
        aubrelNews(
          [
            "Fewer travellers this week. The ones who come pay in bread, not coin.",
          ],
          { facts: { [FactName.VILLAGE]: VillageState.STRAINED } },
        ),
        ...named(
          "The Almsfolk asked for the back room. I told them it's taken. *glances at the closed door* It isn't.",
          "The Ed Tar asked for the back room again. Blood ghosts in my tavern. *wipes the same cup again*",
          aubrelChoices,
        ),
        {
          text: "Took their coin for the back room. Coin's coin. *wipes the same cup again*",
          choices: aubrelChoices,
          salience: 1,
          when: { facts: { [FactName.VILLAGE]: VillageState.STRAINED } },
        },
      ],
      [ERRAND_OFFER]: {
        text: "{for} is after {amount} {item}. Bring them here and I'll see you right.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { errand: ErrandState.NONE },
        story: [{ name: StoryEffectName.ERRAND_START }],
      },
      [ERRAND_CHECK]: {
        text: "{for} still wants {amount} {item}. No rush. *glances at the door*",
        choices: [
          { text: "I can't do it.", next: ERRAND_DROP },
          { ref: ChoiceId.GOODBYE },
        ],
        when: { errand: ErrandState.ACTIVE },
      },
      [ERRAND_DROP]: {
        text: "*shrugs* Someone else will. There's always someone else.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { errand: ErrandState.ACTIVE },
        story: [{ name: StoryEffectName.ERRAND_DROP }],
      },
      [ERRAND_DONE]: {
        text: "*counts them twice* That'll do. Here, {reward}. Don't tell the others.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { errand: ErrandState.READY },
        story: [{ name: StoryEffectName.ERRAND_FINISH }],
      },
      [AUBREL_IVRO]: {
        text: "Ivro was right, then. Don't tell him I said so.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { tier: 2 },
      },
    },
  },
  [EntityName.CITIZEN1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 20, idle: { range: [6000, 12000] } },
      },
    ],
    metadata: { name: "Emy" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "You've got that look about you. You're one of them, aren't you ... a dream wanderer?",
          choices: [
            {
              text: "How could you tell?",
              next: NodeId.STORY,
            },
            ...emyChoices,
          ],
        },
        {
          text: "There are stones in the market house with people in them. *swallows* It makes me sick.",
          choices: emyChoices,
          salience: 1,
          when: {
            stock: { [EntityName.SHADOW_WANDERER]: 1 },
            fresh: [StoryFlag.EMY_SOULS],
          },
          story: [flagSet(StoryFlag.EMY_SOULS)],
        },
        {
          text: "You put them there. Didn't you.",
          choices: emyChoices,
          salience: 2,
          when: {
            stock: { [EntityName.SHADOW_WANDERER]: 1 },
            flags: [StoryFlag.SOULS_CAUGHT],
            fresh: [StoryFlag.EMY_SOULS],
          },
          story: [flagSet(StoryFlag.EMY_SOULS)],
        },
        {
          text: "After all that you've seen I thought you might change.",
          choices: emyChoices,
          salience: 3,
          when: {
            flags: [StoryFlag.GRANDMOTHER_FREED],
            within: { flag: StoryFlag.SOULS_CAUGHT, days: 3 },
            fresh: [StoryFlag.EMY_AFTER],
          },
          story: [flagSet(StoryFlag.EMY_AFTER)],
        },
        {
          text: "Odda told me where Grandmother got her last bottle. *pause* I haven't decided what I think yet.",
          choices: emyChoices,
          salience: 2,
          when: {
            flags: [StoryFlag.ODDA_TOLD_EMY],
            unflags: [StoryFlag.EMY_ODDA],
          },
          story: [flagSet(StoryFlag.EMY_ODDA)],
        },
      ],
      [EMY_FRAME]: {
        text: "*holds the frame for a long time* She kept this by her bed. I thought it was lost. Was she... was she frightened?",
        choices: [{ text: "No. She's at peace now.", next: EMY_PEACE }],
        when: {
          carrying: [EntityName.OLD_FRAME],
          unflags: [StoryFlag.EMY_FRAME],
        },
        story: [
          {
            name: StoryEffectName.ITEM_TAKE,
            item: EntityName.OLD_FRAME,
            quantity: 1,
          },
          {
            name: StoryEffectName.FLAG_SET,
            flag: StoryFlag.EMY_FRAME,
            scope: StoryScope.WORLD,
          },
          { name: StoryEffectName.BOND_ADD, amount: 3 },
        ],
      },
      [EMY_PEACE]: {
        text: "*holds it to her chest* Thank you. I mean it.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { flags: [StoryFlag.EMY_FRAME] },
      },
      [EMY_TELL]: [
        {
          text: "*frowns* I don't know you well enough to tell if that's true.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          story: [flagSet(StoryFlag.EMY_TOLD)],
        },
        {
          text: "You saw her. *nods slowly* I believe you. I don't know why, but I do.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: {
            bond: { [EntityName.CITIZEN1]: 3 },
            unflags: [StoryFlag.SOULS_CAUGHT],
          },
          story: [
            flagSet(StoryFlag.EMY_TOLD),
            { name: StoryEffectName.BOND_ADD, amount: 2 },
          ],
        },
        {
          text: "There's no excuse for what you're doing. And now you make things up. Ugh, go away.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 2,
          when: { flags: [StoryFlag.SOULS_CAUGHT] },
          story: [flagSet(StoryFlag.EMY_TOLD)],
        },
      ],
      [NodeId.STORY]: {
        text: "My grandmother had the same stare. But she wandered too deep one time and never quite came back. Like she was never the same after. They say her mind still drifts somewhere out there.",
        choices: [
          {
            text: "You think she's still wandering the realm?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "I mean, I don't know of course. I like to think so. Keep an eye out for her, would you? Maybe she's just forgotten her way home.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 20, idle: { range: [6000, 12000] } },
      },
    ],
    metadata: { name: "Faire" },
    dialogue: {
      [NodeId.GREETING]: {
        text: {
          [Mood.HAPPY]: [
            "I slept like a stone last night. Bliss.",
            "Morning. For once my head feels quiet.",
          ],
          [Mood.HUNGRY]: [
            "*rubbing her arms* I can't sit still today. I haven't eaten.",
            "Don't mind me pacing. I haven't eaten.",
          ],
          [Mood.COLD]: [
            "*teeth chattering* There's a chill in me no fire seems to reach.",
            "I can't remember the last time I felt warm.",
          ],
          [Mood.THIRSTY]: [
            "My mouth's gone dry as chalk. Is there nothing left to drink in this village?",
            "*swallows hard* I keep dreaming of a cool cup of iced tea.",
          ],
          [Mood.SLEEPLESS]:
            "I didn't dream last night. I didn't sleep long enough to.",
        },
        choices: [
          {
            text: {
              [Mood.HAPPY]: "Long may it last.",
              [Mood.HUNGRY]: "Is it just the hunger, or something more?",
            },
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.STORY]: {
        text: {
          [Mood.HAPPY]: "That would be almost too much to ask for.",
          [Mood.HUNGRY]:
            "There's something lurking in the darkness. Last night a hand reached up through the floor and grabbed for my ankle. I woke with my heart in my throat. *shivers* I really should eat something.",
        },
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN3]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Duneas" },
    dialogue: {
      [NodeId.GREETING]: {
        text: "*breathes in* Ah, nothing better than the sea breeze.",
        choices: [
          {
            text: "Tell me about your adventures.",
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I remember the first time I set foot on a ship, I was feverish with excitement at the crackling atmosphere in the air... In the coming months, I could already picture us sailing to distant shores...",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN4]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Ennor" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "*grumbles annoyed* ...I'm kind of busy here. Can't you see that?",
          choices: [
            { text: "Listen", next: LISTEN },
            {
              ref: ChoiceId.GOODBYE,
            },
          ],
        },
        {
          text: "Sit. Don't talk. This one's new.",
          choices: [
            { text: "Listen", next: LISTEN },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: { bond: { [EntityName.CITIZEN4]: BOND_FRIEND } },
        },
      ],
      [LISTEN]: listen(
        StoryFlag.ENNOR_LISTENED,
        "*plays on without looking up* ... You're still here. Good.",
        "*nods once and keeps playing*",
      ),
    },
  },
  [EntityName.CITIZEN5]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Mevy" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: [
            "If you find a left boot out in the woods, it's mine. Long story.",
            "I'd offer you a chair, but ... oh, no reason. I just don't want to.",
          ],
          choices: [{ ref: ChoiceId.GOODBYE }],
        },
        {
          text: "The dog's gone, I hear. *almost smiles* My cat can come down off the roof.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: { flags: [StoryFlag.FENN_DOG], unflags: [StoryFlag.MEVY_CAT] },
          story: [flagSet(StoryFlag.MEVY_CAT)],
        },
        {
          text: "Wait, did YOU steal my boot?",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: {
            carrying: [EntityName.LEFT_BOOT],
            unflags: [StoryFlag.MEVY_BOOT],
          },
          story: [flagSet(StoryFlag.MEVY_BOOT)],
        },
      ],
    },
  },
  [EntityName.CITIZEN6]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Chronwen" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: {
            [Mood.HAPPY]:
              "I saw a bear in the woods once. I think I prefer it over a stranger. It didn't see me though, of course.",
            [Mood.HUNGRY]:
              "*stomach growls loudly* ...let's both pretend you didn't hear that.",
            [Mood.SLEEPLESS]:
              "Forgive my state. Sleep and I are not on speaking terms.",
          },
          choices: [{ ref: ChoiceId.GOODBYE }],
        },
        {
          text: "Daeowol? Where I come from, that is what you tell children who will not go to bed.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          when: { tier: 2 },
        },
      ],
    },
  },
  [EntityName.CITIZEN7]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 20, idle: { range: [6000, 12000] } },
      },
    ],
    metadata: { name: "Esken" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "I'm counting my steps today. I was up to four thousand and... *frowns* ...you made me lose count.",
          choices: [
            {
              text: "Sorry. Why count steps?",
              next: NodeId.STORY,
            },
            {
              ref: ChoiceId.GOODBYE,
            },
          ],
        },
        {
          text: "Blank? *takes out a stub of chalk* I could fill that in for you. In paces.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: {
            carrying: [EntityName.MAP],
            unflags: [StoryFlag.ESKEN_MAP],
          },
          story: [
            {
              name: StoryEffectName.FLAG_SET,
              flag: StoryFlag.ESKEN_MAP,
              scope: StoryScope.PLAYER,
            },
          ],
        },
      ],
      [NodeId.STORY]: {
        text: "A wandering fellow swore the village is exactly a hundred and thirty-four paces wide. I mean to prove him wrong before supper.",
        choices: [
          {
            text: "It was Glimblid.",
            next: GLIMBLID,
            when: {
              flags: [StoryFlag.GLIMBLID_PACES],
              unflags: [StoryFlag.ESKEN_GLIMBLID],
            },
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [GLIMBLID]: {
        text: "*stops counting* Glimblid? The duck man? *storms off* I'll show him paces.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        story: [
          {
            name: StoryEffectName.FLAG_SET,
            flag: StoryFlag.ESKEN_GLIMBLID,
            scope: StoryScope.PLAYER,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN8]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Ellin" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "Shh, listen. *pause* I practiced all week for this.",
          choices: [
            { text: "Listen", next: LISTEN },
            {
              ref: ChoiceId.GOODBYE,
            },
          ],
        },
        {
          text: "I wrote the middle part for you. Don't tell Ennor.",
          choices: [
            { text: "Listen", next: LISTEN },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: { bond: { [EntityName.CITIZEN8]: BOND_FRIEND } },
        },
      ],
      [LISTEN]: listen(
        StoryFlag.ELLIN_LISTENED,
        "*plays with her eyes closed* ... *smiles* You stayed till the end.",
        "*plays the tune again, a little slower*",
      ),
    },
  },
  [EntityName.CITIZEN9]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Valen" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "*sighs* How am I going to get another fishing hook...",
          choices: [
            {
              ref: ChoiceId.GOODBYE,
            },
          ],
        },
        {
          text: "The dog's gone. He used to follow me to the lake and steal the small ones.",
          choices: [
            {
              text: "He's at the camp, with Fenn.",
              next: VALEN_DOG,
              when: { flags: [StoryFlag.FENN_DOG_SEEN] },
            },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 1,
          when: {
            flags: [StoryFlag.FENN_DOG],
            unflags: [StoryFlag.VALEN_DOG],
          },
        },
      ],
      [VALEN_DOG]: {
        text: "Really? *grins* So he's got someone. Do you think Fenn would let me visit?",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: {
          flags: [StoryFlag.FENN_DOG_SEEN],
          unflags: [StoryFlag.VALEN_DOG],
        },
        story: [flagSet(StoryFlag.VALEN_DOG)],
      },
    },
  },
  [EntityName.CITIZEN10]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Glimblid" },
    dialogue: {
      [NodeId.GREETING]: {
        text: [
          "Ah... the smell of cut grass and stapled wood in the cusp of summer. You must be a city dweller if you're unfamiliar with that.",
          "I once owned a ring that made me feel invincible. But I lost it in the river. *shakes head*",
        ],
        choices: [
          {
            text: "You used to wander?",
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I used to walk the whole coast. Measured this village once, too. A hundred and thirty-four paces, near enough.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        story: [
          {
            name: StoryEffectName.FLAG_SET,
            flag: StoryFlag.GLIMBLID_PACES,
            scope: StoryScope.PLAYER,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN11]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Malie" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "You've met my father, the one who runs the drink stall? *lowers her voice* I'm worried about him.",
          choices: malieChoices,
        },
        ...named(
          "Two of the Open Hand waited by the stall this morning. Not for Father. For me.",
          "The Ed Tar were at the stall again. *swallows* They knew my name.",
          malieChoices,
        ),
        {
          text: "They brought ribbon and honey. I didn't take it. *quietly* They said next time they wouldn't ask.",
          choices: malieChoices,
          salience: 1,
          when: { facts: { [FactName.VILLAGE]: VillageState.STRAINED } },
        },
        {
          text: "I don't sleep at home any more. I stay where there are people.",
          choices: malieChoices,
          salience: 2,
          when: { facts: { [FactName.VILLAGE]: VillageState.SPLIT } },
        },
        {
          text: "They think I hear what he hears. That it runs in the family. *hugs herself* I don't even dream. Don't let them take me.",
          choices: malieChoices,
          salience: 1,
          when: { tier: 2, bond: { [EntityName.CITIZEN11]: BOND_FRIEND } },
        },
      ],
      [NodeId.STORY]: {
        text: "He tastes more than he sells these days. Says the dreams go down easier when the world's a little blurry. But every morning he looks a year older. *sighs* I just want my old papa back.",
        choices: [
          {
            text: "Have you talked to him yet?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "I've tried. He just smiles and pours another. Maybe... maybe he'd listen to someone who isn't his daughter. Would you say something? Gently?",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN12]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 20, idle: { range: [6000, 12000] } },
      },
    ],
    metadata: { name: "Asselme" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "You ever notice how the village looks different at dusk?",
          choices: asselmeChoices,
        },
        {
          text: "These are friends of mine. They brought bread. That's all, for now.",
          choices: asselmeChoices,
          when: { tier: 2 },
        },
        {
          text: "The camp boy? He watches me. *smiles* He's not wrong to.",
          choices: asselmeChoices,
          when: { tier: 2 },
        },
      ],
      [ASSELME_CASE]: asselmeCase,
      [NodeId.STORY]: {
        text: "It's the nightfall. That's when the real day begins, for some of us anyway. *winks* Sleep well, wanderer.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN13]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 20, idle: { range: [6000, 12000] } },
      },
    ],
    metadata: { name: "Tellis" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "I'm looking for a rare silver sword. It's hidden somewhere deep in the forest. But they say there are wolves lurking in the woods, so I'm unsure if it's worth the risk.",
          choices: [
            {
              text: "Maybe I can find it for you.",
              next: NodeId.QUEST,
            },
            {
              ref: ChoiceId.GOODBYE,
            },
          ],
        },
        {
          text: "*stares* Is that... the Silver Sword of Inrah?",
          choices: [
            { text: "It's yours.", next: TELLIS_GIVE },
            { text: "I'm keeping it.", next: TELLIS_REFUSE },
          ],
          salience: 2,
          when: {
            carrying: [EntityName.SILVER_SWORD],
            unflags: [StoryFlag.TELLIS_GIVEN, StoryFlag.TELLIS_REFUSED],
          },
        },
        {
          text: "*turns his back on you*",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 3,
          when: { within: { flag: StoryFlag.TELLIS_REFUSED, days: 7 } },
        },
        {
          text: ["Hm. You again.", "Still carrying it, I see."],
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: { flags: [StoryFlag.TELLIS_REFUSED] },
        },
        {
          text: "I polish it every morning. Every single morning.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: { flags: [StoryFlag.TELLIS_GIVEN] },
        },
      ],
      [TELLIS_GIVE]: {
        text: "*takes it with both hands* I'll not forget this. Here, take this. Don't laugh. Wear it to bed and you'll sleep deeper than you ever have.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: {
          carrying: [EntityName.SILVER_SWORD],
          unflags: [StoryFlag.TELLIS_GIVEN, StoryFlag.TELLIS_REFUSED],
        },
        story: [
          {
            name: StoryEffectName.ITEM_TAKE,
            item: EntityName.SILVER_SWORD,
            quantity: 1,
          },
          {
            name: StoryEffectName.ITEM_GIVE,
            item: EntityName.NIGHTCAP,
            quantity: 1,
          },
          { name: StoryEffectName.BOND_ADD, amount: 3 },
          flagSet(StoryFlag.TELLIS_GIVEN),
        ],
      },
      [TELLIS_REFUSE]: {
        text: "*his jaw tightens* Then we have nothing to talk about.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: {
          unflags: [StoryFlag.TELLIS_GIVEN, StoryFlag.TELLIS_REFUSED],
        },
        story: [
          flagSet(StoryFlag.TELLIS_REFUSED),
          { name: StoryEffectName.BOND_CAP, max: BOND_FRIEND - 1 },
        ],
      },
      [NodeId.QUEST]: {
        text: "Hmm, I don't know if you're up for the task.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
    },
  },
  [EntityName.CITIZEN14]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Ivro" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "I can't stand the village life. All the rules and regulations. And I don't trust anyone there. I'm sure there are cultists among them.",
          choices: [{ ref: ChoiceId.GOODBYE }],
        },
        {
          text: "Now you listen.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 2,
          when: { tier: 2, unflags: [StoryFlag.IVRO_TOLD] },
          story: [flagSet(StoryFlag.IVRO_TOLD)],
        },
        {
          text: "Told you. Nobody listens to the camp.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          when: { tier: 2, flags: [StoryFlag.IVRO_TOLD] },
        },
      ],
    },
  },
  [EntityName.CITIZEN15]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 20,
          offsetY: 20,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Fenn" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: [
            "I ran from wolves once, barely escaped. Then I hid in a bush all day. I remember it was almost winter. I watched as the thin layer of snow from the previous evening melted in the day's warmth, before slowly reforming during the snowfall at nightfall.",
            "Had a dog, once. He ran the same day I did. I like to think he found somewhere warmer.",
          ],
          choices: [{ ref: ChoiceId.GOODBYE }],
        },
        {
          text: "*stares past you* Brin? *the dog sniffs the air, then sits by your feet* He's yours now, it seems. Can't blame him.",
          choices: [
            {
              text: "Give him something to stay for.",
              next: FENN_DOG,
              when: { carryingAny: MEATS },
            },
            { ref: ChoiceId.GOODBYE },
          ],
          salience: 2,
          when: {
            followed: [EntityName.DOG],
            unflags: [StoryFlag.FENN_DOG],
          },
        },
        {
          text: [
            "He sleeps across the tent door. Nothing gets in without him knowing.",
            "*scratches the dog's ears* He remembers me. Took him a while, but he does.",
          ],
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: { flags: [StoryFlag.FENN_DOG] },
          story: [flagSet(StoryFlag.FENN_DOG_SEEN)],
        },
      ],
      [FENN_DOG]: {
        text: "*the dog eats from his hand* There. You stay now. *quietly* I didn't think I'd see him again.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: {
          followed: [EntityName.DOG],
          carryingAny: MEATS,
          unflags: [StoryFlag.FENN_DOG],
        },
        story: [
          { name: StoryEffectName.ITEM_TAKE_ANY, items: MEATS },
          { name: StoryEffectName.ANIMAL_SETTLE, animal: EntityName.DOG },
          flagSet(StoryFlag.FENN_DOG_SEEN),
          {
            name: StoryEffectName.FLAG_SET,
            flag: StoryFlag.FENN_DOG,
            scope: StoryScope.WORLD,
          },
          { name: StoryEffectName.BOND_ADD, amount: 2 },
        ],
      },
    },
  },
  [EntityName.CITIZEN16]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [
      {
        name: BehaviorName.STAY,
      },
    ],
    metadata: { name: "Lynha" },
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "The rainy nights are tough, I won't lie. I hope we have enough firewood.",
          choices: lynhaChoices,
        },
        {
          text: "Ila talks about you. A lot. *looks away*",
          choices: lynhaChoices,
          salience: 1,
          when: { bond: { [EntityName.STUDENT]: BOND_FRIEND } },
        },
        {
          text: "If it rains tonight, there's room by the fire. Just so you know.",
          choices: lynhaChoices,
          salience: 2,
          when: { bond: { [EntityName.CITIZEN16]: BOND_FRIEND } },
        },
      ],
      [GIFT_WOOD]: {
        text: "*stacks it by the tent* That's tonight sorted. Thank you.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { carrying: [EntityName.WOOD], fresh: [StoryFlag.LYNHA_GIFT] },
        story: [
          {
            name: StoryEffectName.ITEM_TAKE,
            item: EntityName.WOOD,
            quantity: 5,
          },
          { name: StoryEffectName.BOND_ADD, amount: 2 },
          flagSet(StoryFlag.LYNHA_GIFT),
        ],
      },
      [GIFT_BREAD]: {
        text: "Still warm. *breaks it in half* You'll have some too.",
        choices: [{ ref: ChoiceId.GOODBYE }],
        when: { carrying: [EntityName.BREAD], fresh: [StoryFlag.LYNHA_GIFT] },
        story: [
          {
            name: StoryEffectName.ITEM_TAKE,
            item: EntityName.BREAD,
            quantity: 1,
          },
          { name: StoryEffectName.BOND_ADD, amount: 2 },
          flagSet(StoryFlag.LYNHA_GIFT),
        ],
      },
    },
  },
  [EntityName.VISITOR1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE],
    behaviors: [{ name: BehaviorName.STAY }],
    dialogue: {
      [NodeId.GREETING]: {
        text: [
          "Bread? There's plenty. Take some for the camp.",
          "We don't ask for anything. Not yet, and not much.",
        ],
        choices: [{ ref: ChoiceId.GOODBYE }],
      },
    },
    metadata: {
      displayName: "Visitor",
      description: "A friendly stranger in a long robe, here with bread.",
    },
  },
  [EntityName.VISITOR2]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.BODY,
        config: {
          width: 8,
          height: 12,
          offsetX: 12,
          offsetY: 12,
          pushable: false,
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
    ],
    states: [StateName.IDLE, StateName.WALKING],
    behaviors: [
      {
        name: BehaviorName.AMBLE,
        config: { radius: 24, idle: { range: [6000, 12000] } },
      },
    ],
    dialogue: {
      [NodeId.GREETING]: [
        {
          text: "Lovely village. Hard to keep it all fed, isn't it?",
          choices: [{ ref: ChoiceId.GOODBYE }],
        },
        {
          text: "We've been helping where we can. Someone has to.",
          choices: [{ ref: ChoiceId.GOODBYE }],
          salience: 1,
          when: { facts: { [FactName.VILLAGE]: VillageState.STRAINED } },
        },
      ],
    },
    metadata: {
      displayName: "Visitor",
      description: "A friendly stranger who walks the camp road.",
    },
  },
  [EntityName.PEOPLE]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.AMBIENT_SOUND,
        config: {
          name: SoundName.PEOPLE,
          loop: true,
        },
      },
    ],
    states: [StateName.IDLE],
  },
};
