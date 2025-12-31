import { Socket } from "socket.io";
import { PlayerStore } from "../stores/Player.js";
import { randomInt, randomUUID } from "crypto";
import { PlayerHit, PlayerInput } from "../types.js";

export const player = {
  create: (socket: Socket, players: PlayerStore) => {
    const isHost = !players.getAll().length;

    const player = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
      socketId: socket.id,
      isHost,
    };
    players.add(player.id, player);

    const others = players.getAll().filter((p) => p.id !== player.id);

    socket.emit("player:create:local", player);
    socket.emit("player:create:others", others);
    
    socket.broadcast.emit("player:create", player);
  },

  delete: (socket: Socket, players: PlayerStore) => {
    const player = players.getBySocketId(socket.id);
    if (!player) return;

    players.remove(player.id);
    socket.broadcast.emit("player:left", { id: player.id });
  },

  input: (data: PlayerInput, socket: Socket, players: PlayerStore) => {
    const player = players.get(data.id);
    if (!player) return;

    players.update(data.id, {
      ...player,
      ...{ x: data.x, y: data.y, state: data.state },
    });
    socket.broadcast.emit("player:input", data);
  },

  hit: (data: PlayerHit, _socket: Socket, _players: PlayerStore) => {
    // target is always a player
    // attacker is always an entity
    console.log("Player hit data received on server:", data);
  }
};
