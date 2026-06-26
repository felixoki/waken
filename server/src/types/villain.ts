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