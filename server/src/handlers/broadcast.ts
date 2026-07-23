import { Server, Socket } from "socket.io";
import { Event, MapName } from "../types";
import { World } from "../World";
import { configs } from "../configs";

export const broadcast = {
  room: (
    socket: Socket | null,
    io: Server,
    room: string,
    event: Event,
    data: any,
    includeSender = true,
  ) => {
    if (socket) {
      socket.to(room).emit(event, data);
      if (includeSender) socket.emit(event, data);
    } else io.to(room).emit(event, data);
  },

  entity: (
    io: Server,
    world: World,
    event: Event,
    data: any,
    map: MapName,
    chunkKey: string | null | undefined,
    partyId?: string,
  ) => {
    const instanced = configs.maps[map].isInstanced && !!partyId;
    const rooms: string[] = [];

    if (instanced) rooms.push(`party:${partyId}`);
    else if (chunkKey) rooms.push(`chunk:${chunkKey}`);

    if (world.authority.get(map, instanced ? partyId : undefined))
      rooms.push(world.authority.room(map, instanced ? partyId : undefined));

    if (!rooms.length) return;

    if (rooms.length === 1) io.to(rooms[0]).emit(event, data);
    else io.to(rooms[0]).to(rooms[1]).emit(event, data);
  },

  toChunk: (
    socket: Socket,
    world: World,
    event: Event,
    data: any,
    map: MapName,
    x: number,
    y: number,
    includeSender = true,
  ) => {
    const key = world.chunks.toChunkKey(map, x, y);
    if (key) socket.to(`chunk:${key}`).emit(event, data);
    if (includeSender) socket.emit(event, data);
  },

  toParty: (
    socket: Socket,
    io: Server,
    partyId: string,
    event: Event,
    data: any,
    includeSender = true,
  ) => {
    if (includeSender) {
      io.to(`party:${partyId}`).emit(event, data);
      return;
    }
    socket.to(`party:${partyId}`).emit(event, data);
  },

  economy: (io: Server, world: World) => {
    const snapshot = world.economy.getSnapshot();
    io.emit(Event.ECONOMY_UPDATE, snapshot);
  },

  store: (io: Server, world: World) => {
    io.emit(Event.STORE_SYNC, world.items.snapshot());
  },
};
