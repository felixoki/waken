import { Server, Socket } from "socket.io";
import { DestroyBuildData, Event, Item, PlaceBuildData } from "../types";
import { BUILD_MAPS } from "../globals";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs";

export const build = {
  place: (data: PlaceBuildData, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (!BUILD_MAPS.has(data.map) || player.map !== data.map) return;

    const config = configs.buildable[data.name];
    if (!config) return;

    const items: Item[] = config.cost.map((c) => ({
      name: c.item,
      quantity: c.quantity,
      stackable: true,
    }));
    for (const item of items)
      if (!handlers.storage.has(player.inventory, item)) return;

    for (const item of items)
      player.inventory = handlers.storage.remove(player.inventory, item);
    socket.emit(Event.INVENTORY_SYNC, player.inventory);

    handlers.entity.create(
      {
        name: data.name,
        map: data.map,
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

  demolish: (
    data: DestroyBuildData,
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (!BUILD_MAPS.has(data.map) || player.map !== data.map) return;

    const target = world.entities.get(data.id);
    if (!target || target.map !== data.map || !configs.buildable[target.name])
      return;

    handlers.entity.remove(
      target.id,
      Event.ENTITY_DESTROY,
      socket,
      io,
      world,
      true,
    );
  },
};
