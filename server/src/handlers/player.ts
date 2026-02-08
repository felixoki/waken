import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { Direction, Input, MapName, Transition } from "../types.js";
import { InstanceManager } from "../managers/Instance.js";
import { configs } from "../configs/index.js";

export const player = {
  create: (socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);

    if (!instance) return;

    const players = instance.players;
    const entities = instance.entities;

    let player = players.getBySocketId(socket.id);

    if (!player) {
      const isHost = !players.getAll().length;
      const map = configs.maps[MapName.VILLAGE];

      player = {
        x: map.spawn.x,
        y: map.spawn.y,
        direction: Direction.DOWN,
        id: randomUUID(),
        socketId: socket.id,
        map: map.id,
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
    socket.emit("entity:create:all", entities.getAll());

    socket
      .to(`game:${instance.id}:${player.map}`)
      .emit("player:create", player);
  },

  delete: (io: Server, socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const player = instance.players.getBySocketId(socket.id);
    if (!player) return;

    const isHost = player.isHost;

    instance.players.remove(player.id);
    instances.removeConnection(socket.id);

    const others = instance.players.getAll();

    if (isHost && others.length) {
      const host = others[0];
      instance.players.update(host.id, { ...host, isHost: true });

      const hostSocket = io.sockets.sockets.get(host.socketId);
      hostSocket?.emit("player:host:transfer");
    }

    if (!others.length) instances.remove(instance.id);

    socket.broadcast.emit("player:left", { id: player.id });
  },

  input: (data: Input, socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const player = instance.players.get(data.id);
    if (!player) return;

    instance.players.update(data.id, {
      ...player,
      ...{
        x: data.x,
        y: data.y,
        state: data.state,
        ...(data.direction && { direction: data.direction }),
        isRunning: data.isRunning,
      },
    });
    socket.broadcast.emit("player:input", data);
  },

  transition: (
    data: Transition,
    socket: Socket,
    instances: InstanceManager,
  ) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const player = instance.players.getBySocketId(socket.id);
    if (!player) return;

    const prev = player.map;
    const next = data.to;

    instance.players.update(player.id, {
      ...player,
      map: next,
      x: data.x,
      y: data.y,
    });

    socket.leave(`game:${instance.id}:${prev}`);
    socket.join(`game:${instance.id}:${next}`);

    socket
      .to(`game:${instance.id}:${prev}`)
      .emit("player:left", { id: player.id });

    const updated = instance.players.get(player.id);
    const others = instance.players
      .getByMap(next)
      .filter((p) => p.id !== player.id);

    socket.emit("player:transition", updated);
    socket.emit("player:create:others", others);

    socket.to(`game:${instance.id}:${next}`).emit("player:create", updated);
  },
};
