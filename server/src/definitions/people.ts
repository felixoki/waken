import {
  BehaviorName,
  ChoiceId,
  ComponentName,
  DialogueEffectName,
  Direction,
  EntityDefinition,
  EntityName,
  NodeId,
  StateName,
} from "../types";

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
          accepts: [EntityName.FLYAMINATA1, EntityName.BASKETFERN],
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
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "Are you looking for herbs?",
            effects: [
              {
                name: DialogueEffectName.COLLECTION_START,
              },
            ],
          },
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
          accepts: [EntityName.WOOD, EntityName.IRON_ORE, EntityName.GLASS],
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
    dialogue: {
      [NodeId.GREETING]: {
        ref: NodeId.GREETING,
        individual: [
          {
            text: "Are you looking for materials?",
            effects: [
              {
                name: DialogueEffectName.COLLECTION_START,
              },
            ],
          },
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
};
