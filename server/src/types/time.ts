export enum TimePhase {
  DAWN = "dawn",
  DAY = "day",
  DUSK = "dusk",
  NIGHT = "night",
}

export interface TimeState {
  current: number;
  days: number;
  phase: TimePhase;
}
