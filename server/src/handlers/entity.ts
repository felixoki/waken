import { Socket } from "socket.io";
import { EntityName, EntityPickup, Input, MapName, Spot } from "../types";
import { randomInt, randomUUID } from "crypto";
import { World } from "../World";

export const entity = {
  create: (socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || !player.isHost) return;

    const entity = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
      map: MapName.VILLAGE,
      name: EntityName.ORC1,
      health: 100,
    };

    world.entities.add(entity.id, entity);

    socket.to(`map:${entity.map}`).emit("entity:create", entity);
    socket.emit("entity:create", entity);
  },

  input: (data: Partial<Input>, socket: Socket, world: World) => {
    const entity = world.entities.get(data.id!);
    if (!entity) return;

    entity.x = data.x ?? entity.x;
    entity.y = data.y ?? entity.y;

    socket.to(`map:${entity.map}`).emit("entity:input", data);
  },

  pickup: (data: EntityPickup, socket: Socket, world: World) => {
    const entity = world.entities.get(data.id);
    if (!entity) return;

    world.entities.remove(data.id);

    socket.to(`map:${entity.map}`).emit("entity:destroy", { id: data.id });
  },

  spot: (data: Spot, socket: Socket, world: World) => {
    const entity = world.entities.get(data.entityId);
    if (!entity) return;

    socket.to(`map:${entity.map}`).emit("entity:spotted:player", data);
    socket.emit("entity:spotted:player", data);
  },

  flee: (data: string, socket: Socket, world: World) => {
    const entity = world.entities.get(data);
    if (!entity) return;

    world.entities.remove(data);

    socket.to(`map:${entity.map}`).emit("entity:despawn", data);
    socket.emit("entity:despawn", data);
  }
};
