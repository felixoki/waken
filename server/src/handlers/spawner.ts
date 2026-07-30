import { Server } from "socket.io";
import { World } from "../World";
import { configs } from "../configs";
import { handlers } from ".";
import { MAX_HEALTH } from "../globals";
import { Event, SpawnerConfig } from "../types";

const pick = (cfg: SpawnerConfig) => {
  const total = cfg.entities.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  return cfg.entities.find((e) => (roll -= e.weight) < 0)!.name;
};

export const spawner = {
  entity: {
    tick: (world: World, io: Server, now: number) => {
      for (const [id, state] of world.entities.spawners) {
        const entity = world.entities.get(id);

        if (!entity) {
          world.entities.spawners.delete(id);
          continue;
        }

        if (!entity.spawner) continue;

        const cfg = entity.spawner;

        for (const child of state.children)
          if (!world.entities.get(child)) state.children.delete(child);

        if (state.children.size >= cfg.max) continue;
        if (now - state.lastAt < cfg.duration) continue;

        state.lastAt = now;

        const name = pick(cfg);
        if (!configs.entities[name]) continue;

        const radius = cfg.radius ?? 0;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const health = configs.entities[name]?.maxHealth ?? MAX_HEALTH;
        const partyId = world.chunks.getPartyByEntity(id);

        const child = handlers.entity.create(
          {
            name,
            map: entity.map,
            x: entity.x + Math.cos(angle) * distance,
            y: entity.y + Math.sin(angle) * distance,
            health,
            maxHealth: health,
            isLocked: false,
          },
          null,
          io,
          world,
          partyId,
        );

        if (child) state.children.add(child.id);
      }
    },
  },

  texture: {
    tick: (world: World, io: Server, now: number) => {
      for (const [id, state] of world.entities.spawners) {
        const entity = world.entities.get(id);

        if (!entity) {
          world.entities.spawners.delete(id);
          continue;
        }

        if (!entity.textureSpawner) continue;

        const cfg = entity.textureSpawner;

        if (now - state.lastAt < cfg.duration) continue;

        state.lastAt = now;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * cfg.radius;
        const sprite =
          cfg.sprites[Math.floor(Math.random() * cfg.sprites.length)];

        const chunk = world.chunks.getChunkByEntity(id);
        const partyId = world.chunks.getPartyByEntity(id);

        handlers.broadcast.entity(
          io,
          world,
          Event.TEXTURE_SPAWN,
          {
            map: entity.map,
            x: entity.x + Math.cos(angle) * distance,
            y: entity.y + Math.sin(angle) * distance,
            sprite,
            frames: cfg.frames,
            frameRate: cfg.frameRate,
          },
          entity.map,
          chunk,
          partyId,
        );
      }
    },
  },
};
