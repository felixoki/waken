export enum BehaviorName {
  PATROL = "patrol",
  ATTACK = "attack",
  STAY = "stay",
  AMBLE = "amble",
}

export interface PatrolBehaviorConfig {
  radius?: number;
  scan?: {
    interval: number;
  };
  idle?: {
    duration: number;
  };
  vision?: number;
  fov?: number;
  repeat?: boolean;
}

export interface AmbleBehaviorConfig {
  radius?: number;
  idle?: { range: [number, number] };
  repeat?: boolean;
}

export type BehaviorConfig =
  | { name: BehaviorName.PATROL; config?: PatrolBehaviorConfig }
  | { name: BehaviorName.ATTACK }
  | { name: BehaviorName.STAY }
  | { name: BehaviorName.AMBLE; config?: AmbleBehaviorConfig };

export interface BehaviorInput {
  targetX: number;
  targetY: number;
}
