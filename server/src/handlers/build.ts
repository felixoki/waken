import { Server, Socket } from "socket.io";
import { DestroyBuildData, Event, PlaceBuildData } from "../types";
import { BUILD_MAPS, TILE_SIZE } from "../globals";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs";

export const build = {
  place: (data: PlaceBuildData, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (player.map !== data.map) return;

    const config = configs.buildable[data.name];
    if (!config || !config.maps.includes(data.map)) return;

    const canAfford = config.cost.every((c) =>
      world.items.has(c.item, c.quantity),
    );
    if (!canAfford) return;

    for (const c of config.cost) world.items.remove(c.item, c.quantity);
    handlers.broadcast.store(io, world);
    handlers.broadcast.economy(io, world);

    for (const id of data.clears ?? []) {
      const target = world.entities.get(id);

      if (
        !target ||
        target.map !== data.map ||
        !config.replaces?.includes(target.name) ||
        Math.abs(target.x - data.x) > TILE_SIZE * 2 ||
        Math.abs(target.y - data.y) > TILE_SIZE * 2
      )
        continue;

      handlers.entity.remove(id, Event.ENTITY_DESPAWN, socket, io, world);
    }

    handlers.entity.create(
      {
        name: data.name,
        map: data.map,
        x: data.x,
        y: data.y,
        health: 1,
        maxHealth: 1,
        isLocked: false,
        built: true,
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
    if (
      !target ||
      target.map !== data.map ||
      !target.built ||
      target.isLocked ||
      !configs.buildable[target.name]
    )
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
