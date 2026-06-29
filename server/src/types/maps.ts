import { BiomeName } from "./generation";

export enum MapName {
  VILLAGE = "village",
  HERBALIST_HOUSE = "herbalist_house",
  BLACKSMITH_HOUSE = "blacksmith_house",
  GLASSBLOWER_HOUSE = "glassblower_house",
  FARM_HOUSE = "farm_house",
  FISHING_HUT = "fishing_hut",
  TAVERN = "tavern",
  HOME = "home",
  FOREST = "forest",
  DUNGEON = "dungeon",
  CAVE = "cave",
  ISLES = "isles",
}

export interface MapConfig {
  id: MapName;
  biome?: BiomeName;
  spawn: { x: number; y: number };
  json: string;
  isIndoor: boolean;
  isInstanced: boolean;
  isPartyInstance?: boolean;
  spritesheets: Spritesheet[];
}

export interface Spritesheet {
  key: string;
  file: string;
  frameWidth?: number;
  frameHeight?: number;
  asTileset?: boolean;
}
