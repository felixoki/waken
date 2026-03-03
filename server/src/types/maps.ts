export enum MapName {
  VILLAGE = "village",
  HERBALIST_HOUSE = "herbalist_house",
  BLACKSMITH_HOUSE = "blacksmith_house",
  GLASSBLOWER_HOUSE = "glassblower_house",
  TAVERN = "tavern",
  HOME = "home",
  REALM = "realm",
}

export interface MapConfig {
  id: MapName;
  spawn: { x: number; y: number };
  json: string;
  spritesheets: Spritesheet[];
}

export interface Spritesheet {
  key: string;
  file: string;
  frameWidth?: number;
  frameHeight?: number;
  asTileset?: boolean;
}
