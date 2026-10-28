import { Direction } from "./directions";
import { Stuck, Waypoint } from "./path";
import { SpellName } from "./spells";

export enum DragonActionName {
  CAST = "cast",
  WALK_TO = "walkTo",
  FLY_TO = "flyTo",
}

export type DragonAction =
  | { name: DragonActionName.CAST; spell: SpellName }
  | { name: DragonActionName.WALK_TO; x: number; y: number }
  | { name: DragonActionName.FLY_TO; x: number; y: number };
export enum EncounterPhase {
  GATHERING = "gathering",
  DIALOGUE = "dialogue",
  FIGHT = "fight",
}

export interface Encounter {
  entityId: string;
  partyId: string;
  phase: EncounterPhase;
  facing: Direction;
  slots: Record<string, EncounterSlot>;
  ready: string[];
  nodeId: string;
  timer?: ReturnType<typeof setTimeout>;
}

export interface EncounterStart {
  entityId: string;
  x: number;
  y: number;
  facing: Direction;
  slots: Record<string, EncounterSlot>;
}

export interface EncounterSlot {
  from: Waypoint;
  to: Waypoint;
}

export interface Cutscene {
  facing: Direction;
  path: Waypoint[];
  stuck: Stuck;
  walking: boolean;
  arrived: boolean;
}
