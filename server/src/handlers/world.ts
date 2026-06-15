import { save } from "../db/save.js";
import { load } from "../db/load.js";
import { World } from "../World.js";
import { EntityConfig } from "../types/index.js";
import { configs } from "../configs/index.js";

export const world = {
  restore: async (id: string, world: World): Promise<boolean> => {
    const state = await load.world(id);

    if (state?.entities?.length)
      state.entities.forEach((entity: EntityConfig) => {
        world.entities.add(entity.id, entity);
        world.chunks.registerEntity(entity.id, entity.map, entity.x, entity.y);
      });

    if (state?.time) world.setTime(state.time);

    return !!state?.entities?.length;
  },

  save: async (id: string, world: World): Promise<void> => {
    await save.world(id, {
      entities: world.entities.all,
      chunks: {},
      time: world.getTime(),
    });

    await Promise.all(
      world.players.all
        .filter((player) => !configs.maps[player.map].isInstanced)
        .map((player) =>
          save.player(id, {
            playerId: player.id,
            position: { x: player.x, y: player.y },
            health: player.health,
            data: {
              map: player.map,
              facing: player.facing,
              spells: player.spells,
              inventory: player.inventory,
              hotbar: player.hotbar,
            },
          }),
        ),
    );
  },
};
