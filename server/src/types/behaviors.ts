export enum BehaviorName {
  PATROL = "patrol",
  ATTACK = "attack",
}

export interface BehaviorInput {
  targetX: number;
  targetY: number;
}
