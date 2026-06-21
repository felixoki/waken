import { Server, Socket } from "socket.io";
import { EntityName, Event, Item, seeds } from "../types";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs";

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

    const party = world.parties.getByPlayerId(player.id);
    const partyId = configs.maps[player.map].isInstanced ? party?.id : undefined;

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
      partyId,
    );
  },

  harvest: (
    data: { entityId: string; yield: Item[] },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    handlers.entity.remove(
      data.entityId,
      Event.ENTITY_DESPAWN,
      socket,
      io,
      world,
      false,
    );

    for (const item of data.yield)
      player.inventory = handlers.storage.add(player.inventory, item);

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },

  water: (data: { id: string }, socket: Socket, _io: Server, world: World) => {
    const target = world.entities.get(data.id);
    if (!target) return;

    world.entities.update(data.id, {
      crop: { ...target.crop, watered: true, wateredAt: Date.now() },
    });

    handlers.broadcast.toChunk(
      socket,
      world,
      Event.ENTITY_WATER,
      data,
      target.map,
      target.x,
      target.y,
    );
  },

  grow: (
    data: { id: string; stage: number },
    _socket: Socket,
    _io: Server,
    world: World,
  ) => {
    const target = world.entities.get(data.id);
    if (!target) return;

    world.entities.update(data.id, {
      crop: { ...target.crop, growth: data.stage, watered: false },
    });
  },

  wither: (data: { id: string }, socket: Socket, io: Server, world: World) => {
    handlers.entity.remove(
      data.id,
      Event.ENTITY_DESPAWN,
      socket,
      io,
      world,
      true,
    );
  },
};
