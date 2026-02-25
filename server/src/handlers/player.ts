import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import {
  Direction,
  Input,
  MapName,
  PartyStatus,
  Transition,
} from "../types/index.js";
import { configs } from "../configs/index.js";
import { World } from "../World.js";
import { party } from "./party.js";

export const player = {
  create: (socket: Socket, world: World) => {
    const players = world.players;
    const entities = world.entities;

    let player = players.getBySocketId(socket.id);

    if (!player) {
      const isHost = !players.all.length;
      const map = configs.maps[MapName.VILLAGE];

      player = {
        x: map.spawn.x,
        y: map.spawn.y,
        facing: Direction.DOWN,
        id: randomUUID(),
        socketId: socket.id,
        map: map.id,
        health: 100,
        isHost,
      };

      players.add(player.id, player);
      socket.join(`map:${player.map}`);
    }

    const others = players
      .getByMap(player.map)
      .filter((p) => p.id !== player.id);

    socket.emit("player:create:local", player);
    socket.emit("player:create:others", others);
    socket.emit("entity:create:all", entities.getByMap(player.map));

    socket.to(`map:${player.map}`).emit("player:create", player);

    const lobbies = world.parties.all.filter(
      (p) => p.status === PartyStatus.LOBBY,
    );
    socket.emit("party:list", lobbies);
  },

  delete: (io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    party.leave(socket, world);

    const isHost = player.isHost;
    world.players.remove(player.id);
    const others = world.players.all;

    if (isHost && others.length) {
      const host = others[0];
      world.players.update(host.id, { ...host, isHost: true });

      const hostSocket = io.sockets.sockets.get(host.socketId);
      hostSocket?.emit("player:host:transfer");
    }

    socket.broadcast.emit("player:leave", { id: player.id });
  },

  input: (data: Input, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    world.players.update(data.id, {
      ...player,
      ...{
        x: data.x,
        y: data.y,
        state: data.state,
        ...(data.facing && { facing: data.facing }),
        isRunning: data.isRunning,
      },
    });
    socket.broadcast.emit("player:input", data);
  },

  transition: (data: Transition, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const prev = player.map;
    const next = data.to;

    world.players.update(player.id, {
      ...player,
      map: next,
      x: data.x,
      y: data.y,
    });

    socket.leave(`map:${prev}`);
    socket.join(`map:${next}`);

    socket.to(`map:${prev}`).emit("player:leave", { id: player.id });

    const updated = world.players.get(player.id);
    const others = world.players
      .getByMap(next)
      .filter((p) => p.id !== player.id);

    socket.emit("player:transition", updated);
    socket.emit("player:create:others", others);
    socket.emit("entity:create:all", world.entities.getByMap(next));

    socket.to(`map:${next}`).emit("player:create", updated);

    const lobby = world.parties.getByPlayerId(player.id);
    if (lobby && prev === MapName.REALM) party.cleanup(socket, world, lobby.id);
  },
};
