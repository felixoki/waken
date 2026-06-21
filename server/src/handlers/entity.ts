import { Server, Socket } from "socket.io";
import {
  ComponentName,
  EntityConfig,
  Event,
  Input,
  Item,
  Spot,
} from "../types";
import { randomUUID } from "crypto";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs";
import { DURATION_EXTRACTION_BOUNCE, EXTRACTION_DAMAGE } from "../globals";

export const entity = {
  create: (
    data: Omit<EntityConfig, "id" | "createdAt">,
    socket: Socket,
    io: Server,
    world: World,
    partyId?: string,
  ) => {
    const config = {
      ...data,
      id: randomUUID(),
      createdAt: Date.now(),
      isLocked: false,
    };

    world.entities.add(config.id, config);
    world.chunks.registerEntity(
      config.id,
      config.map,
      config.x,
      config.y,
      partyId,
    );

    if (partyId) {
      handlers.broadcast.toParty(
        socket,
        io,
        partyId,
        Event.ENTITY_CREATE,
        config,
      );
      return;
    }

    handlers.broadcast.toChunk(
      socket,
      world,
      Event.ENTITY_CREATE,
      config,
      config.map,
      config.x,
      config.y,
    );
  },

  remove: (
    id: string,
    event: Event.ENTITY_DESTROY | Event.ENTITY_DESPAWN,
    socket: Socket,
    io: Server,
    world: World,
    includeSender = true,
  ) => {
    const target = world.entities.get(id);
    if (!target) return;

    world.chunks.removeEntity(id);
    world.entities.remove(id);

    const player = world.players.getBySocketId(socket.id);
    const party = player && world.parties.getByPlayerId(player.id);

    if (party && configs.maps[player.map].isInstanced) {
      handlers.broadcast.toParty(
        socket,
        io,
        party.id,
        event,
        id,
        includeSender,
      );

      return;
    }

    handlers.broadcast.toChunk(
      socket,
      world,
      event,
      id,
      target.map,
      target.x,
      target.y,
      includeSender,
    );
  },

  input: (data: Partial<Input>, socket: Socket, world: World) => {
    const entity = world.entities.get(data.id!);
    if (!entity) return;

    entity.x = data.x ?? entity.x;
    entity.y = data.y ?? entity.y;

    world.chunks.moveEntity(data.id!, entity.map, entity.x, entity.y);

    const key = world.chunks.getChunkByEntity(data.id!);
    if (!key || !world.chunks.isChunkActive(key)) return;

    socket.to(`chunk:${key}`).emit(Event.ENTITY_INPUT, data);
  },

  pickup: (data: string, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    const entity = world.entities.get(data);

    if (!player || !entity) return;

    const stackable =
      configs.entities[entity.name]?.metadata?.stackable ?? false;
    const item: Item = { name: entity.name, quantity: 1, stackable };

    player.inventory = handlers.storage.add(player.inventory, item);
    socket.emit(Event.INVENTORY_SYNC, player.inventory);

    handlers.entity.remove(
      data,
      Event.ENTITY_DESTROY,
      socket,
      io,
      world,
      false,
    );
  },

  spot: (data: Spot, socket: Socket, world: World) => {
    const entity = world.entities.get(data.entityId);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(data.entityId);
    if (!key || !world.chunks.isChunkActive(key)) return;

    socket.to(`chunk:${key}`).emit(Event.ENTITY_SPOTTED_PLAYER, data);
    socket.emit(Event.ENTITY_SPOTTED_PLAYER, data);
  },

  flee: (data: string, socket: Socket, io: Server, world: World) => {
    entity.remove(data, Event.ENTITY_DESPAWN, socket, io, world);
  },

  extract: (data: { id: string }, socket: Socket, io: Server, world: World) => {
    const target = world.entities.get(data.id);
    if (!target) return;

    const definition = configs.entities[target.name];
    const extractable = definition?.components.find(
      (component) =>
        component.name === ComponentName.FELLABLE ||
        component.name === ComponentName.MINEABLE,
    );
    if (!extractable) return;

    const health = target.health - EXTRACTION_DAMAGE;

    if (health > 0) {
      world.entities.update(data.id, { health });

      handlers.broadcast.toChunk(
        socket,
        world,
        Event.EXTRACT_MATERIAL,
        data,
        target.map,
        target.x,
        target.y,
        false,
      );

      return;
    }

    entity.remove(data.id, Event.ENTITY_DESTROY, socket, io, world, false);
    socket.emit(Event.EXTRACT_MATERIAL, { id: data.id, felled: true });

    const drop = extractable.config.drop;

    const spawn = () => {
      for (let i = 0; i < drop.quantity; i++) {
        const jitter = drop.quantity > 1 ? 10 : 0;

        entity.create(
          {
            name: drop.name,
            map: target.map,
            x: target.x + (Math.random() * 2 - 1) * jitter,
            y: target.y + (Math.random() * 2 - 1) * jitter,
            health: 1,
            maxHealth: 1,
            isLocked: false,
          },
          socket,
          io,
          world,
        );
      }
    };

    setTimeout(spawn, DURATION_EXTRACTION_BOUNCE);
  },
};
