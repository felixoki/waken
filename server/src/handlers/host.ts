import { Server } from "socket.io";
import { World } from "../World";
import { EntityConfig, MapName, PlayerConfig } from "../types";

export const host = {
  realm: {
    load: (
      io: Server,
      world: World,
      payload: {
        tilemap: any;
        spawn: { x: number; y: number };
        entities: EntityConfig[];
        players: (PlayerConfig | undefined)[];
      },
      members: string[],
    ) => {
      const player = world.players.all.find((p) => p.isHost);
      if (!player || members.includes(player.id)) return;

      const socket = io.sockets.sockets.get(player.socketId);
      if (!socket) return;

      socket.emit("party:start", payload);
      socket.join(`map:${MapName.REALM}`);
    },

    unload: (io: Server, world: World) => {
      const player = world.players.all.find((p) => p.isHost);
      if (!player || player.map === MapName.REALM) return;

      const socket = io.sockets.sockets.get(player.socketId);
      if (!socket) return;

      socket.emit("party:cleanup");
      socket.leave(`map:${MapName.REALM}`);
    },
  },
};
