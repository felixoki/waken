import { Socket } from "socket.io";
import { EntityName, Item, seeds } from "../types";
import { World } from "../World";
import { entity } from "./entity.js";

export const farming = {
  plant: (
    data: { seed: EntityName; x: number; y: number },
    socket: Socket,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const crop = seeds[data.seed];
    if (!crop) return;

    entity.create(
      {
        name: crop,
        map: player.map,
        x: data.x,
        y: data.y,
        health: 1,
        createdAt: Date.now(),
      },
      socket,
      world,
    );
  },

  harvest: (
    data: { entityId: string; yield: Item[] },
    socket: Socket,
    world: World,
  ) => {
    world.entities.remove(data.entityId);
    socket.broadcast.emit("entity:despawn", data.entityId);

    for (const item of data.yield) world.items.add(item.name, item.quantity);

    const snapshot = world.economy.getSnapshot();

    socket.emit("economy:update", snapshot);
    socket.broadcast.emit("economy:update", snapshot);
  },
};
