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
    _socket: Socket | null,
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

    const key = world.chunks.toChunkKey(config.map, config.x, config.y);
    handlers.broadcast.entity(
      io,
      world,
      Event.ENTITY_CREATE,
      config,
      config.map,
      key,
      partyId,
    );

    return config;
  },

  remove: (
    id: string,
    event: Event.ENTITY_DESTROY | Event.ENTITY_DESPAWN,
    _socket: Socket | null,
    io: Server,
    world: World,
    _includeSender = true,
  ) => {
    const target = world.entities.get(id);
    if (!target) return;

    const partyId = world.chunks.getPartyByEntity(id);
    const chunk = world.chunks.getChunkByEntity(id);

    world.chunks.removeEntity(id);
    world.entities.remove(id);

    handlers.broadcast.entity(io, world, event, id, target.map, chunk, partyId);
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

    const chunk = world.chunks.getChunkByEntity(data);
    const partyId = world.chunks.getPartyByEntity(data);

    world.chunks.removeEntity(data);
    world.entities.remove(data);

    handlers.broadcast.entity(
      io,
      world,
      Event.ENTITY_PICKUP,
      data,
      entity.map,
      chunk,
      partyId,
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

    const room = world.chunks.getChunkByEntity(data.id);

    world.chunks.removeEntity(data.id);
    world.entities.remove(data.id);

    const felled = { id: data.id, felled: true };
    if (room)
      handlers.broadcast.room(
        socket,
        io,
        `chunk:${room}`,
        Event.EXTRACT_MATERIAL,
        felled,
      );
    else socket.emit(Event.EXTRACT_MATERIAL, felled);

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
