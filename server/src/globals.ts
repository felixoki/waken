import { TimePhase } from "./types/index.js";

/** World */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 352;

/** Chunks */
export const TILE_SIZE = 16;
export const CHUNK_SIZE = 16;
export const CHUNK_PIXEL_SIZE = CHUNK_SIZE * TILE_SIZE;
export const CHUNK_ACTIVATION_RADIUS = 2;
export const CHUNK_ACTIVATION_BUDGET = 4;

/** Movement */
export const SPEED_WALKING = 80;
export const SPEED_RUNNING = 120;
export const SPEED_JUMPING = 100;
export const SPEED_ROLLING = 120;
export const SPEED_DASHING = 1200;

export const HEIGHT_JUMPING = 40;

/** Time */
export const DAY = 30 * 60 * 1000;
export const TICK_RATE = 1000 / 60;

export const AUTOSAVE_INTERVAL = 30 * 1000;

export const PHASE_TRANSITION_DURATION = 3000;
export const PHASE_STARTS = [
  { phase: TimePhase.DAWN, start: 0 },
  { phase: TimePhase.DAY, start: 0.1 },
  { phase: TimePhase.DUSK, start: 0.5 },
  { phase: TimePhase.NIGHT, start: 0.6 },
];

/** Actions */
export const DURATION_CASTING = 800;
export const DURATION_JUMPING = 800;
export const DURATION_ROLLING = 600;
export const DURATION_DASHING = 50;
export const DURATION_SLASHING = 800;
export const DURATION_THROWING = 1000;

export const THROW_FRAME = 7;
export const THROW_FRAMES_TOTAL = 10;
export const ROCK_ARC_HEIGHT = 60;
export const ROCK_FLIGHT_DURATION = 500;
export const ROCK_HITBOX_SIZE = 24;
export const ROCK_HITBOX_DURATION = 200;

export const RANGE_SLASHING = 40;
export const RANGE_INTERACTING = 100;
export const RANGE_HITBOX_DETECTION = 100;

export const DISTANCE_DASHING = (SPEED_DASHING * DURATION_DASHING) / 1000;

export const DELAY_ATTACK = 150;

export const DURATION_COMBO_LOCK = 400;
export const DURATION_FINISHER_LOCK = 600;
export const DURATION_COMBO_WINDOW = 400;

/** Combat */
export const REVIVE_MANA = 30;

export const MISS_CHANCE = 0.05;
export const CRIT_CHANCE = 0.05;
export const CRIT_MULTIPLIER = 2;
export const RESISTANCE_MULTIPLIER = 0.5;
export const WEAKNESS_MULTIPLIER = 2;

/** Stats */
export const MAX_HEALTH = 100;
export const MAX_MANA = 100;
export const REGEN_HEALTH_PER_SECOND = 1;
export const REGEN_MANA_PER_SECOND = 2;

export const MAX_STACK = 50;

/** Directions */
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
