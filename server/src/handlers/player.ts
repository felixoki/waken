import { Socket } from "socket.io";
import { randomInt, randomUUID } from "crypto";
import { Input, MapName } from "../types.js";
import { InstanceManager } from "../managers/Instance.js";

export const player = {
  create: (socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);

    if (!instance) {
      socket.emit("player:error", { message: "No instance found for player" });
      return;
    }

    const players = instance.players;
    const entities = instance.entities;

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
      socket.join(`game:${instance.id}:${player.map}`);
    }

    const others = players
      .getByMap(player.map)
      .filter((p) => p.id !== player.id);

    socket.emit("player:create:local", player);
    socket.emit("player:create:others", others);
    socket.emit("entity:create:all", entities.getByMap(player.map));

    socket
      .to(`game:${instance.id}:${player.map}`)
      .emit("player:create", player);
  },

  delete: (socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const player = instance.players.getBySocketId(socket.id);
    if (!player) return;

    instance.players.remove(player.id);
    instances.removeConnection(socket.id);

    socket.broadcast.emit("player:left", { id: player.id });
  },

  input: (data: Input, socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const player = instance.players.get(data.id);
    if (!player) return;

    instance.players.update(data.id, {
      ...player,
      ...{ x: data.x, y: data.y, state: data.state },
    });
    socket.broadcast.emit("player:input", data);
  },

  transition: (map: MapName, socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const player = instance.players.getBySocketId(socket.id);
    if (!player) return;

    const prev = player.map;
    const next = map;

    /**
     * We should specify these in the map configs later
     */
    const spawn = { x: randomInt(0, 400), y: randomInt(0, 400) };

    instance.players.update(player.id, {
      ...player,
      map: next,
      x: spawn.x,
      y: spawn.y,
    });

    socket.leave(`game:${instance.id}:${prev}`);
    socket.join(`game:${instance.id}:${next}`);

    socket
      .to(`game:${instance.id}:${prev}`)
      .emit("player:left", { id: player.id });
    socket.emit("player:transition", next);
  },
};
