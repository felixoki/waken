/**
 * Players
 */
export interface PlayerConfig {
  id: string;
  socketId: string;
  x: number;
  y: number;
  isHost: boolean;
}

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

export interface PlayerHit {
  attackerId: string;
  targetId: string;
}

/**
 * Entities
 */
export interface EntityConfig {
  id: string;
  x: number;
  y: number;
}

export interface EntityHit {
  attackerId: string;
  targetId: string;
}

export interface BehaviorInput {
  targetX: number;
  targetY: number;
}

/**
 * Common
 */
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

export enum StateName {
  IDLE = "idle",
  WALKING = "walking",
  RUNNING = "running",
  JUMPING = "jumping",
  CASTING = "casting",
  SLASHING = "slashing",
}

export enum ComponentName {
  ANIMATION = "animation",
  POINTABLE = "pointable",
  BEHAVIOR_QUEUE = "behaviorQueue",
}

export enum EntityName {
  PLAYER = "player",
  ORC1 = "orc1",
}
