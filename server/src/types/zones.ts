import { MapName } from "./maps.js";

export enum ZoneName {
  LIGHT = "light",
}

export interface Zone {
  type: ZoneName;
  map: MapName;
  x: number;
  y: number;
  radius: number;
  expiresAt: number;
  casterId: string;
}
