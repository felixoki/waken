import { Socket } from "socket.io";
import { MapName } from "../types";
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
    ) => {
      const { activated, deactivated } = world.chunks.updatePlayerChunks(
        playerId,
        map,
        x,
        y,
      );

      activated.forEach((key) => socket.join(`chunk:${key}`));
      deactivated.forEach((key) => socket.leave(`chunk:${key}`));

      if (activated.length) {
        const ids = world.chunks.getEntitiesInChunk(activated);
        const entities = ids
          .map((id) => world.entities.get(id))
          .filter(Boolean);

        if (entities.length) socket.emit("entity:create:all", entities);
      }

      if (deactivated.length) {
        const stale = deactivated
          .filter((key) => !world.chunks.isChunkActive(key))
          .flatMap((key) => world.chunks.getEntitiesInChunk([key]));

        if (stale.length) socket.emit("chunk:deactivate", stale);
      }

      return { activated, deactivated };
    },
  },

  clear: (socket: Socket, world: World, playerId: string): string[] => {
    const chunks = world.chunks.clearPlayer(playerId);
    chunks.forEach((key) => socket.leave(`chunk:${key}`));

    return chunks;
  },
};
