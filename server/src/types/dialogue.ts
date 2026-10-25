import { World } from "../World";
import { Condition, StoryEffect } from "./story";

export enum Mood {
  HUNGRY = "HUNGRY",
  COLD = "COLD",
  THIRSTY = "THIRSTY",
  SLEEPLESS = "SLEEPLESS",
  HAPPY = "HAPPY",
}

export enum NodeId {
  GREETING = "greeting",
  STORY = "story",
  QUEST = "quest",
}

export enum ChoiceId {
  GOODBYE = "goodbye",
}

export type DialogueText =
  | string
  | string[]
  | Partial<Record<Mood, string | string[]>>;

export interface DialogueReference {
  ref: NodeId | ChoiceId;
  individual?: DialogueChoice[];
}

export interface DialogueChoice {
  text: DialogueText;
  next?: string;
  effects?: DialogueEffect[];
  when?: Condition;
}

export enum DialogueEffectName {
  CONVERSATION_END = "conversation:end",
  ITEM_HAND_OVER = "item:handover",
  CRAFTER_OPEN = "crafter:open",
  IMPROVEMENTS_OPEN = "improvements:open",
  FISH_WEIGH = "fish:weigh",
}

export interface DialogueEffect {
  name: DialogueEffectName;
  params?: Record<string, any>;
}

export interface DialogueNode {
  text: DialogueText;
  choices?: Array<DialogueChoice | DialogueReference>;
  salience?: number;
  when?: Condition;
  story?: StoryEffect[];
}

export interface Dialogue {
  [nodeId: string]:
    | DialogueNode
    | Array<DialogueNode | DialogueReference>
    | DialogueReference;
}

export interface DialogueContext {
  world: World;
  playerId: string;
  entityId: string;
}

export interface DialogueResponse {
  entityId: string;
  nodeId: string;
  speaker?: string;
  text: DialogueText;
  choices: DialogueChoice[];
}
