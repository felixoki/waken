import { Socket } from "socket.io";
import { PlayerStore } from "../stores/Player.js";
import { randomInt, randomUUID } from "crypto";
import { Input, MapName } from "../types.js";
import { EntityStore } from "../stores/Entity.js";

export const player = {
  create: (socket: Socket, players: PlayerStore, entities: EntityStore) => {
    let player = players.getBySocketId(socket.id);

    if (!player) {
      const isHost = !players.getAll().length;

      player = {
        x: randomInt(0, 400),
        y: randomInt(0, 400),
        id: randomUUID(),
        socketId: socket.id,
        map: MapName.VILLAGE,
        health: 100,
        isHost,
      };

      players.add(player.id, player);
      socket.join(player.map);
    }

    const others = players
      .getByMap(player.map)
      .filter((p) => p.id !== player.id);

    socket.emit("player:create:local", player);
    socket.emit("player:create:others", others);
    socket.emit("entity:create:all", entities.getByMap(player.map));

    socket.to(player.map).emit("player:create", player);
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

  transition: (
    map: MapName,
    socket: Socket,
    players: PlayerStore
  ) => {
    const player = players.getBySocketId(socket.id);
    if (!player) return;

    const prev = player.map;
    const next = map;

    /**
     * We should specify these in the map configs later
     */
    const spawn = { x: randomInt(0, 400), y: randomInt(0, 400) };

    players.update(player.id, {
      ...player,
      map: next,
      x: spawn.x,
      y: spawn.y,
    });

    socket.leave(prev);
    socket.join(next);

    socket.to(prev).emit("player:left", { id: player.id });
    socket.emit("player:transition", next);
  },
};
