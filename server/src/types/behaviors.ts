export enum BehaviorName {
  PATROL = "patrol",
  ATTACK = "attack",
  STAY = "stay",
  AMBLE = "amble",
  WANDER = "wander",
  FLEE = "flee",
}

export interface PatrolBehaviorConfig {
  radius?: number;
  scan?: { interval: number };
  idle?: { duration: number };
  vision?: number;
  fov?: number;
  repeat?: boolean;
}

export interface AmbleBehaviorConfig {
  radius?: number;
  idle?: { range: [number, number] };
  repeat?: boolean;
}

export interface WanderBehaviorConfig {
  radius?: number;
  scan?: { interval: number };
  idle?: { range: [number, number] };
  vision?: number;
  fov?: number;
  repeat?: boolean;
}

export interface FleeBehaviorConfig {
  repeat?: boolean;
}

export type BehaviorConfig =
  | { name: BehaviorName.PATROL; config?: PatrolBehaviorConfig }
  | { name: BehaviorName.ATTACK }
  | { name: BehaviorName.STAY }
  | { name: BehaviorName.AMBLE; config?: AmbleBehaviorConfig }
  | { name: BehaviorName.WANDER; config?: WanderBehaviorConfig }
  | { name: BehaviorName.FLEE; config?: FleeBehaviorConfig };

export interface BehaviorInput {
  targetX: number;
  targetY: number;
}
