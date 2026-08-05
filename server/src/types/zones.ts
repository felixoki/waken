import { MapName } from "./maps.js";
import { FishName } from "./entities.js";

export enum TemporaryZoneName {
  LIGHT = "light",
}

export interface Zone {
  type: TemporaryZoneName;
  map: MapName;
  x: number;
  y: number;
  radius: number;
  expiresAt: number;
  casterId: string;
}

export enum ZoneName {
  FISH = "fish",
}

export interface ZoneConfig {
  type: ZoneName;
  width: number;
  height: number;
  fish?: FishName[];
}
