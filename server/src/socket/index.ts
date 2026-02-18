import { Server, Socket } from "socket.io";
import { handlers } from "../handlers/index.js";
import { tryCatch } from "../utils/tryCatch.js";
import {
  Input,
  Hit,
  EntityPickup,
  Item,
  Transition,
  Spot,
} from "../types/index.js";
import { World } from "../World.js";
import { NodeId } from "../types/dialogue.js";

type SocketEvent = {
  event: string;
  handler: (...args: any[]) => void | Promise<void>;
};

export function registerHandlers(io: Server, socket: Socket, world: World) {
  const events: SocketEvent[] = [
    /**
     * Player
     */
    {
      event: "player:create",
      handler: () => handlers.player.create(socket, world),
    },
    {
      event: "disconnect",
      handler: () => handlers.player.delete(io, socket, world),
    },
    {
      event: "player:input",
      handler: (data: Input) => handlers.player.input(data, socket, world),
    },
    {
      event: "player:transition",
      handler: (data: Transition) =>
        handlers.player.transition(data, socket, world),
    },
    /**
     * Entity
     */
    {
      event: "entity:create",
      handler: () => handlers.entity.create(socket, world),
    },
    {
      event: "entity:input",
      handler: (data: Partial<Input>) =>
        handlers.entity.input(data, socket, world),
    },
    {
      event: "entity:pickup",
      handler: (data: EntityPickup) =>
        handlers.entity.pickup(data, socket, world),
    },
    {
      event: "entity:spotted:player",
      handler: (data: Spot) => handlers.entity.spot(data, socket, world),
    },
    {
      event: "entity:dialogue:iterate",
      handler: (data: { entityId: string; nodeId: NodeId }) =>
        handlers.dialogue.iterate(data.entityId, socket, world, data.nodeId),
    },
    /**
     * Items
     */
    {
      event: "item:collect",
      handler: (data: Item) => handlers.item.collect(data, socket, world),
    },
    /**
     * Shared
     */
    {
      event: "hit",
      handler: (data: Hit) => handlers.combat.hit(data, socket, world),
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
