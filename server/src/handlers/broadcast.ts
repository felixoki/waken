import { Server, Socket } from "socket.io";
import { Event, MapName } from "../types";
import { World } from "../World";

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
