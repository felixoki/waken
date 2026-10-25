import { save } from "../db/save.js";
import { load } from "../db/load.js";
import { World } from "../World.js";
import { EntityConfig } from "../types/index.js";
import { configs } from "../configs/index.js";

export const world = {
  restore: async (id: string, world: World): Promise<boolean> => {
    const state = await load.world(id);

    if (state?.entities?.length) {
      state.entities.forEach((entity: EntityConfig) => {
        if (
          configs.entities[entity.name]?.dialogue ||
          configs.schedules[entity.name]
        )
          entity.anchor ??= { map: entity.map, x: entity.x, y: entity.y };

        world.entities.add(entity.id, entity);
        if (!entity.away)
          world.chunks.registerEntity(entity.id, entity.map, entity.x, entity.y);
        if (entity.dropped) world.dropped.add(entity.id);
      });

      state.entities.forEach((entity: EntityConfig) => {
        if (entity.parent)
          world.entities.spawners.get(entity.parent)?.children.add(entity.id);
      });
    }

    if (state?.time) world.setTime(state.time);

    if (state?.relics) world.relics.hydrate(state.relics);

    if (state?.story) world.story.hydrate(state.story);

    if (state?.economy) world.economy.hydrate(state.economy);

    return !!state?.entities?.length;
  },

  save: async (id: string, world: World): Promise<void> => {
    await save.world(id, {
      entities: world.entities.all,
      chunks: {},
      time: world.getTime(),
      relics: world.relics.snapshot((playerId) => {
        const holder = world.players.get(playerId);
        return !holder || !configs.maps[holder.map].isInstanced;
      }),
      story: world.story.snapshot(),
      economy: world.economy.state(),
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
              robe: player.robe,
              active: player.active,
              records: player.records,
              story: player.story,
            },
          }),
        ),
    );
  },
};
