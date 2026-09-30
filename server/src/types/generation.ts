import { EntityName, FishName, TextureSpawnerConfig } from "./entities";
import { Item } from "./components";
import { ZoneConfig } from "./zones";
import type { MapName, SurfaceName } from "./maps";

export interface Range {
  min: number;
  max: number;
}

export enum BiomeName {
  FOREST = "forest",
  DUNGEON = "dungeon",
  CAVE = "cave",
  MOUNTAIN = "mountain",
}

export enum TerrainName {
  WATER = "water",
  GROUND = "ground",
  GRASS = "grass",
  EARTH = "earth",
  SNOW = "snow",
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
  TERRACE = "terrace",
}

export const TERRAIN_ORDER = [
  TerrainName.VOID,
  TerrainName.WATER,
  TerrainName.GROUND,
  TerrainName.GRASS,
  TerrainName.EARTH,
  TerrainName.SNOW,
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
  RIM = "rim",
  BASE = "base",
  CRACK = "crack",
  FACE = "face",
  END = "end",
  END_SHADOW = "end_shadow",
  WALL = "wall",
  WALL_SHADOW = "wall_shadow",
  CORNER = "corner",
  STAIR = "stair",
}

export enum FacePosition {
  FLAT = "flat",
  LEFT = "left",
  RIGHT = "right",
  CAP_LEFT = "cap_left",
  CAP_RIGHT = "cap_right",
  JUNCTION_LEFT = "junction_left",
  JUNCTION_RIGHT = "junction_right",
  INNER_WEST = "inner_west",
  INNER_EAST = "inner_east",
  UP_LEFT = "up_left",
  UP_RIGHT = "up_right",
  WEST = "west",
  EAST = "east",
  TOP_LEFT = "top_left",
  TOP_RIGHT = "top_right",
  BOTTOM_LEFT = "bottom_left",
  BOTTOM_RIGHT = "bottom_right",
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
  position?: BorderPosition | FacePosition;
  terrain?: TerrainName;
  over?: TerrainName;
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
  surface?: SurfaceName;
}

export interface TerraceConfig {
  earth: number;
  snow: number;
  foot: number;
  gap: number;
  summit: number;
  dome: number;
  rough: number;
  scarps: number;
  ridge: number;
  tread: number;
  stairs: { every: number; tilesets: string[] };
  patches: number;
}

export interface FacePiece {
  gid: number;
  columns: number;
  height: number;
  anchor: number;
}

export interface Summit {
  x: number;
  y: number;
  height: number;
  rx: number;
  ry: number;
}

export interface BorderConfig {
  from: TerrainName;
  to: TerrainName;
  tileset: string;
  collides?: boolean;
}

export interface BiomeConfig {
  id: BiomeName;
  label: string;
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
  terraces?: TerraceConfig;
  peak?: { entity: EntityName; requires: number };
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
  gap?: number;
  cluster?: boolean;
}

export interface SpawnRule {
  entities: EntityName[];
  terrain: TerrainName[];
  elevation?: Range;
  density?: number;
  count?: Range;
  spacing: number;
  margin?: number;
  wallAdjacent?: boolean;
  cluster?: boolean;
  group?: GroupConfig;
  loot?: (Item & { chance: number })[];
}

export interface Entity {
  name: EntityName;
  x: number;
  y: number;
  loot?: (Item & { chance: number })[];
  zone?: ZoneConfig;
  textureSpawner?: TextureSpawnerConfig;
}

export type Landmark = Pick<Entity, "name" | "x" | "y">;

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
  erosion?: {
    band: number;
    scale: number;
    threshold: number;
    smoothing: number;
    clearance: number;
    quantize: number;
    north: number;
  };
  water?: {
    chance: number;
    scale: number;
    radius: { min: number; max: number };
    threshold: number;
    fish?: FishName[];
  };
  distribution: {
    large: RoomDistribution;
    small: RoomDistribution;
  };
}

export interface BiomeBand {
  config: BiomeConfig;
  y: number;
}

export interface LocationBand {
  label: string;
  y: number;
  height: number;
}

export interface Level {
  depth: number;
  map: MapName;
  requires?: number;
  biomes?: LevelBiome[];
}

export interface LevelBiome {
  biome: BiomeName;
  requires?: number;
  spawn?: boolean;
}

export interface EntranceDef {
  width: number;
  height: number;
  entity: EntityName;
  guards?: EntityName;
  minDistance?: number;
  count?: number;
  spacing?: number;
  requires?: number;
}
