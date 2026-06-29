import { EntityName } from "./entities";
import { Item } from "./components";

export interface Range {
  min: number;
  max: number;
}

export enum BiomeName {
  FOREST = "forest",
  DUNGEON = "dungeon",
  CAVE = "cave",
}

export enum TerrainName {
  WATER = "water",
  GROUND = "ground",
  GRASS = "grass",
  RECESSED = "recessed",
  FLOOR = "floor",
  ELEVATED = "elevated",
  WALL_BASE = "wall_base",
  WALL_MID = "wall_mid",
  WALL_TOP = "wall_top",
  VOID = "void",
}

export enum GeneratorName {
  TERRAIN = "terrain",
  ROOM = "room",
}

export const TERRAIN_ORDER = [
  TerrainName.VOID,
  TerrainName.WATER,
  TerrainName.GROUND,
  TerrainName.GRASS,
  TerrainName.RECESSED,
  TerrainName.FLOOR,
  TerrainName.ELEVATED,
  TerrainName.WALL_BASE,
  TerrainName.WALL_MID,
  TerrainName.WALL_TOP,
];

export enum TileRole {
  FILL = "fill",
  BORDER_OUTER = "border_outer",
  BORDER_INNER = "border_inner",
  WALL_OUTER = "wall_outer",
  WALL_INNER = "wall_inner",
  LEDGE_OUTER = "ledge_outer",
  LEDGE_INNER = "ledge_inner",
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

export enum RoomName {
  SEWER1 = "sewer1",
  FEAST1 = "feast1",
  FEAST2 = "feast2",
  FEAST3 = "feast3",
  CAVE1 = "cave1",
}

export enum RoomType {
  SEWER = "sewer",
  FEAST = "feast",
  CAVE = "cave",
}

export enum RoomInteriorOrigin {
  TOP_RIGHT = "top_right",
  TOP_LEFT = "top_left",
  BOTTOM_RIGHT = "bottom_right",
  BOTTOM_LEFT = "bottom_left",
}

export enum RoomDifficulty {
  EASY = "easy",
  HARD = "hard",
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
}

export interface BiomeConfig {
  id: BiomeName;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  generator: GeneratorName;
  noise: NoiseConfig;
  layers: LayerConfig[];
  borders: BorderConfig[];
  terrain: TerrainName[];
  objects: SpawnRule[];
  exclusion: number;
  smoothing: { iterations: number; threshold: number } | null;
  details?: DetailConfig[];
  walls?: string;
  ledge?: string;
  tilesets?: string[];
  rooms?: RoomConfig;
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

export interface DetailStamp {
  tiles: { dx: number; dy: number; tileId: number }[];
  width: number;
  height: number;
}

export interface DetailConfig {
  tileset: string;
  terrains: TerrainName[];
  density: number;
  stamps: DetailStamp[];
}

export interface SpawnRule {
  entities: EntityName[];
  terrain: TerrainName[];
  density?: number;
  count?: Range;
  spacing: number;
  margin?: number;
  cluster?: boolean;
  group?: GroupConfig;
}

export interface Entity {
  name: EntityName;
  x: number;
  y: number;
  loot?: (Item & { chance: number })[];
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DoorAnchor {
  x: number;
  y: number;
  dir: "north" | "south";
}

export interface WallMatch {
  role: TileRole;
  position: BorderPosition;
  placement: {
    width: number;
    height: number;
    anchor: { x: number; y: number };
  };
}

export interface EntityGroup {
  entities: EntityName[];
  count: Range;
}

export interface RoomInterior {
  origin: RoomInteriorOrigin;
  entities: {
    name: EntityName;
    x: number;
    y: number;
    loot?: (Item & { chance: number })[];
  }[];
}

export interface RoomTemplate {
  id: RoomName;
  type: RoomType;
  difficulty: RoomDifficulty;
  weight: number;
  depth?: { min?: number; max?: number };
  enemies?: EntityGroup[];
  traps?: EntityGroup[];
  water?: {
    coverage: number;
  };
}

export interface RoomAssignment {
  easyDepth: number;
  chance: { hidden: number; puzzle: number };
}

export interface RoomDistribution {
  size: { width: Range; height: Range };
  count: Range;
  yRange?: Range;
}

export interface RoomConfig {
  assignment: RoomAssignment;
  templates: RoomTemplate[];
  interior: RoomInterior[];
  hasRecesses?: boolean;
  distribution: {
    large: RoomDistribution;
    small: RoomDistribution;
  };
}

export type FacadeCell = readonly [string, number] | null;

export interface EntranceDef {
  facade: readonly (readonly FacadeCell[])[];
  door: { col: number; row: number };
  entity: EntityName;
  guards?: EntityName;
  minDistance?: number;
  count?: number;
  spacing?: number;
}
