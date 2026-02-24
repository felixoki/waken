import { EntityName } from "./entities";

export enum BiomeName {
  FOREST = "forest",
}

export enum TerrainName {
  WATER = "water",
  GROUND = "ground",
  GRASS = "grass",
}

export const TERRAIN_ORDER = [
  TerrainName.WATER,
  TerrainName.GROUND,
  TerrainName.GRASS,
];

export enum TileRole {
  FILL = "fill",
  BORDER_OUTER = "border_outer",
  BORDER_INNER = "border_inner",
}

export enum BorderPosition {
  TOP_LEFT = "top_left",
  TOP = "top",
  TOP_RIGHT = "top_right",
  LEFT = "left",
  RIGHT = "right",
  BOTTOM_LEFT = "bottom_left",
  BOTTOM = "bottom",
  BOTTOM_RIGHT = "bottom_right",
}

export interface Neighbors<T> {
  north: T;
  south: T;
  east: T;
  west: T;
  northwest: T;
  northeast: T;
  southwest: T;
  southeast: T;
}

export interface TileQuery {
  role: TileRole;
  position?: BorderPosition;
  terrain?: TerrainName;
  from?: TerrainName;
}

export interface TileEntry {
  id: number;
  animation?: {
    duration: number;
    tileid: number;
  }[];
  objectgroup?: any;
  properties?: {
    name: string;
    type: string;
    value: any;
  }[];
}

export interface Tileset {
  name: string;
  columns: number;
  tilecount: number;
  tilewidth: number;
  tileheight: number;
  image: string;
  imagewidth: number;
  imageheight: number;
  margin: number;
  spacing: number;
  tiles?: TileEntry[];
}

export interface NoiseConfig {
  seed?: string;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
  scale?: number;
}

export interface GridDimensions {
  width: number;
  height: number;
}

export interface LayerConfig {
  terrain: TerrainName;
  tileset: string;
  threshold: number | null;
}

export interface BorderConfig {
  from: TerrainName;
  to: TerrainName;
  tileset: string;
  collides?: boolean;
  queryProperty?: "from" | "terrain";
}

export interface BiomeConfig {
  id: BiomeName;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  noise: NoiseConfig;
  layers: LayerConfig[];
  borders: BorderConfig[];
  terrain: TerrainName[];
  objects: SpawnRule[];
  exclusion: number;
}

export interface GeneratedMap {
  tilemap: any;
  spawn: {
    x: number;
    y: number;
  };
  entities: Entity[];
}

export interface GroupConfig {
  min: number;
  max: number;
  radius: number;
}

export interface SpawnRule {
  entities: EntityName[];
  terrain: TerrainName[];
  density: number;
  spacing: number;
  cluster?: boolean;
  group?: GroupConfig;
}

export interface Entity {
  name: EntityName;
  x: number;
  y: number;
}