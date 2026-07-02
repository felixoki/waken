import { Server, Socket } from "socket.io";
import { Event, MapName } from "../types";
import { World } from "../World";

export const chunks = {
  sync: {
    player: (
      socket: Socket,
      world: World,
      playerId: string,
      map: MapName,
      x: number,
      y: number,
      io?: Server,
      partyId?: string,
    ) => {
      const { activated, deactivated } = world.chunks.updatePlayerChunks(
        playerId,
        map,
        x,
        y,
        partyId,
      );

      activated.forEach((key) => socket.join(`chunk:${key}`));
      deactivated.forEach((key) => socket.leave(`chunk:${key}`));

      if (activated.length) {
        const ids = world.chunks.getEntitiesInChunk(activated);
        const entities = ids
          .map((id) => world.entities.get(id))
          .filter(Boolean);

        if (entities.length) {
          socket.emit(Event.ENTITY_CREATE_ALL, entities);

          if (io) {
            const authorityId = world.authority.get(map, partyId);

            if (authorityId && authorityId !== playerId) {
              const authority = world.players.get(authorityId);

              if (authority) {
                const authoritySocket = io.sockets.sockets.get(
                  authority.socketId,
                );
                authoritySocket?.emit(Event.ENTITY_CREATE_ALL, entities);
              }
            }
          }
        }

        socket.emit(Event.MAP_READY);
      }

      if (deactivated.length) {
        const stale = deactivated
          .filter((key) => !world.chunks.isChunkActive(key))
          .flatMap((key) => world.chunks.getEntitiesInChunk([key]));

        if (stale.length) socket.emit(Event.CHUNK_DEACTIVATE, stale);
      }
    },
  },

  clear: (socket: Socket, world: World, playerId: string): string[] => {
    const chunks = world.chunks.clearPlayer(playerId);
    chunks.forEach((key) => socket.leave(`chunk:${key}`));

    return chunks;
  },
};
