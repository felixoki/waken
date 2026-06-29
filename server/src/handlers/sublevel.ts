import { Server, Socket } from "socket.io";
import { Transition, Event, EntityConfig, PlayerConfig } from "../types";
import { World } from "../World";
import { configs } from "../configs";
import { handlers } from ".";
import { MAX_HEALTH } from "../globals";
import { randomUUID } from "crypto";

export const sublevel = {
  enter: async (
    transition: Transition,
    io: Server,
    socket: Socket,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const entranceId = transition.from;
    if (!entranceId) return;

    const map = transition.to;
    const config = configs.maps[map];

    if (!config.biome) return;

    socket.emit(Event.SUBLEVEL_START_LOADING, map);

    let pending = world.sublevels.getInstance(entranceId);
    const isNew = !pending;

    if (!pending) {
      pending = handlers.generation.start(config.biome, entranceId);
      world.sublevels.setInstance(entranceId, pending);
    }

    const biome = await pending;

    if (!biome) {
      if (isNew) world.sublevels.removeInstance(entranceId);
      return;
    }

    if (isNew) {
      biome.entities.forEach((e) => {
        const id = randomUUID();
        const health = configs.entities[e.name]?.maxHealth ?? MAX_HEALTH;

        const entity: EntityConfig = {
          id,
          map,
          name: e.name,
          x: e.x,
          y: e.y,
          health,
          maxHealth: health,
          createdAt: Date.now(),
          isLocked: false,
          loot: e.loot,
        };

        world.entities.add(id, entity);
        world.chunks.registerEntity(id, map, entity.x, entity.y, entranceId);
      });
    }

    const prev = {
      map: player.map,
      party: world.parties.getByPlayerId(player.id)?.id,
    };

    handlers.chunks.clear(socket, world, player.id);

    const candidates = world.players
      .getByMap(prev.map)
      .filter((p) => p.id !== player.id);

    handlers.authority.transfer(
      io,
      world,
      prev.map,
      player.id,
      candidates,
      prev.party,
    );

    world.sublevels.setReturn(player.id, {
      entranceId,
      map: prev.map,
      x: player.x,
      y: player.y,
    });

    world.players.update(player.id, {
      map,
      x: biome.spawn.x,
      y: biome.spawn.y,
      isAuthority: false,
    });

    socket.leave(`map:${prev.map}`);
    socket.join(`map:${map}`);
    socket.to(`map:${prev.map}`).emit(Event.PLAYER_LEAVE, player.id);

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      map,
      biome.spawn.x,
      biome.spawn.y,
      io,
      entranceId,
    );

    const size = world.sublevels.join(entranceId, player.id);

    if (size === 1) {
      world.authority.set(map, player.id, entranceId);
      world.players.update(player.id, { isAuthority: true });
    }

    const updated = world.players.get(player.id);
    const occupants = world.sublevels.occupants(entranceId);

    for (const id of occupants) {
      if (id === player.id) continue;

      const other = world.players.get(id);
      const otherSocket = other && io.sockets.sockets.get(other.socketId);

      otherSocket?.emit(Event.PLAYER_CREATE, updated);
    }

    const players = occupants
      .map((id) => world.players.get(id))
      .filter(Boolean);

    socket.emit(Event.SUBLEVEL_START, {
      map,
      tilemap: biome.tilemap,
      spawn: biome.spawn,
      players,
    });
  },

  exit: (_transition: Transition, io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const session = world.sublevels.takeReturn(player.id);
    if (!session) return;

    const from = player.map;
    const { entranceId } = session;

    const remaining = world.sublevels.leave(entranceId, player.id);

    const candidates = world.sublevels
      .occupants(entranceId)
      .map((id) => world.players.get(id))
      .filter((p): p is PlayerConfig => !!p);

    handlers.authority.transfer(
      io,
      world,
      from,
      player.id,
      candidates,
      entranceId,
    );

    if (remaining === 0) {
      const ids = world.chunks.getEntitiesByPrefix(`${from}:${entranceId}`);

      for (const id of ids)
        handlers.entity.remove(id, Event.ENTITY_DESTROY, socket, io, world);

      world.sublevels.removeInstance(entranceId);
    }

    handlers.player.transfer(
      socket,
      io,
      world,
      player.id,
      session.map,
      session.x,
      session.y,
      undefined,
      undefined,
      entranceId,
    );
  },
};
