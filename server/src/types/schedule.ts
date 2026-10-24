import { MapName } from "./maps";
import { TimePhase } from "./time";
import type { Condition } from "./story";

export enum SpotName {
  TAVERN_TARRO = "tavern.tarro",
  TAVERN_ESKEN = "tavern.esken",
  LAKE_GLIMBLID = "lake.glimblid",
}

export interface Position {
  map: MapName;
  x: number;
  y: number;
}

export const AWAY = "away";
export const ANCHOR = "anchor";

export interface ScheduleRule {
  phases?: TimePhase[];
  when?: Condition;
  target: SpotName | typeof AWAY | typeof ANCHOR;
}

export type Schedule = ScheduleRule[];

export type Placement =
  | { spot: SpotName }
  | { anchor: true }
  | { away: true };
