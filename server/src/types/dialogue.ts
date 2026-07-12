import { World } from "../World";

export enum Mood {
  HUNGRY = "HUNGRY",
  COLD = "COLD",
  THIRSTY = "THIRSTY",
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
}

export enum DialogueEffectName {
  CONVERSATION_END = "conversation:end",
  ITEM_GIVE = "item:give",
  COLLECTOR_OPEN = "collector:open",
}

export interface DialogueEffect {
  name: DialogueEffectName;
  params?: Record<string, any>;
}

export interface DialogueNode {
  text: DialogueText;
  choices?: Array<DialogueChoice | DialogueReference>;
  salience?: number;
}

export interface Dialogue {
  [nodeId: string]: DialogueNode | DialogueNode[] | DialogueReference;
}

export interface DialogueContext {
  world: World;
  playerId: string;
  entityId: string;
}

export interface DialogueResponse {
  entityId: string;
  nodeId: string;
  text: DialogueText;
  choices: DialogueChoice[];
}
