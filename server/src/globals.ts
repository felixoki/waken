export const SERVER_URL = "http://localhost:3001";
export const SERVER_PORT = 3001;

export const CLIENT_URL = "http://localhost:3000";

export const SPEED_WALKING = 80;
export const SPEED_RUNNING = 120;
export const SPEED_JUMPING = 100;
export const SPEED_ROLLING = 120;

export const HEIGHT_JUMPING = 40;

export const DAY = 30 * 60 * 1000;
export const TICK_RATE = 1000 / 60;

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
