import {
  BehaviorName,
  ChoiceId,
  ComponentName,
  DialogueEffectName,
  Direction,
  EntityDefinition,
  EntityName,
  Mood,
  NodeId,
  Recipe,
  StateName,
} from "../../types";

export const people: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.HERBALIST]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.COLLECTOR,
        config: {
          accepts: [
            EntityName.SUNFLOWER,
            EntityName.DAFFODIL,
            EntityName.BLUE_LOTUS,
            EntityName.CLARY_SAGE,
            EntityName.BELLADONNA,
            EntityName.VIAL,
            EntityName.BEARDED_TOOTH_FUNGUS,
            EntityName.TROLL_HIDE,
          ],
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
                { item: EntityName.TROLL_HIDE, quantity: 1 },
                { item: EntityName.BELLADONNA, quantity: 1 },
                { item: EntityName.CLARY_SAGE, quantity: 2 },
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
      displayName: "Herbalist",
      description: "A village healer who brews potions from gathered herbs.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "What do you brew here?",
            next: NodeId.STORY,
          },
        ],
      },
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
        name: ComponentName.COLLECTOR,
        config: {
          accepts: [
            EntityName.WOOD,
            EntityName.IRON1,
            EntityName.GLASS,
            EntityName.DEER_HIDE,
            EntityName.FISHING_HOOK,
          ],
          recipes: [
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
              tier: 2,
              output: EntityName.LANTERN,
              quantity: 1,
              ingredients: [
                { item: EntityName.IRON1, quantity: 2 },
                { item: EntityName.GLASS, quantity: 4 },
              ],
            },
            {
              tier: 1,
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
              output: EntityName.WATERING_CAN,
              quantity: 1,
              ingredients: [{ item: EntityName.IRON1, quantity: 2 }],
            },
            {
              tier: 3,
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
      displayName: "Blacksmith",
      description: "A sturdy smith who forges tools and weapons from raw ore.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "What do you make here?",
            next: NodeId.STORY,
          },
        ],
      },
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
  [EntityName.GLASSBLOWER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.COLLECTOR,
        config: {
          accepts: [
            EntityName.WOOD,
            EntityName.QUARTZ1,
            EntityName.BONE,
            EntityName.GLASS,
            EntityName.IRON1,
          ],
          recipes: [
            {
              tier: 1,
              output: EntityName.VIAL,
              quantity: 1,
              ingredients: [
                { item: EntityName.GLASS, quantity: 1 },
                { item: EntityName.IRON1, quantity: 1 },
              ],
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
        name: ComponentName.COLLECTOR,
        config: {
          accepts: [
            EntityName.RASPBERRY,
            EntityName.VENISON_MEAT,
            EntityName.BOAR_MEAT,
            EntityName.CABBAGE,
            EntityName.CARROT,
            EntityName.TOMATO,
            EntityName.PERCH,
            EntityName.CARP,
            EntityName.TROUT,
            EntityName.GOAT_MILK,
          ],
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
      displayName: "Greengrocer",
      description:
        "A trader who collects and supplies fresh produce to villagers.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "Where do you get your goods from?",
            next: NodeId.STORY,
          },
        ],
      },
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
  [EntityName.BAKER]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
      { name: ComponentName.INTERACTABLE },
      {
        name: ComponentName.COLLECTOR,
        config: {
          accepts: [],
          recipes: [],
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
      displayName: "Baker",
      description: "A warm-hearted baker who turns grain into bread for all.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
      },
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
        name: ComponentName.COLLECTOR,
        config: {
          accepts: [],
          recipes: [],
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
      displayName: "Beverage saler",
      description:
        "A vendor who mixes and sells refreshing drinks for villagers.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "Are you drinking all of this on your own?",
            next: NodeId.STORY,
          },
        ],
      },
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
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
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
    dialogue: {
      [NodeId.GREETING]: {
        text: "You've got that look about you. You're one of them, aren't you ... a dream wanderer?",
        choices: [
          {
            text: "How could you tell?",
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },  
        ],
      },
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
        text: "I remember the first time I set foot on a ship, I was feverish with excitement at the crackling atmosphere in the air. In the coming months, I could already picture us sailing to distant shores...",
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
    dialogue: {
      [NodeId.GREETING]: {
        text: "*grumbles annoyed* ...I'm kind of busy here. Can't you see that?",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
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
    dialogue: {
      [NodeId.GREETING]: {
        text: [
          "If you find a left boot out in the woods, it's mine. Long story.",
          "I'd offer you a chair, but ... oh, no reason. I just don't want to.",
        ],
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
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
    dialogue: {
      [NodeId.GREETING]: {
        text: {
          [Mood.HAPPY]:
            "I saw a bear in the woods once. I think I prefer it over a stranger. It didn't see me though, of course.",
          [Mood.HUNGRY]:
            "*stomach growls loudly* ...let's both pretend you didn't hear that.",
        },
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
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
    dialogue: {
      [NodeId.GREETING]: {
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
      [NodeId.STORY]: {
        text: "A wandering fellow swore the village is exactly ten thousand paces wide. I mean to prove him wrong before supper.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
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
    dialogue: {
      [NodeId.GREETING]: {
        text: "Shh, listen. *pause* I practiced all week for this.",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
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
    dialogue: {
      [NodeId.GREETING]: {
        text: "*sighs* How am I going to get another fishing hook...",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
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
    dialogue: {
      [NodeId.GREETING]: {
        text: [
          "I traded my last coin for a 'lucky' pebble. The fellow vanished right after. Suspicious, that.",
          "I once owned a ring that made me feel invincible. But I lost it in the river. *shakes head*",
        ],
        choices: [
          {
            ref: ChoiceId.GOODBYE,
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
    dialogue: {
      [NodeId.GREETING]: {
        text: "You've met my father, the one who runs the drink stall? *lowers her voice* I'm worried about him.",
        choices: [
          {
            text: "What's wrong?",
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
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
    dialogue: {
      [NodeId.GREETING]: {
        text: "You ever notice how the village looks different at dusk? *shivers*.",
        choices: [
          {
            text: "I never thought about it. Why is that?",
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
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
    dialogue: {
      [NodeId.GREETING]: {
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
};
