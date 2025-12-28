export interface PlayerConfig {
  x: number;
  y: number;
  id: string;
  socketId: string;
}

export enum Direction {
  DOWN = "down",
  UP = "up",
  LEFT = "left",
  RIGHT = "right",
}

export enum StateName {
  IDLE = "idle",
  WALKING = "walking",
  RUNNING = "running",
  JUMPING = "jumping",
  SLASHING = "slashing",
}

export enum ComponentName {
  ANIMATION = "animation",
}