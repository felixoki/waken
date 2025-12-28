import { Socket } from "socket.io";
import { PlayerStore } from "../stores/PlayerStore.js";
import { randomInt, randomUUID } from "crypto";

export const player = {
  create: (socket: Socket, players: PlayerStore) => {
    const player = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
      socketId: socket.id,
    };
    players.add(player.id, player);
    socket.emit("player:create:local", player);
    socket.broadcast.emit("player:create", player);
  },
  delete: (socket: Socket, players: PlayerStore) => {
    players.remove(socket.id);
    socket.broadcast.emit("player:left", { id: socket.id });
  },
};
