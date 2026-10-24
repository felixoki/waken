export const LOBBY_PORT = Number(process.env.LOBBY_PORT || 3100);
export const SERVER_PORT = Number(process.env.PORT || 3001);
export const WORLD_ID = process.env.WORLD_ID || "";
export const DEV_COMMANDS = process.env.DEV_COMMANDS === "1";

export const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://waken:waken@localhost:5432/waken";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "waken";
export const REDIS_URL = process.env.REDIS_URL || `redis://:${REDIS_PASSWORD}@localhost:6379`;