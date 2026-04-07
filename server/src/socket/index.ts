import { Server, Socket } from "socket.io";
import { handlers } from "../handlers/index.js";
import { tryCatch } from "../utils/tryCatch.js";
import {
  Direction,
  Event,
  Input,
  Hit,
  Item,
  Transition,
  Spot,
  EntityConfig,
  Revive,
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
      event: Event.PLAYER_CREATE,
      handler: (playerId?: string) => handlers.player.create(socket, world, playerId),
    },
    {
      event: "disconnect",
      handler: () => handlers.player.delete(io, socket, world),
    },
    {
      event: Event.PLAYER_INPUT,
      handler: (data: Input) => handlers.player.input(data, socket, io, world),
    },
    {
      event: Event.PLAYER_TRANSITION,
      handler: (data: Transition) =>
        handlers.player.transition(data, io, socket, world),
    },
    {
      event: Event.PLAYER_SPECTATE,
      handler: (data: { targetId: string }) =>
        handlers.player.spectate(data, socket, world),
    },
    /**
     * Entity
     */
    {
      event: Event.ENTITY_CREATE,
      handler: (data: Omit<EntityConfig, "id" | "createdAt">) =>
        handlers.entity.create(data, socket, io, world),
    },
    {
      event: Event.ENTITY_INPUT,
      handler: (data: Partial<Input>) =>
        handlers.entity.input(data, socket, world),
    },
    {
      event: Event.ENTITY_PICKUP,
      handler: (data: string) => handlers.entity.pickup(data, socket, io, world),
    },
    {
      event: Event.ENTITY_SPOTTED_PLAYER,
      handler: (data: Spot) => handlers.entity.spot(data, socket, world),
    },
    {
      event: Event.ENTITY_FLEE,
      handler: (data: string) => handlers.entity.flee(data, socket, io, world),
    },
    {
      event: Event.ENTITY_FELL,
      handler: (data: { id: string; x: number; y: number }) =>
        handlers.entity.fell(data, socket, io, world),
    },
    {
      event: Event.ENTITY_DIALOGUE_ITERATE,
      handler: (data: { entityId: string; nodeId: NodeId; facing?: Direction }) =>
        handlers.dialogue.iterate(data.entityId, socket, world, data.nodeId, data.facing),
    },
    {
      event: Event.ENTITY_DIALOGUE_END,
      handler: (data: string) =>
        handlers.dialogue.end(data, socket, world),
    },
    /**
     * Items
     */
    {
      event: Event.ITEM_COLLECT,
      handler: (data: Item) => handlers.item.collect(data, socket, io, world),
    },
    /**
     * Farming
     */
    {
      event: Event.ENTITY_PLANT,
      handler: (data: any) => handlers.farming.plant(data, socket, io, world),
    },
    {
      event: Event.ENTITY_HARVEST,
      handler: (data: any) => handlers.farming.harvest(data, socket, io, world),
    },
    /**
     * Shared
     */
    {
      event: Event.HIT,
      handler: (data: Hit) => handlers.combat.hit(data, socket, io, world),
    },
    /**
     * Death
     */
    {
      event: Event.PLAYER_REVIVE,
      handler: (data: Revive) =>
        handlers.combat.revive(data, socket, io, world),
    },
    /**
     * Party
     */
    {
      event: Event.PARTY_CREATE,
      handler: () => handlers.party.create(socket, world),
    },
    {
      event: Event.PARTY_JOIN,
      handler: (data: string) => handlers.party.join(data, socket, world),
    },
    {
      event: Event.PARTY_LEAVE,
      handler: () => handlers.party.leave(socket, io, world),
    },
    {
      event: Event.PARTY_START,
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
