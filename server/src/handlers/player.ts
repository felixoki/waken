import { Socket } from "socket.io";
import { PlayerStore } from "../stores/PlayerStore.js";

export const player = {
  create: (socket: Socket, players: PlayerStore) => {
    players.add(socket.id, { id: socket.id });
    socket.broadcast.emit("player:joined", { id: socket.id });
  },
  delete: (socket: Socket, players: PlayerStore) => {
    players.remove(socket.id);
    socket.broadcast.emit("player:left", { id: socket.id });
  }
};
