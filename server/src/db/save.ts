import { pg } from "./postgres.js";
import { redis } from "./redis.js";
import { tryCatch } from "../utils/tryCatch.js";

type PlayerData = {
  playerId: string;
  position: { x: number; y: number };
  health: number;
  data: Record<string, any>;
};

type WorldState = {
  entities: any[];
  chunks: Record<string, any>;
  time: Record<string, any>;
};

export const save = {
  player: async (worldId: string, player: PlayerData) => {
    const key = `player:${worldId}:${player.playerId}`;

    const { error: pgError } = await tryCatch(
      pg.query(
        `INSERT INTO player_data (player_id, world_id, position_x, position_y, health, data, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (player_id, world_id)
     DO UPDATE SET position_x = $3, position_y = $4, health = $5, data = $6, updated_at = NOW()`,
        [
          player.playerId,
          worldId,
          player.position.x,
          player.position.y,
          player.health,
          JSON.stringify(player.data),
        ],
      ),
    );

    if (pgError) {
      console.error("save.player pg failed:", pgError);
      return;
    }

    const { error: redisError } = await tryCatch(
      redis.setex(
        key,
        300,
        JSON.stringify({
          position: player.position,
          health: player.health,
          data: player.data,
        }),
      ),
    );

    if (redisError) console.error("save.player redis failed:", redisError);
  },

  world: async (worldId: string, state: WorldState) => {
    const key = `world:${worldId}`;

    const { error: pgError } = await tryCatch(
      pg.query(
        `INSERT INTO world_state (world_id, entities, chunks, time, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (world_id)
     DO UPDATE SET entities = $2, chunks = $3, time = $4, updated_at = NOW()`,
        [
          worldId,
          JSON.stringify(state.entities),
          JSON.stringify(state.chunks),
          JSON.stringify(state.time),
        ],
      ),
    );

    if (pgError) {
      console.error("save.world pg failed:", pgError);
      return;
    }

    const { error: redisError } = await tryCatch(
      redis.setex(key, 300, JSON.stringify(state)),
    );

    if (redisError) console.error("save.world redis failed:", redisError);
  },
};
