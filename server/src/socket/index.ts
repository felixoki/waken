import { Server, Socket } from "socket.io";
import { handlers } from "../handlers/index.js";
import { PlayerStore } from "../stores/Player.js";
import { tryCatch } from "../utils/tryCatch.js";
import { EntityHit, PlayerHit, Input } from "../types.js";
import { EntityStore } from "../stores/Entity.js";

type SocketEvent = {
  event: string;
  handler: (...args: any[]) => void | Promise<void>;
};

export function registerHandlers(
  _io: Server,
  socket: Socket,
  stores: { players: PlayerStore; entities: EntityStore }
) {
  const events: SocketEvent[] = [
    {
      event: "player:create",
      handler: () =>
        handlers.player.create(socket, stores.players, stores.entities),
    },
    {
      event: "disconnect",
      handler: () => handlers.player.delete(socket, stores.players),
    },
    {
      event: "player:input",
      handler: (data: Input) =>
        handlers.player.input(data, socket, stores.players),
    },
    {
      event: "player:hit",
      handler: (data: PlayerHit) =>
        handlers.player.hit(data, socket, stores.players),
    },
    {
      event: "entity:create",
      handler: () =>
        handlers.entity.create(socket, stores.entities, stores.players),
    },
    {
      event: "entity:hit",
      handler: (data: EntityHit) =>
        handlers.entity.hit(data, socket, stores.entities),
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
