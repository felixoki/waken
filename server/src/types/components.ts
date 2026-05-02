import { EntityName } from "./entities";
import { MapName } from "./maps";
import { CollectorConfig } from "./collectors";
import { LightConfig } from "./ambience";
import { GrowthStageConfig } from "./farming";
import { DamageType } from "./damage.js";
import { EffectName } from "./effects.js";
import { SpellName } from "./spells";

export enum ComponentName {
  ANIMATION = "animation",
  AURA = "aura",
  BEHAVIOR_QUEUE = "behaviorQueue",
  BODY = "body",
  BOUNCE = "bounce",
  COLLECTOR = "collector",
  CONSUMABLE = "consumable",
  DAMAGEABLE = "damageable",
  FARMABLE = "farmable",
  FELLABLE = "fellable",
  GROWABLE = "growable",
  HOTBAR = "hotbar",
  HOVERABLE = "hoverable",
  FOLLOW = "follow",
  INTERACTABLE = "interactable",
  INVENTORY = "inventory",
  LEARNABLE = "learnable",
  GLIMMER = "glimmer",
  LIGHT = "light",
  PICKABLE = "pickable",
  POINTABLE = "pointable",
  STORAGE = "storage",
  TEXTURE = "texture",
  TEXTURE_ANIMATION = "textureAnimation",
  TRANSITION = "transition",
}

export type ComponentConfig =
  | { name: ComponentName.ANIMATION }
  | { name: ComponentName.AURA; config: AuraConfig }
  | { name: ComponentName.BEHAVIOR_QUEUE }
  | { name: ComponentName.BODY; config: BodyConfig }
  | { name: ComponentName.BOUNCE }
  | { name: ComponentName.COLLECTOR; config: CollectorConfig }
  | { name: ComponentName.CONSUMABLE; config: ConsumableConfig }
  | { name: ComponentName.DAMAGEABLE; config?: DamageableConfig }
  | { name: ComponentName.FARMABLE }
  | { name: ComponentName.FELLABLE }
  | { name: ComponentName.GROWABLE; config: GrowableConfig }
  | { name: ComponentName.HOTBAR }
  | { name: ComponentName.HOVERABLE }
  | { name: ComponentName.FOLLOW; config: FollowConfig }
  | { name: ComponentName.INTERACTABLE }
  | { name: ComponentName.INVENTORY }
  | { name: ComponentName.LEARNABLE; config: LearnableConfig }
  | { name: ComponentName.GLIMMER; config: GlimmerConfig }
  | { name: ComponentName.LIGHT; config: LightConfig }
  | { name: ComponentName.PICKABLE }
  | { name: ComponentName.POINTABLE }
  | { name: ComponentName.STORAGE; config: StorageConfig }
  | { name: ComponentName.TEXTURE; config: TextureConfig; key: string }
  | { name: ComponentName.TEXTURE_ANIMATION; config: TextureAnimationConfig }
  | { name: ComponentName.TRANSITION; config: TransitionConfig };

export interface GlimmerConfig {
  radius: number;
  intensity: number;
  color: number;
}

export interface AuraConfig {
  tints: number[];
  radius?: number;
  quantity?: number;
  frequency?: number;
  lifespan?: number;
}

export interface FollowConfig {
  offsets: Partial<Record<string, { x: number; y: number }>>;
}

export interface LearnableConfig {
  spell: SpellName;
}

export interface BodyConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  pushable?: boolean;
  immovable?: boolean;
  collides?: boolean;
  static?: boolean;
}

export interface TextureConfig {
  spritesheet: string;
  tileSize: number;
  tiles: { row: number; start: number; end: number }[];
}

export interface Item {
  name: EntityName;
  quantity: number;
  stackable: boolean;
}

export interface Transition {
  to: MapName;
  x: number;
  y: number;
}

export interface TransitionConfig {
  to: MapName;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface TextureAnimationConfig {
  spritesheet: string;
  tileSize: number;
  offset?: { x: number; y: number };
  tiles: { row: number; start: number; end: number }[];
  frames: number;
  direction: "horizontal" | "vertical";
  frameRate: number;
  repeat: number;
  autoplay?: boolean;
}

export interface DamageableConfig {
  loot: (Item & { chance: number })[];
  resistances?: DamageType[];
  weaknesses?: DamageType[];
}

export interface GrowableConfig {
  spritesheet: string;
  tileSize: number;
  stages: GrowthStageConfig[];
  duration: number;
  yield: Item[];
  regrows?: boolean;
  needsWater?: boolean;
}

export interface ConsumableConfig {
  effect: EffectName;
  restore: { health?: number; mana?: number };
}

export interface StorageConfig {
  slots: number;
}