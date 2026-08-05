import { EntityName } from "./entities";
import { MapName } from "./maps";
import { Ingredient } from "./collectors";

export enum BuildCategory {
  FURNITURE = "furniture",
  WALL = "wall",
  FLOOR = "floor",
}

export interface BuildableConfig {
  category: BuildCategory;
  cost: Ingredient[];
}

export interface PlaceBuildData {
  name: EntityName;
  map: MapName;
  x: number;
  y: number;
}

export interface DestroyBuildData {
  map: MapName;
  id: string;
}
