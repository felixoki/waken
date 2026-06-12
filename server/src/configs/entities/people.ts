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
          ],
          recipes: [
            {
              tier: 1,
              output: EntityName.DROP_OF_THE_BELLAN_TRAIL,
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
              output: EntityName.SUNGOLD_POTION,
              quantity: 1,
              ingredients: [
                { item: EntityName.VIAL, quantity: 1 },
                { item: EntityName.SUNFLOWER, quantity: 3 },
                { item: EntityName.BELLADONNA, quantity: 1 },
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
        text: "Potions, mostly, the dream sort. A drop of the right brew and you'll sleep soft as a cloud, or wake somewhere you've never been. The whole village leans on me when the nights turn restless.",
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
        text: "Gladly. Blue lotus grows where the water sits still, and it loves the moonlight, so search at dusk. Belladonna is a different beast: beautiful, deadly, and it only forgives a careful hand. Bring me a vial and a few sunflowers and I'll show you something golden.",
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
          accepts: [EntityName.WOOD, EntityName.IRON1, EntityName.GLASS],
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
              tier: 1,
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
        text: "I bend iron to my will, that's the short of it. Axes for the woodcutters, hoes for the farmers, a lantern for anyone fool enough to wander after dark. Hard work, honest work.",
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
        text: "Aye. Don't bring me rusted scrap and expect a blade. Good iron and seasoned wood is all I ask. Two lengths of wood and a bar of iron, and you'll walk off with an axe that truly bites.",
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
        text: "I coax glass out of quartz and a breath of fire. Vials for the herbalist, panes for the windows, little trinkets for the children. There's a quiet magic in watching plain sand turn into something you can see clean through.",
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
        text: "The cave veins up the mountain are thick with it, if you don't mind the climb. Four good shards and a little bone ash is all I need to make glass. Bring me iron as well and I'll seal you a proper vial.",
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
          ],
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
        text: "I've got a farm up north, but someone's got to mind the shop. You're welcome to use the plots yourself if you fancy growing something to sell.",
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
        text: "Anything fresh, really. A ripe tomato or a fat carrot will always find a buyer, and a good cut of venison even faster. Grow it, hunt it, or fish it, I'll take it off your hands at a fair price.",
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
        individual: [
          {
            text: "What do you bake?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "Bread, friend. I turn humble grain into something warm enough to make a hard morning bearable. There's no spell quite like the smell of a fresh loaf, I always say.",
        choices: [
          {
            text: "Need anything for it?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "Wheat, and plenty of it. The mill's been far too quiet of late. Bring me grain and I'll see this village never goes to bed hungry. *pats a cloud of flour from her apron*",
        choices: [
          {
            ref: ChoiceId.GOODBYE,
            effects: [{ name: DialogueEffectName.CONVERSATION_END }],
          },
        ],
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
            text: "What do you serve?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I mix the drinks that loosen tongues and soften nightmares. A good cup at dusk and the whole village sleeps a little easier. *takes a long sip from his own cup* ...for quality's sake, you understand.",
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
        text: "*waves a hand* She worries too much, that one. A drink now and then keeps the bad dreams away, nothing more. Bring me something sweet to ferment and I'll mix you a cup that has you dreaming in colour.",
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
        text: "You've got that look about you. The far-off eyes. You're one of them, aren't you? A dream wanderer.",
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
        text: "My grandmother had the same stare. She wandered too deep one night and never quite came back. She was never the same after. They say her mind still drifts somewhere out in the realms.",
        choices: [
          {
            text: "Is she still out there?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "I like to think so. If you ever walk the realms, keep an eye out for her, would you? An old woman who looks like she's forgotten her way home.",
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
            "I slept like a stone last night. No dreams at all. Bliss.",
            "Morning. For once my head feels quiet.",
          ],
          [Mood.HUNGRY]: [
            "*rubbing her arms* I can't sit still today. When my stomach's empty, the dreams get... loud.",
            "Don't mind me pacing. I haven't eaten, and that's always when it comes back.",
          ],
        },
        choices: [
          {
            text: "When what comes back?",
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.STORY]: {
        text: {
          [Mood.HAPPY]:
            "Oh, nothing today. It only finds me when I'm hungry, isn't that strange? A full belly seems to keep it at bay.",
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
        text: "I remember the first time I set foot on a ship, I was feverish with excitement at the crackling atmosphere in the air. In the coming months, I could already picture us sailing to distant shores.",
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
        text: "Some nights I dream in colours that don't have names yet. Then I wake, try to paint them, and they come out... grey.",
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
          "I'd offer you a chair, but the cat has claimed every last one.",
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
            "Full belly, dry roof, no nightmares. That's a good day in my book.",
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
        text: "Shh, listen. *pause* You don't hear it? A lullaby, riding on the wind. My mother used to sing that one. She's three winters gone now.",
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
          "Don't tell the baker, but I'm fairly sure his loaves have been shrinking.",
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
            text: "Have you talked to him?",
            next: NodeId.QUEST,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.QUEST]: {
        text: "I've tried. He just smiles and pours another. Maybe... maybe he'd listen to someone who isn't his daughter. If you're ever passing his stall, would you say something? Gently?",
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
        text: "You ever notice how the village looks different at dusk? Like it's holding its breath.",
        choices: [
          {
            text: "Holding its breath for what?",
            next: NodeId.STORY,
          },
          {
            ref: ChoiceId.GOODBYE,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "For nightfall, of course. That's when the real day begins, for some of us anyway. *winks* Sleep well, wanderer.",
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
