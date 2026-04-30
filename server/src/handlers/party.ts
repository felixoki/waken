import { Server, Socket } from "socket.io";
import { World } from "../World";
import { randomUUID } from "crypto";
import { EntityConfig, Event, MapName, PartyStatus } from "../types";
import { BiomeName } from "../types/generation";
import { configs } from "../configs/index.js";
import { handlers } from ".";
import { MAX_HEALTH } from "../globals.js";

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

      handlers.player.transfer(
        memberSocket,
        io,
        world,
        memberId,
        MapName.VILLAGE,
        village.spawn.x,
        village.spawn.y,
        {
          health: MAX_HEALTH,
          isDead: false,
          inventory: new Array(20).fill(null),
        },
        data.members,
        data.id,
      );

      memberSocket.emit(Event.PARTY_WIPE);
    }

    const firstMember = world.players.get(data.members[0]);
    const firstSocket =
      firstMember && io.sockets.sockets.get(firstMember.socketId);
    if (firstSocket) party.cleanup(firstSocket, io, world, data.id);
  },

  cleanup: (socket: Socket, io: Server, world: World, id: string) => {
    const data = world.parties.get(id);
    if (!data || data.status !== PartyStatus.IN_GAME) return;

    const remaining = data.members.some((memberId) => {
      const member = world.players.get(memberId);
      return member?.map === MapName.REALM;
    });

    if (!remaining) {
      const entityIds = world.chunks.getEntitiesByPrefix(`realm:${data.id}`);

      for (const entityId of entityIds) {
        handlers.entity.remove(
          entityId,
          Event.ENTITY_DESTROY,
          socket,
          io,
          world,
        );
      }

      data.status = PartyStatus.LOBBY;
      world.authority.clear(MapName.REALM, data.id);

      socket.to(`party:${data.id}`).emit(Event.PARTY_UPDATE, data);
      party.broadcast(socket, world);
    }
  },

  broadcast: (socket: Socket, world: World) => {
    const list = world.parties.getLobbies();
    const maps = Object.values(MapName).filter((m) => m !== MapName.REALM);

    socket.emit(Event.PARTY_LIST, list);
    for (const map of maps)
      socket.to(`map:${map}`).emit(Event.PARTY_LIST, list);
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
    socket.emit(Event.PARTY_CREATE, data);

    party.broadcast(socket, world);
  },

  join: (id: string, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.get(id);

    if (!data || data.status !== PartyStatus.LOBBY) return;
    data.members.push(player.id);

    socket.join(`party:${id}`);
    socket.to(`party:${id}`).emit(Event.PARTY_UPDATE, data);
    socket.emit(Event.PARTY_UPDATE, data);

    party.broadcast(socket, world);
  },

  leave: (socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.getByPlayerId(player.id);
    if (!data) return;

    data.members = data.members.filter((id) => id !== player.id);

    socket.leave(`party:${data.id}`);
    socket.emit(Event.PARTY_LEAVE);

    if (data.status === PartyStatus.IN_GAME && player.map === MapName.REALM) {
      const village = configs.maps[MapName.VILLAGE];

      handlers.player.transfer(
        socket,
        io,
        world,
        player.id,
        MapName.VILLAGE,
        village.spawn.x,
        village.spawn.y,
        {
          isDead: false,
          health: MAX_HEALTH,
        },
        undefined,
        data.id,
      );

      socket.emit(Event.PLAYER_INVENTORY_WIPE);

      party.cleanup(socket, io, world, data.id);
    }

    if (!data.members.length) {
      world.parties.remove(data.id);
      party.broadcast(socket, world);
      return;
    }

    if (data.leader === player.id) data.leader = data.members[0];

    socket.to(`party:${data.id}`).emit(Event.PARTY_UPDATE, data);
    party.broadcast(socket, world);
  },

  start: async (socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.getByPlayerId(player.id);
    if (!data || data.leader !== player.id || data.status !== PartyStatus.LOBBY)
      return;

    const seed = `${data.id}-${Date.now()}`;

    socket.emit(Event.PARTY_START_LOADING);
    socket.to(`party:${data.id}`).emit(Event.PARTY_START_LOADING);

    const biome = await handlers.generation.start(BiomeName.FOREST, seed);

    if (!biome) return;

    data.status = PartyStatus.IN_GAME;

    const entities: EntityConfig[] = biome.entities.map((biomeEntity) => {
      const id = randomUUID();
      const maxHealth = configs.entities[biomeEntity.name]?.maxHealth ?? MAX_HEALTH;
      const config: EntityConfig = {
        id,
        map: MapName.REALM,
        name: biomeEntity.name,
        x: biomeEntity.x,
        y: biomeEntity.y,
        health: maxHealth,
        maxHealth,
        createdAt: Date.now(),
        isLocked: false,
      };

      world.entities.add(id, config);
      world.chunks.registerEntity(id, config.map, config.x, config.y, data.id);
      return config;
    });

    for (const id of data.members) {
      const member = world.players.get(id);
      if (!member) continue;

      const memberSocket = io.sockets.sockets.get(member.socketId);
      if (!memberSocket) continue;

      const prev = member.map;
      handlers.chunks.clear(memberSocket, world, id);

      const candidates = world.players
        .getByMap(prev)
        .filter((p) => !data.members.includes(p.id));
      handlers.authority.transfer(io, world, prev, id, candidates);

      world.players.update(id, {
        map: MapName.REALM,
        x: biome.spawn.x,
        y: biome.spawn.y,
        isAuthority: false,
      });

      memberSocket.leave(`map:${prev}`);
      memberSocket.join(`map:${MapName.REALM}`);
      memberSocket.to(`map:${prev}`).emit(Event.PLAYER_LEAVE, member.id);

      handlers.chunks.sync.player(
        memberSocket,
        world,
        id,
        MapName.REALM,
        biome.spawn.x,
        biome.spawn.y,
        io,
        data.id,
      );
    }

    world.authority.set(MapName.REALM, data.members[0], data.id);
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

    socket.emit(Event.PARTY_START, payload);
    socket.to(`party:${data.id}`).emit(Event.PARTY_START, payload);

    party.broadcast(socket, world);
  },
};
