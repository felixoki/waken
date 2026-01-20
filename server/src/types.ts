/**
 * Players
 */
export interface PlayerConfig {
  id: string;
  socketId: string;
  map: MapName;
  x: number;
  y: number;
  health: number;
  isHost: boolean;
}

/**
 * Entities
 */
export interface EntityConfig {
  id: string;
  map: MapName;
  x: number;
  y: number;
  name: EntityName;
  health: number;
}

export interface EntityDefinition {
  direction: Direction;
  directions: Direction[];
  components: ComponentConfig[];
  states: StateName[];
  behaviors?: BehaviorName[];
  metadata?: EntityMetadata;
}

export interface EntityMetadata {
  displayName?: string;
  description?: string;
  icon?: string;
  stackable?: boolean;
}

export enum EntityName {
  PLAYER = "player",
  ORC1 = "orc1",
  HOUSE1 = "house1",
  HOUSE2 = "house2",
  HERBALIST = "herbalist",
  WINDMILL = "windmill",
  TREE1 = "tree1",
  APPLETREE2 = "appletree2",
  ROCK2 = "rock2",
  FLYAMINATA1 = "flyaminata1",
  BASKETFERN = "basketfern",
}

export interface EntityPickup {
  id: string;
}

export interface EntityDestroy {
  id: string;
}

/**
 * Vendors
 */
export interface VendorConfig {
  accepts: EntityName[];
}

/**
 * Damage
 */
export interface Hit {
  config: SpellConfig;
  attackerId: string;
  targetId: string;
}

export interface Hurt {
  id: string;
  health: number;
  knockback: { x: number; y: number };
}

/**
 * Maps
 */
export enum MapName {
  VILLAGE = "village",
  HERBALIST = "herbalist",
}

export interface MapConfig {
  id: MapName;
  json: string;
  spritesheets: Spritesheet[];
}

export interface Spritesheet {
  key: string;
  file: string;
  frameWidth?: number;
  frameHeight?: number;
  asTileset?: boolean;
}

/**
 * Input
 */
export interface Input {
  id: string;
  x: number;
  y: number;
  direction: Direction | null | undefined;
  directions: Direction[];
  isRunning: boolean;
  isJumping: boolean;
  target?: { x: number; y: number };
  state: StateName;
  equipped: HotbarSlot | null | undefined;
}

/**
 * Hotbar
 */
export enum HotbarSlotType {
  SPELL = "spell",
  ENTITY = "entity",
}

export interface HotbarSlot {
  type: HotbarSlotType;
  name: SpellName | EntityName;
}

export enum HotbarDirection {
  PREV = "prev",
  NEXT = "next",
}
/**
 * Behaviors
 */
export enum BehaviorName {
  PATROL = "patrol",
}

export interface BehaviorInput {
  targetX: number;
  targetY: number;
}

/**
 * State
 */
export enum StateName {
  IDLE = "idle",
  WALKING = "walking",
  RUNNING = "running",
  JUMPING = "jumping",
  CASTING = "casting",
  SLASHING = "slashing",
}

export interface StateResolution {
  state: StateName;
  needsUpdate: boolean;
}

/**
 * Direction
 */
export enum Direction {
  DOWN = "down",
  UP = "up",
  LEFT = "left",
  RIGHT = "right",
}

export const DirectionVectors: Record<Direction, { x: number; y: number }> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};

/**
 * Animations
 */
export interface AnimationConfig {
  frameCount: number;
  frameRate: number;
  repeat: number;
}

/**
 * Spells
 */
export enum SpellName {
  SHARD = "shard",
  SLASH = "slash",
  ILLUMINATE = "illuminate",
  HURT_SHADOWS = "hurt_shadows",
}

export interface SpellConfig {
  name: SpellName;
  damage: number;
  knockback: number;
  speed?: number;
  range?: number;
  duration?: number;
  hitbox?: {
    width: number;
    height: number;
  };
}

/**
 * Components
 */
export enum ComponentName {
  ANIMATION = "animation",
  BEHAVIOR_QUEUE = "behaviorQueue",
  BODY = "body",
  POINTABLE = "pointable",
  TEXTURE = "texture",
  INVENTORY = "inventory",
  PICKABLE = "pickable",
  HOVERABLE = "hoverable",
  HOTBAR = "hotbar",
  DAMAGEABLE = "damageable",
  TRANSITION = "transition",
  INTERACTABLE = "interactable",
  VENDOR = "vendor",
}

export type ComponentConfig =
  | { name: ComponentName.ANIMATION }
  | { name: ComponentName.BEHAVIOR_QUEUE }
  | { name: ComponentName.BODY; config: BodyConfig }
  | { name: ComponentName.POINTABLE }
  | { name: ComponentName.TEXTURE; config: TextureConfig; key: string }
  | { name: ComponentName.INVENTORY }
  | { name: ComponentName.PICKABLE }
  | { name: ComponentName.HOVERABLE }
  | { name: ComponentName.HOTBAR }
  | { name: ComponentName.DAMAGEABLE }
  | { name: ComponentName.TRANSITION; config: TransitionConfig }
  | { name: ComponentName.INTERACTABLE }
  | { name: ComponentName.VENDOR; config: VendorConfig };

export interface BodyConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  pushable?: boolean;
  immovable?: boolean;
}

export interface TextureConfig {
  spritesheet: string;
  tileSize: number;
  tiles: { row: number; start: number; end: number }[];
}

export interface InventoryItem {
  name: EntityName;
  quantity: number;
  stackable: boolean;
}

export interface TransitionConfig {
  to: MapName;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Pipelines
 */
export enum PipelineName {
  OUTLINE = "outline",
  ILLUMINATE = "illuminate",
}

/**
 * Tiled
 */
export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export interface TiledLayer {
  id: number;
  name: string;
  type: "tilelayer" | "objectgroup";
  visible: boolean;
  width?: number;
  height?: number;
  data?: number[];
  objects?: TiledObject[];
  properties?: TiledProperty[];
}

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: TiledProperty[];
}

export interface TiledProperty {
  name: string;
  type: string;
  value: any;
}

export interface TiledTileset {
  firstgid: number;
  source: string;
}
