import { Server, Socket } from "socket.io";
import { handlers } from "../handlers/index.js";
import { tryCatch } from "../utils/tryCatch.js";
import {
  Input,
  Hit,
  Item,
  Transition,
  Spot,
  EntityConfig,
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
        handlers.player.transition(data, io, socket, world),
    },
    /**
     * Entity
     */
    {
      event: "entity:create",
      handler: (data: Omit<EntityConfig, "id">) =>
        handlers.entity.create(data, socket, world),
    },
    {
      event: "entity:input",
      handler: (data: Partial<Input>) =>
        handlers.entity.input(data, socket, world),
    },
    {
      event: "entity:pickup",
      handler: (data: string) => handlers.entity.pickup(data, socket, world),
    },
    {
      event: "entity:spotted:player",
      handler: (data: Spot) => handlers.entity.spot(data, socket, world),
    },
    {
      event: "entity:flee",
      handler: (data: string) => handlers.entity.flee(data, socket, world),
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
     * Farming
     */
    {
      event: "entity:plant",
      handler: (data: any) => handlers.farming.plant(data, socket, world),
    },
    {
      event: "entity:harvest",
      handler: (data: any) => handlers.farming.harvest(data, socket, world),
    },
    /**
     * Shared
     */
    {
      event: "hit",
      handler: (data: Hit) => handlers.combat.hit(data, socket, world),
    },
    /**
     * Party
     */
    {
      event: "party:create",
      handler: () => handlers.party.create(socket, world),
    },
    {
      event: "party:join",
      handler: (data: string) => handlers.party.join(data, socket, world),
    },
    {
      event: "party:leave",
      handler: () => handlers.party.leave(socket, io, world),
    },
    {
      event: "party:start",
      handler: () => handlers.party.start(socket, io, world),
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
