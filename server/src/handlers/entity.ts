import { Socket } from "socket.io";
import { EntityName, EntityPickup, Input, MapName, Spot } from "../types";
import { randomInt, randomUUID } from "crypto";
import { World } from "../World";

export const entity = {
  create: (socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || !player.isHost) return;

    const config = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
      map: MapName.VILLAGE,
      name: EntityName.ORC1,
      health: 100,
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

  pickup: (data: EntityPickup, socket: Socket, world: World) => {
    const entity = world.entities.get(data.id);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(entity.id);

    world.chunks.removeEntity(entity.id);
    world.entities.remove(entity.id);

    if (key)
      socket.to(`chunk:${key}`).emit("entity:destroy", { id: entity.id });
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

    if (key)
      socket.to(`chunk:${key}`).emit("entity:despawn", { id: entity.id });
    socket.emit("entity:despawn", { id: entity.id });
  },
};
