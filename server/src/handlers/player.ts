import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { Direction, Input, MapName, Transition } from "../types/index.js";
import { configs } from "../configs/index.js";
import { World } from "../World.js";
import { party } from "./party.js";
import { handlers } from "./index.js";

export const player = {
  create: (io: Server, socket: Socket, world: World) => {
    let player = world.players.getBySocketId(socket.id);

    if (!player) {
      const isHost = !world.players.all.length;
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

      world.players.add(player.id, player);
      socket.join(`map:${player.map}`);
    }

    socket.emit("player:create:local", player);
    socket.emit(
      "player:create:others",
      world.players.getOthersOnMap(player.id, player.map),
    );

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      player.map,
      player.x,
      player.y,
    );
    handlers.chunks.sync.host(io, world);

    socket.to(`map:${player.map}`).emit("player:create", player);
    socket.emit("party:list", world.parties.getLobbies());
    socket.emit("world:time", world.getTime());
  },

  delete: (io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    party.leave(socket, io, world);
    handlers.chunks.clear(socket, world, player.id);

    const isHost = player.isHost;
    world.players.remove(player.id);

    if (isHost && world.players.all.length) {
      const host =
        world.players.all.find((p) => p.map === MapName.REALM) ??
        world.players.all[0];
      world.players.update(host.id, { ...host, isHost: true });

      const hostSocket = io.sockets.sockets.get(host.socketId);
      hostSocket?.emit("player:host:transfer");
      
      handlers.chunks.sync.host(io, world);
    }

    socket.broadcast.emit("player:leave", { id: player.id });
  },

  input: (data: Input, io: Server, socket: Socket, world: World) => {
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

    const { activated, deactivated } = handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      player.map,
      data.x,
      data.y,
    );

    if (activated.length || deactivated.length)
      handlers.chunks.sync.host(io, world);
  },

  transition: (data: Transition, io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const prev = { map: player.map };

    handlers.chunks.clear(socket, world, player.id);

    world.players.update(player.id, {
      ...player,
      map: data.to,
      x: data.x,
      y: data.y,
    });

    socket.leave(`map:${prev.map}`);
    socket.join(`map:${data.to}`);
    socket.to(`map:${prev.map}`).emit("player:leave", { id: player.id });

    const updated = world.players.get(player.id);
    const others = world.players.getOthersOnMap(player.id, data.to);

    socket.emit("player:transition", updated);
    socket.emit("player:create:others", others);

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      data.to,
      data.x,
      data.y,
    );
    handlers.chunks.sync.host(io, world);

    socket.to(`map:${data.to}`).emit("player:create", updated);

    const party = world.parties.getByPlayerId(player.id);

    if (party && prev.map === MapName.REALM)
      handlers.party.cleanup(io, socket, world, party.id);
  },
};
