import { Server } from "socket.io";
import { Event, MapName, PlayerConfig } from "../types";
import { World } from "../World";

export const authority = {
  transfer: (
    io: Server,
    world: World,
    map: MapName,
    fromId: string,
    candidates: PlayerConfig[],
    partyId?: string,
  ): string | undefined => {
    const id = world.authority.transfer(map, fromId, candidates, partyId);

    if (id) {
      const player = world.players.get(id);
      if (!player) return undefined;

      world.players.update(id, { isAuthority: true });
      const socket = io.sockets.sockets.get(player.socketId);
      socket?.emit(Event.PLAYER_AUTHORITY, true);
    }

    return id;
  },
};
