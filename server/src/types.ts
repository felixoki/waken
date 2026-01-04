/**
 * Players
 */
export interface PlayerConfig {
  id: string;
  socketId: string;
  map: MapName;
  x: number;
  y: number;
  isHost: boolean;
}

export interface PlayerHit {
  attackerId: string;
  targetId: string;
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
}

export interface EntityDefinition {
  direction: Direction;
  directions: Direction[];
  components: ComponentConfig[];
  states: StateName[];
  behaviors?: BehaviorName[];
}

export enum EntityName {
  PLAYER = "player",
  ORC1 = "orc1",
  HOUSE1 = "house1",
}

export interface EntityHit {
  attackerId: string;
  targetId: string;
}

/**
 * Maps
 */

export enum MapName {
  VILLAGE = "village",
}

export interface MapConfig {
  id: MapName;
  json: string;
}

/**
 * Common
 */
export interface Input {
  id: string;
  x: number;
  y: number;
  direction: Direction | null | undefined;
  directions: Direction[];
  isRunning: boolean;
  isJumping: boolean;
  target?: string;
  state: StateName;
}

export enum BehaviorName {
  PATROL = "patrol",
}

export interface BehaviorInput {
  targetX: number;
  targetY: number;
}

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

export interface AnimationConfig {
  frameCount: number;
  frameRate: number;
  repeat: number;
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
}

export type ComponentConfig =
  | { name: ComponentName.ANIMATION }
  | { name: ComponentName.BEHAVIOR_QUEUE }
  | { name: ComponentName.BODY; config: BodyConfig }
  | { name: ComponentName.POINTABLE }
  | { name: ComponentName.TEXTURE; config: TextureConfig; key: string };

/**
 * Components
 */
export interface BodyConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  pushable?: boolean;
}

export interface TextureConfig {
  spritesheet: string;
  tileSize: number;
  tiles: { row: number; start: number; end: number }[];
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