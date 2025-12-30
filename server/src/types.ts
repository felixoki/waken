export interface PlayerConfig {
  id: string;
  socketId: string;
  x: number;
  y: number;
}

export interface PlayerInput {
  id: string;
  x: number;
  y: number;
  direction: Direction | null | undefined;
  directions: Direction[];
  isRunning: boolean;
  state: StateName;
  nextState: StateName;
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
}
