import { EntityName, FishName, Rarity } from "./entities.js";

export interface FishTrophy {
  minWeight: number;
  item: EntityName;
}

export interface FishDifficulty {
  speed: number;
  erratic: number;
  bar: number;
  drain: number;
}

export interface FishConfig {
  rarity: Rarity;
  encounter: number;
  weight: { min: number; max: number; skew: number };
  difficulty: FishDifficulty;
  trophies: FishTrophy[];
}

export enum FishingPhase {
  CASTING = "casting",
  WAITING = "waiting",
  BITE = "bite",
  REELING = "reeling",
  CATCHING = "catching",
}

export interface Hooked {
  name: FishName;
  weight: number;
  percentile: number;
}

export interface Reel extends Hooked {
  difficulty: FishDifficulty;
  barPos: number;
  barVel: number;
  fishPos: number;
  fishDir: number;
  dartUntil: number;
  meter: number;
}

export enum ReelOutcome {
  FIGHTING = "fighting",
  LANDED = "landed",
  ESCAPED = "escaped",
}
