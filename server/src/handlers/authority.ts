import { Server } from "socket.io";
import { Event, MapName, PlayerConfig } from "../types";
import { World } from "../World";

export const authority = {
  assign: (
    io: Server,
    world: World,
    map: MapName,
    playerId: string,
    partyId?: string,
  ) => {
    const prevId = world.authority.get(map, partyId);
    if (prevId === playerId) return;

    const room = world.authority.room(map, partyId);

    if (prevId) {
      const prev = world.players.get(prevId);

      if (prev) {
        io.sockets.sockets.get(prev.socketId)?.leave(room);
        world.players.update(prevId, { isAuthority: false });
      }
    }

    world.authority.set(map, playerId, partyId);

    const next = world.players.get(playerId);
    if (!next) return;

    world.players.update(playerId, { isAuthority: true });

    const socket = io.sockets.sockets.get(next.socketId);
    if (!socket) return;

    socket.join(room);
    socket.emit(Event.PLAYER_AUTHORITY, true);

    const entities = world.chunks
      .getActiveEntities(world.authority.key(map, partyId))
      .map((id) => world.entities.get(id))
      .filter(Boolean);

    if (entities.length) socket.emit(Event.ENTITY_CREATE_ALL, entities);
  },

  transfer: (
    io: Server,
    world: World,
    map: MapName,
    fromId: string,
    candidates: PlayerConfig[],
    partyId?: string,
  ): string | undefined => {
    if (world.authority.get(map, partyId) !== fromId) return undefined;

    const next = candidates.find((p) => p.id !== fromId)?.id;

    if (next) {
      authority.assign(io, world, map, next, partyId);
      return next;
    }

    authority.release(io, world, map, partyId);
    return undefined;
  },

  release: (io: Server, world: World, map: MapName, partyId?: string) => {
    const holderId = world.authority.get(map, partyId);

    if (holderId) {
      const holder = world.players.get(holderId);

      if (holder)
        io.sockets.sockets
          .get(holder.socketId)
          ?.leave(world.authority.room(map, partyId));
    }

    world.authority.clear(map, partyId);
  },
};
