import { Server, Socket } from "socket.io";
import { World } from "../World";
import { randomUUID } from "crypto";
import { EntityConfig, MapName, PartyStatus } from "../types";
import { generateBiome } from "../biomes";
import { BiomeName } from "../types/generation";
import { configs } from "../configs/index.js";
import { handlers } from ".";

export const party = {
  lives: (id: string, world: World): boolean => {
    const data = world.parties.get(id);
    if (!data) return true;

    return data.members.some((memberId) => {
      const member = world.players.get(memberId);
      return member && !member.isDead;
    });
  },

  wipe: (id: string, io: Server, world: World) => {
    const data = world.parties.get(id);
    if (!data) return;

    if (party.lives(id, world)) return;

    const village = configs.maps[MapName.VILLAGE];

    for (const memberId of data.members) {
      const member = world.players.get(memberId);
      if (!member) continue;

      const memberSocket = io.sockets.sockets.get(member.socketId);
      if (!memberSocket) continue;

      handlers.player.transfer(memberSocket, io, world, memberId, MapName.VILLAGE, village.spawn.x, village.spawn.y, {
        health: 100,
        isDead: false,
      }, data.members);

      memberSocket.emit("party:wipe");
    }

    const firstSocket = io.sockets.sockets.get(world.players.get(data.members[0])!.socketId);
    if (firstSocket) party.cleanup(firstSocket, world, data.id);
  },

  cleanup: (socket: Socket, world: World, id: string) => {
    const data = world.parties.get(id);
    if (!data || data.status !== PartyStatus.IN_GAME) return;

    const remaining = data.members.some((memberId) => {
      const member = world.players.get(memberId);
      return member?.map === MapName.REALM;
    });

    if (!remaining) {
      world.entities.getByMap(MapName.REALM).forEach((entity) => {
        world.chunks.removeEntity(entity.id);
        world.entities.remove(entity.id);
      });

      data.status = PartyStatus.LOBBY;
      world.clearAuthority(MapName.REALM);

      socket.to(`party:${data.id}`).emit("party:update", data);
    }
  },

  broadcast: (socket: Socket, world: World) => {
    const list = world.parties.getLobbies();
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

  leave: (socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.getByPlayerId(player.id);
    if (!data) return;

    data.members = data.members.filter((id) => id !== player.id);

    socket.leave(`party:${data.id}`);
    socket.emit("party:leave");

    if (data.status === PartyStatus.IN_GAME && player.map === MapName.REALM) {
      const village = configs.maps[MapName.VILLAGE];

      handlers.player.transfer(socket, io, world, player.id, MapName.VILLAGE, village.spawn.x, village.spawn.y, {
        isDead: false,
        health: 100,
      });

      socket.emit("player:inventory:wipe");

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

    socket.emit("party:start:loading");
    socket.to(`party:${data.id}`).emit("party:start:loading");

    const biome = generateBiome(BiomeName.FOREST, seed);

    if (!biome) return;

    data.status = PartyStatus.IN_GAME;

    const entities: EntityConfig[] = biome.entities.map((entity) => {
      const id = randomUUID();
      const config: EntityConfig = {
        id,
        map: MapName.REALM,
        name: entity.name,
        x: entity.x,
        y: entity.y,
        health: 100,
        createdAt: Date.now(),
      };

      world.entities.add(id, config);
      world.chunks.registerEntity(id, config.map, config.x, config.y);
      return config;
    });

    for (const id of data.members) {
      const member = world.players.get(id);
      if (!member) continue;

      const memberSocket = io.sockets.sockets.get(member.socketId);
      if (!memberSocket) continue;

      const prev = member.map;
      handlers.chunks.clear(memberSocket, world, id);

      const nextId = world.transferAuthority(prev, id, data.members);

      if (nextId) {
        const nextSocket = io.sockets.sockets.get(world.players.get(nextId)!.socketId);
        nextSocket?.emit("player:authority", true);
      }

      world.players.update(id, {
        map: MapName.REALM,
        x: biome.spawn.x,
        y: biome.spawn.y,
        isAuthority: false,
      });

      memberSocket.leave(`map:${prev}`);
      memberSocket.join(`map:${MapName.REALM}`);
      memberSocket.to(`map:${prev}`).emit("player:leave", member.id);

      handlers.chunks.sync.player(
        memberSocket,
        world,
        id,
        MapName.REALM,
        biome.spawn.x,
        biome.spawn.y,
      );
    }

    world.setAuthority(MapName.REALM, data.members[0]);
    world.players.update(data.members[0], { isAuthority: true });

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
