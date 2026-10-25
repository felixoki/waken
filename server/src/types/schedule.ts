import { MapName } from "./maps";
import { TimePhase } from "./time";
import type { Condition } from "./story";

export enum SpotName {
  TAVERN_TARRO = "tavern.tarro",
  TAVERN_ESKEN = "tavern.esken",
  TAVERN_DUNEAS = "tavern.duneas",
  TAVERN_TELLIS = "tavern.tellis",
  TAVERN_GLIMBLID = "tavern.glimblid",
  TAVERN_FAIRE = "tavern.faire",
  TAVERN_EMY = "tavern.emy",
  LAKE_GLIMBLID = "lake.glimblid",
}

export interface Position {
  map: MapName;
  x: number;
  y: number;
}

export const AWAY = "away";
export const ANCHOR = "anchor";

export type Moment = number | [number, number];

export interface Clock {
  phase: TimePhase;
  progress: number;
  day: number;
}

export interface ScheduleRule {
  phases?: TimePhase[];
  from?: Moment;
  until?: Moment;
  chance?: number;
  when?: Condition;
  target: SpotName | typeof AWAY | typeof ANCHOR;
}

export type Schedule = ScheduleRule[];

export type Placement =
  | { spot: SpotName }
  | { anchor: true }
  | { away: true };
