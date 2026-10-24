export enum BehaviorName {
  PATROL = "patrol",
  ATTACK = "attack",
  DEFEND = "defend",
  STAY = "stay",
  AMBLE = "amble",
  WANDER = "wander",
  FLEE = "flee",
  SEARCH = "search",
  FOLLOW = "follow",
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
  chance?: number;
  flying?: boolean;
  repeat?: boolean;
}

export interface DefendBehaviorConfig {
  vision?: number;
  fov?: number;
  repeat?: boolean;
}

export interface AttackBehaviorConfig {
  spacing?: number;
  recovery?: number;
  evasive?: boolean;
}

export type BehaviorConfig =
  | { name: BehaviorName.PATROL; config?: PatrolBehaviorConfig }
  | { name: BehaviorName.ATTACK; config?: AttackBehaviorConfig }
  | { name: BehaviorName.DEFEND; config?: DefendBehaviorConfig }
  | { name: BehaviorName.STAY }
  | { name: BehaviorName.AMBLE; config?: AmbleBehaviorConfig }
  | { name: BehaviorName.WANDER; config?: WanderBehaviorConfig }
  | { name: BehaviorName.FLEE; config?: FleeBehaviorConfig }
  | { name: BehaviorName.SEARCH }
  | { name: BehaviorName.FOLLOW };

export interface BehaviorInput {
  targetX: number;
  targetY: number;
}
