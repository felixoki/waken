import { Socket } from "socket.io";
import { PlayerStore } from "../stores/Player.js";
import { randomInt, randomUUID } from "crypto";
import { PlayerHit, Input, MapName } from "../types.js";
import { EntityStore } from "../stores/Entity.js";

export const player = {
  create: (socket: Socket, players: PlayerStore, entities: EntityStore) => {
    const isHost = !players.getAll().length;

    const player = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
      socketId: socket.id,
      map: MapName.VILLAGE,
      isHost,
    };
    players.add(player.id, player);

    const others = players.getAll().filter((p) => p.id !== player.id);

    socket.emit("player:create:local", player);
    socket.emit("player:create:others", others);
    socket.emit("entity:create:all", entities.getAll());

    socket.broadcast.emit("player:create", player);
  },

  delete: (socket: Socket, players: PlayerStore) => {
    const player = players.getBySocketId(socket.id);
    if (!player) return;

    players.remove(player.id);
    socket.broadcast.emit("player:left", { id: player.id });
  },

  input: (data: Input, socket: Socket, players: PlayerStore) => {
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
  },
};
