export const LOBBY_PORT = Number(process.env.LOBBY_PORT || 3100);
export const SERVER_PORT = Number(process.env.PORT || 3001);
export const WORLD_ID = process.env.WORLD_ID || "default";

export const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://waken:waken@localhost:5432/waken";
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";