import { pg } from "./postgres.js";
import { redis } from "./redis.js";

export const load = {
  player: async (worldId: string, playerId: string) => {
    const key = `player:${worldId}:${playerId}`;

    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const result = await pg.query(
      `SELECT position_x, position_y, health, data
       FROM player_data
       WHERE player_id = $1 AND world_id = $2`,
      [playerId, worldId],
    );

    if (!result.rows.length) return null;

    const row = result.rows[0];

    return {
      position: { x: row.position_x, y: row.position_y },
      health: row.health,
      data: row.data,
    };
  },

  world: async (worldId: string) => {
    const key = `world:${worldId}`;

    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const result = await pg.query(
      `SELECT entities, chunks, time FROM world_state WHERE world_id = $1`,
      [worldId],
    );

    if (!result.rows.length) return null;

    return result.rows[0];
  },
};
