import { Server, Socket } from "socket.io";
import { handlers } from "../handlers/index.js";
import { PlayerStore } from "../stores/PlayerStore.js";
import { tryCatch } from "../utils/tryCatch.js";

type SocketEvent = {
  event: string;
  handler: (...args: any[]) => void | Promise<void>;
};

export function registerHandlers(
  _io: Server,
  socket: Socket,
  stores: { players: PlayerStore }
) {
  const events: SocketEvent[] = [
    {
      event: "player:create",
      handler: () => handlers.player.create(socket, stores.players),
    },
    {
      event: "disconnect",
      handler: () => handlers.player.delete(socket, stores.players),
    },
  ];

  events.forEach(({ event, handler }) => {
    socket.on(event, async (...args) => {
      const { data, error } = await tryCatch(Promise.resolve(handler(...args)));

      if (error)
        throw new Error(`Error handling event "${event}": ${error.message}`);

      return data;
    });
  });
}
