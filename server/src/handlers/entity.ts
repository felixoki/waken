import { Socket } from "socket.io";
import { EntityConfig, Input, Spot } from "../types";
import { randomUUID } from "crypto";
import { World } from "../World";

export const entity = {
  create: (data: Omit<EntityConfig, "id">, socket: Socket, world: World) => {
    const config = {
      ...data,
      id: randomUUID(),
      createdAt: data.createdAt ?? Date.now(),
    };

    world.entities.add(config.id, config);
    world.chunks.registerEntity(config.id, config.map, config.x, config.y);

    const key = world.chunks.getChunkByEntity(config.id);
    if (key) socket.to(`chunk:${key}`).emit("entity:create", config);
    socket.emit("entity:create", config);
  },

  input: (data: Partial<Input>, socket: Socket, world: World) => {
    const entity = world.entities.get(data.id!);
    if (!entity) return;

    entity.x = data.x ?? entity.x;
    entity.y = data.y ?? entity.y;

    world.chunks.moveEntity(data.id!, entity.map, entity.x, entity.y);

    const key = world.chunks.getChunkByEntity(data.id!);
    if (!key || !world.chunks.isChunkActive(key)) return;

    socket.to(`chunk:${key}`).emit("entity:input", data);
  },

  pickup: (data: string, socket: Socket, world: World) => {
    const entity = world.entities.get(data);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(entity.id);

    world.chunks.removeEntity(entity.id);
    world.entities.remove(entity.id);

    const player = world.players.getBySocketId(socket.id);
    const party = player && world.parties.getByPlayerId(player.id);

    if (party) socket.to(`party:${party.id}`).emit("entity:destroy", entity.id);
    else if (key) socket.to(`chunk:${key}`).emit("entity:destroy", entity.id);
  },

  spot: (data: Spot, socket: Socket, world: World) => {
    const entity = world.entities.get(data.entityId);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(data.entityId);
    if (!key || !world.chunks.isChunkActive(key)) return;

    socket.to(`chunk:${key}`).emit("entity:spotted:player", data);
    socket.emit("entity:spotted:player", data);
  },

  flee: (data: string, socket: Socket, world: World) => {
    const entity = world.entities.get(data);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(entity.id);

    world.chunks.removeEntity(entity.id);
    world.entities.remove(entity.id);

    if (key) socket.to(`chunk:${key}`).emit("entity:despawn", entity.id);
    socket.emit("entity:despawn", entity.id);
  },
};
