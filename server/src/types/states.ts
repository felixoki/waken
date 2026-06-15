export enum StateName {
  IDLE = "idle",
  WALKING = "walking",
  RUNNING = "running",
  FLYING = "flying",
  JUMPING = "jumping",
  CASTING = "casting",
  SLASHING = "slashing",
  ROLLING = "rolling",
  DASHING = "dashing",
  THROWING = "throwing",
  FISHING = "fishing",
  DEAD = "dead",
}

export interface StateResolution {
  state: StateName;
  needsUpdate: boolean;
}
