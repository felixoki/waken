import { TimePhase } from "./types";

export const SERVER_URL = "http://localhost:3001";
export const SERVER_PORT = 3001;

export const CLIENT_URL = "http://localhost:3000";

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 352;

export const TILE_SIZE = 16;
export const CHUNK_SIZE = 16;
export const CHUNK_PIXEL_SIZE = CHUNK_SIZE * TILE_SIZE;
export const CHUNK_ACTIVATION_RADIUS = 2;

export const SPEED_WALKING = 80;
export const SPEED_RUNNING = 120;
export const SPEED_JUMPING = 100;
export const SPEED_ROLLING = 120;

export const HEIGHT_JUMPING = 40;

export const DAY = 30 * 1000; //30 * 60 * 1000;
export const TICK_RATE = 1000 / 60;

export const PHASE_TRANSITION_DURATION = 3000;
export const PHASE_STARTS = [
  { phase: TimePhase.DAWN, start: 0 },
  { phase: TimePhase.DAY, start: 0.1 },
  { phase: TimePhase.DUSK, start: 0.5 },
  { phase: TimePhase.NIGHT, start: 0.6 },
];

export const DURATION_CASTING = 800;
export const DURATION_JUMPING = 800;
export const DURATION_ROLLING = 800;
export const DURATION_SLASHING = 800;

export const RANGE_SLASHING = 40;

export const DIRECTIONS_CARDINAL = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

export const DIRECTIONS_DIAGONAL = [
  { dx: 1, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 },
];

export const DIRECTIONS = [...DIRECTIONS_CARDINAL, ...DIRECTIONS_DIAGONAL];
