import { Server, Socket } from "socket.io";
import { handlers } from "../handlers/index.js";
import { tryCatch } from "../utils/tryCatch.js";
import { Input, Hit, MapName, EntityPickup, Item } from "../types.js";
import { InstanceManager } from "../managers/Instance.js";

type SocketEvent = {
  event: string;
  handler: (...args: any[]) => void | Promise<void>;
};

export function registerHandlers(
  _io: Server,
  socket: Socket,
  instances: InstanceManager,
) {
  const events: SocketEvent[] = [
    /**
     * Game
     */
    {
      event: "game:create",
      handler: () => handlers.game.create(socket, instances),
    },
    {
      event: "game:join",
      handler: (data: { instanceId: string }) =>
        handlers.game.join(socket, instances, data.instanceId),
    },
    {
      event: "game:list",
      handler: () => handlers.game.list(socket, instances),
    },
    /**
     * Player
     */
    {
      event: "player:create",
      handler: () => handlers.player.create(socket, instances),
    },
    {
      event: "disconnect",
      handler: () => handlers.player.delete(socket, instances),
    },
    {
      event: "player:input",
      handler: (data: Input) => handlers.player.input(data, socket, instances),
    },
    {
      event: "player:transition",
      handler: (map: MapName) =>
        handlers.player.transition(map, socket, instances),
    },
    /**
     * Entity
     */
    {
      event: "entity:create",
      handler: () => handlers.entity.create(socket, instances),
    },
    {
      event: "entity:pickup",
      handler: (data: EntityPickup) =>
        handlers.entity.pickup(data, socket, instances),
    },
    /**
     * Items
     */
    {
      event: "item:collect",
      handler: (data: Item) =>
        handlers.item.collect(data, socket, instances),
    },
    /**
     * Shared
     */
    {
      event: "hit",
      handler: (data: Hit) => handlers.combat.hit(data, socket, instances),
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
