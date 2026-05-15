import { pg } from "./postgres.js";
import { redis } from "./redis.js";
import { tryCatch } from "../utils/tryCatch.js";

export const load = {
  player: async (worldId: string, playerId: string) => {
    const key = `player:${worldId}:${playerId}`;

    const { data: cached } = await tryCatch(redis.get(key));
    if (cached) return JSON.parse(cached);

    const { data: result, error } = await tryCatch(
      pg.query(
        `SELECT position_x, position_y, health, data
         FROM player_data
         WHERE player_id = $1 AND world_id = $2`,
        [playerId, worldId],
      ),
    );

    if (error) {
      console.error("load.player pg failed:", error);
      return null;
    }

    if (!result.rows.length) return null;

    const row = result.rows[0];

    const data = {
      position: { x: row.position_x, y: row.position_y },
      health: row.health,
      data: row.data,
    };

    await redis.setex(key, 300, JSON.stringify(data));

    return data;
  },

  world: async (worldId: string) => {
    const key = `world:${worldId}`;

    const { data: cached } = await tryCatch(redis.get(key));
    if (cached) return JSON.parse(cached);

    const { data: result, error } = await tryCatch(
      pg.query(
        `SELECT entities, chunks, time FROM world_state WHERE world_id = $1`,
        [worldId],
      ),
    );

    if (error) {
      console.error("load.world pg failed:", error);
      return null;
    }

    if (!result.rows.length) return null;

    const data = result.rows[0];

    await redis.setex(key, 300, JSON.stringify(data));

    return data;
  },
};
