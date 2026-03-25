import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { Direction, Input, MapName, Transition } from "../types/index.js";
import { configs } from "../configs/index.js";
import { World } from "../World.js";
import { party } from "./party.js";
import { handlers } from "./index.js";

export const player = {
  create: (socket: Socket, world: World) => {
    let player = world.players.getBySocketId(socket.id);

    if (!player) {
      const map = configs.maps[MapName.VILLAGE];
      const isAuthority = !world.getAuthority(map.id);

      player = {
        x: map.spawn.x,
        y: map.spawn.y,
        facing: Direction.DOWN,
        id: randomUUID(),
        socketId: socket.id,
        map: map.id,
        health: 100,
        mana: 100000,
        isAuthority,
      };

      world.players.add(player.id, player);
      socket.join(`map:${player.map}`);

      if (isAuthority) world.setAuthority(player.map, player.id);
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

    socket.to(`map:${player.map}`).emit("player:create", player);
    socket.emit("party:list", world.parties.getLobbies());
    socket.emit("world:time", world.getTime());
    socket.emit("economy:update", world.economy.getSnapshot());
  },

  delete: (io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    party.leave(socket, io, world);

    const keys = handlers.chunks.clear(socket, world, player.id);
    keys.forEach((key) => {
      socket.to(`chunk:${key}`).emit("player:leave", player.id);
    });

    const wasAuthority = world.getAuthority(player.map) === player.id;
    world.players.remove(player.id);

    if (wasAuthority) {
      const nextId = world.transferAuthority(player.map, player.id);

      if (nextId) {
        const nextSocket = io.sockets.sockets.get(
          world.players.get(nextId)!.socketId,
        );
        nextSocket?.emit("player:authority", true);
      }
    }
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

    const key = world.chunks.toChunkKey(player.map, data.x, data.y);
    socket.to(`chunk:${key}`).emit("player:input", data);

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      player.map,
      data.x,
      data.y,
    );
  },

  transition: (data: Transition, io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const prev = { map: player.map };

    handlers.chunks.clear(socket, world, player.id);

    const nextId = world.transferAuthority(prev.map, player.id);

    if (nextId) {
      const nextSocket = io.sockets.sockets.get(
        world.players.get(nextId)!.socketId,
      );
      nextSocket?.emit("player:authority", true);
    }

    const isAuthority = !world.getAuthority(data.to);

    world.players.update(player.id, {
      map: data.to,
      x: data.x,
      y: data.y,
      isAuthority,
    });

    if (isAuthority) world.setAuthority(data.to, player.id);

    socket.leave(`map:${prev.map}`);
    socket.join(`map:${data.to}`);
    socket.to(`map:${prev.map}`).emit("player:leave", player.id);

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

    socket.to(`map:${data.to}`).emit("player:create", updated);

    const party = world.parties.getByPlayerId(player.id);

    if (party && prev.map === MapName.REALM)
      handlers.party.cleanup(socket, world, party.id);
  },
};
