import {
  BehaviorName,
  ChoiceId,
  ComponentName,
  DialogueEffectName,
  Direction,
  EntityDefinition,
  EntityName,
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
            text: "What is your role in this village?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I am the village herbalist. I collect herbs and make potions to help the villagers. I specialize in dream herbs, which can help with sleep and dreams. If you find any, please bring them to me.",
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
            text: "What is your role in this village?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I am the village blacksmith. I collect materials and craft items to help the villagers. If you find any, please bring them to me.",
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
            text: "What is your role in this village?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I am the village glassblower. I collect quartz and craft glass items to help the villagers. If you find any, please bring them to me.",
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
          accepts: [EntityName.VENISON_MEAT],
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
      description: "A trader who collects and supplies fresh produce to villagers.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "What is your role in this village?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I am the village greengrocer. I collect venison meat and provide fresh produce to the villagers. If you find any, please bring them to me.",
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
            text: "What is your role in this village?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I am the village baker. I collect wheat and bake bread for the villagers. If you find any, please bring them to me.",
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
      displayName: "Beverage Saler",
      description: "A vendor who mixes and sells refreshing drinks for villagers.",
    },
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "What is your role in this village?",
            next: NodeId.STORY,
          },
        ],
      },
      [NodeId.STORY]: {
        text: "I am the village beverage saler. I collect ingredients and provide drinks for the villagers. If you find any, please bring them to me.",
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
        ref: NodeId.GREETING,
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
