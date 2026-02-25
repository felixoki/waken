import { Server, Socket } from "socket.io";
import { World } from "../World";
import { randomUUID } from "crypto";
import { EntityConfig, MapName, PartyStatus } from "../types";
import { generateBiome } from "../biomes";
import { BiomeName } from "../types/generation";
import { configs } from "../configs/index.js";

export const party = {
  cleanup: (socket: Socket, world: World, partyId: string) => {
    const data = world.parties.get(partyId);
    if (!data || data.status !== PartyStatus.IN_GAME) return;

    const remaining = data.members.some((id) => {
      const member = world.players.get(id);
      return member?.map === MapName.REALM;
    });

    if (!remaining) {
      world.entities.getByMap(MapName.REALM).forEach((entity) => {
        world.entities.remove(entity.id);
      });

      data.status = PartyStatus.LOBBY;

      socket.to(`party:${data.id}`).emit("party:update", data);
      socket.emit("party:update", data);
    }
  },

  broadcast: (socket: Socket, world: World) => {
    const list = world.parties.all.filter(
      (p) => p.status === PartyStatus.LOBBY,
    );
    const maps = Object.values(MapName).filter((m) => m !== MapName.REALM);

    socket.emit("party:list", list);
    for (const map of maps) socket.to(`map:${map}`).emit("party:list", list);
  },

  create: (socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const id = randomUUID();
    const data = {
      id,
      leader: player.id,
      members: [player.id],
      status: PartyStatus.LOBBY,
    };

    world.parties.add(id, data);
    socket.join(`party:${id}`);
    socket.emit("party:create", data);

    party.broadcast(socket, world);
  },

  join: (id: string, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.get(id);

    if (!data || data.status !== PartyStatus.LOBBY) return;
    data.members.push(player.id);

    socket.join(`party:${id}`);
    socket.to(`party:${id}`).emit("party:update", data);
    socket.emit("party:update", data);

    party.broadcast(socket, world);
  },

  leave: (socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.getByPlayerId(player.id);
    if (!data) return;

    data.members = data.members.filter((id) => id !== player.id);
    socket.leave(`party:${data.id}`);
    socket.emit("party:leave");

    if (data.status === PartyStatus.IN_GAME && player.map === MapName.REALM) {
      const village = configs.maps[MapName.VILLAGE];

      world.players.update(player.id, {
        map: MapName.VILLAGE,
        x: village.spawn.x,
        y: village.spawn.y,
      });

      socket.leave(`map:${MapName.REALM}`);
      socket.join(`map:${MapName.VILLAGE}`);
      socket.to(`map:${MapName.REALM}`).emit("player:leave", { id: player.id });

      const updated = world.players.get(player.id);
      const others = world.players
        .getByMap(MapName.VILLAGE)
        .filter((p) => p.id !== player.id);

      socket.emit("player:transition", updated);
      socket.emit("player:create:others", others);
      socket.to(`map:${MapName.VILLAGE}`).emit("player:create", updated);

      party.cleanup(socket, world, data.id);
    }

    if (!data.members.length) {
      world.parties.remove(data.id);
      party.broadcast(socket, world);
      return;
    }

    if (data.leader === player.id) data.leader = data.members[0];

    socket.to(`party:${data.id}`).emit("party:update", data);
    party.broadcast(socket, world);
  },

  start: (socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.getByPlayerId(player.id);
    if (!data || data.leader !== player.id || data.status !== PartyStatus.LOBBY)
      return;

    const seed = `${data.id}-${Date.now()}`;
    const biome = generateBiome(BiomeName.FOREST, seed);

    if (!biome) return;

    data.status = PartyStatus.IN_GAME;
    const entities: EntityConfig[] = [];

    for (const entity of biome.entities) {
      const id = randomUUID();
      const config: EntityConfig = {
        id,
        map: MapName.REALM,
        name: entity.name,
        x: entity.x,
        y: entity.y,
        health: 100,
      };

      world.entities.add(id, config);
      entities.push(config);
    }

    for (const id of data.members) {
      const member = world.players.get(id);
      if (!member) continue;

      const memberSocket = io.sockets.sockets.get(member.socketId);
      if (!memberSocket) continue;

      const prev = member.map;

      world.players.update(id, {
        map: MapName.REALM,
        x: biome.spawn.x,
        y: biome.spawn.y,
      });

      memberSocket.leave(`map:${prev}`);
      memberSocket.join(`map:${MapName.REALM}`);
      memberSocket.to(`map:${prev}`).emit("player:leave", { id: member.id });
    }

    const players = data.members
      .map((id) => world.players.get(id))
      .filter(Boolean);

    const payload = {
      tilemap: biome.tilemap,
      spawn: biome.spawn,
      entities,
      players,
    };

    socket.emit("party:start", payload);
    socket.to(`party:${data.id}`).emit("party:start", payload);

    party.broadcast(socket, world);
  },
};
