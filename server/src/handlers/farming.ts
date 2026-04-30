import { Server, Socket } from "socket.io";
import { EntityName, Event, Item, seeds } from "../types";
import { World } from "../World";
import { handlers } from ".";

export const farming = {
  plant: (
    data: { seed: EntityName; x: number; y: number },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const crop = seeds[data.seed];
    if (!crop) return;

    handlers.entity.create(
      {
        name: crop,
        map: player.map,
        x: data.x,
        y: data.y,
        health: 1,
        maxHealth: 1,
        isLocked: false,
      },
      socket,
      io,
      world,
    );
  },

  harvest: (
    data: { entityId: string; yield: Item[] },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);

    handlers.entity.remove(
      data.entityId,
      Event.ENTITY_DESPAWN,
      socket,
      io,
      world,
      false,
    );

    if (player) {
      for (const item of data.yield)
        player.inventory = handlers.storage.add(player.inventory, item);

      socket.emit(Event.INVENTORY_SYNC, player.inventory);
    }
  },
};
