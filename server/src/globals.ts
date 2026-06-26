import { TimePhase } from "./types/index.js";

/** Server */
export const HEARTBEAT_INTERVAL = 30_000;
export const WORLD_INACTIVITY_TIMEOUT = 5 * 60 * 1000;

/** World */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 352;

/** Chunks */
export const TILE_SIZE = 16;
export const CHUNK_PIXEL_SIZE = 16 * TILE_SIZE;
export const CHUNK_ACTIVATION_RADIUS = 2;
export const CHUNK_ACTIVATION_BUDGET = 2;

/** Movement */
export const SPEED_WALKING = 80;
export const SPEED_RUNNING = 120;
export const SPEED_FLYING = 150;
export const SPEED_JUMPING = 100;
export const SPEED_ROLLING = 120;
export const SPEED_DASHING = 1200;

export const HEIGHT_JUMPING = 40;
export const HEIGHT_FLYING = 32;

/** Time */
export const DAY = 30 * 60 * 1000;
export const TICK_RATE = 1000 / 60;
export const INTERPOLATION_SPEED = 10;

export const AUTOSAVE_INTERVAL = 30 * 1000;

export const PHASE_TRANSITION_DURATION = 3000;
export const PHASE_STARTS = [
  { phase: TimePhase.DAWN, start: 0 },
  { phase: TimePhase.DAY, start: 0.1 },
  { phase: TimePhase.DUSK, start: 0.5 },
  { phase: TimePhase.NIGHT, start: 0.6 },
];

/** Actions */
export const DURATION_JUMPING = 800;
export const DURATION_LIFT = 250;
export const DURATION_ROLLING = 600;
export const DURATION_DASHING = 50;
export const DURATION_SLASHING = 800;
export const DURATION_THROWING = 1000;
export const DURATION_FELLING = 600;
export const RANGE_FELLING = 48;
export const DURATION_MINING = 600;
export const RANGE_MINING = 48;
export const EXTRACTION_DAMAGE = 35;
export const DURATION_EXTRACTION_BOUNCE = 800;
export const RANGE_WATERING = 48;
export const RANGE_PLANTING = 48;
export const DURATION_RAKING = 600;
export const DURATION_WATERING = 1500;
export const DURATION_CROP_DEHYDRATION = 86_400_000;

export const THROW_FRAME = 5;
export const THROW_FRAMES_TOTAL = 10;
export const ROCK_ARC_HEIGHT = 60;
export const ROCK_FLIGHT_DURATION = 500;
export const ROCK_HITBOX_SIZE = 24;
export const ROCK_HITBOX_DURATION = 200;
export const ROCK_MAX_THROW_RANGE = 200;
export const ROCK_INACCURACY_SCALE = 0.1;

export const RANGE_SLASHING = 40;
export const RANGE_INTERACTING = 100;
export const RANGE_HITBOX_DETECTION = 100;

/** Vision */
export const VISION_PROXIMITY = 200;

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

/** Fishing */
export const DURATION_FISHING_WAIT_MIN = 3000;
export const DURATION_FISHING_WAIT_MAX = 8000;
export const DURATION_FISHING_WINDOW = 1500;
export const DURATION_FISHING_CATCH = 750;
export const FISHING_ARC_HEIGHT = 48;
export const FISHING_ARC_DURATION = 600;
export const FISHING_SCAN_TILES = 1;
export const FISHING_LANDING_DISTANCE = 16;

/** Sounds */

export const CROSSFADE_DURATION = 1000;
export const FOOTSTEP_DISTANCE = 30;

export const SFX_FALLOFF_NEAR = 80;
export const SFX_FALLOFF_FAR = 480;
export const SFX_MAX_PAN = 0.6;

/** Stats */
export const MAX_HEALTH = 100;
export const MAX_MANA = 100;
export const REGEN_HEALTH_PER_SECOND = 1;
export const REGEN_MANA_PER_SECOND = 2;
export const REGEN_INTERVAL = 1000;

export const MAX_STACK = 50;

/** Directions */
export const DIRECTIONS_CARDINAL = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

export const DIRECTIONS = [
  ...DIRECTIONS_CARDINAL,
  { dx: 1, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 },
];

/** Corners */
export const CORNERS: [number, number][][] = [
  [
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [-1, 0],
    [0, 1],
    [-1, 1],
  ],
  [
    [1, 0],
    [0, -1],
    [1, -1],
  ],
  [
    [-1, 0],
    [0, -1],
    [-1, -1],
  ],
];

/** Dungeon */
export const DUNGEON_ROOM_ATTEMPTS = 200;
export const DUNGEON_ROOM_PADDING = 4;
export const DUNGEON_ROOM_MIN = 12;
export const DUNGEON_ROOM_MAX = 24;
export const DUNGEON_ROOM_FURNISH_CHANCE = 0.9;
export const DUNGEON_LOOP_CHANCE = 0.01;
export const DUNGEON_CORRIDOR_WIDE_CHANCE = 0.5;
export const DUNGEON_RECESS_MARGIN = 4;
export const DUNGEON_RECESS_CLUSTERS = 4;
export const DUNGEON_RECESS_RECTS_PER_CLUSTER = 3;
export const DUNGEON_RECESS_MIN_W = 6;
export const DUNGEON_RECESS_MAX_W = 18;
export const DUNGEON_RECESS_MIN_H = 5;
export const DUNGEON_RECESS_MAX_H = 12;
export const DUNGEON_RECESS_GAP = 2;
export const DUNGEON_RECESS_MIN_DIM = 7;
export const DUNGEON_TORCH_STRIDE = 16;
export const DUNGEON_LADDER_COUNT = 3;
export const DUNGEON_LADDER_TORCH_CLEARANCE = 4;

/** Villain */

export const TRANSFORM_RANGE = 50;
export const DRAGON_FORM_DURATION = 10000;