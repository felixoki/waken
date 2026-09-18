import { Server, Socket } from "socket.io";
import { World } from "../World";
import { randomUUID } from "crypto";
import {
  EntityConfig,
  EntityName,
  Event,
  MapName,
  Party,
  PartyStatus,
  Transition,
} from "../types";
import { Landmark } from "../types/generation.js";
import { levels } from "../configs/levels.js";
import { configs } from "../configs/index.js";
import { handlers } from ".";
import { MAX_HEALTH, RELIC_CHANCE } from "../globals.js";
import { tryCatch } from "../utils/tryCatch.js";
import { MapLoader } from "../loaders/Map.js";

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

      const landing =
        handlers.sleep.landing(member, world) ??
        (configs.maps[member.map].isInstanced
          ? { map: MapName.VILLAGE, ...village.spawn }
          : { map: member.map, x: member.x, y: member.y });

      handlers.sleep.clear(memberId, world, io);

      world.relics.forfeit(member.inventory);

      handlers.player.transfer(
        memberSocket,
        io,
        world,
        memberId,
        landing.map,
        landing.x,
        landing.y,
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
      return member && configs.maps[member.map].isInstanced;
    });

    if (!remaining) {
      const map = levels[data.depth]?.map ?? MapName.FOREST;
      const entityIds = world.chunks.getEntitiesByPrefix(
        `${map}:${data.id}`,
      );

      handlers.sublevel.teardown(entityIds, socket, io, world);

      for (const entityId of entityIds)
        handlers.entity.remove(
          entityId,
          Event.ENTITY_DESTROY,
          socket,
          io,
          world,
        );

      data.status = PartyStatus.LOBBY;
      data.unlocked = 0;
      data.ready = [];
      handlers.authority.release(io, world, map, data.id);

      io.to(`party:${data.id}`).emit(Event.PARTY_UPDATE, data);
      party.broadcast(socket, world);
    }
  },

  broadcast: (socket: Socket, world: World) => {
    const list = world.parties.getLobbies();
    const maps = Object.values(MapName).filter(
      (m) => !configs.maps[m].isInstanced,
    );

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
      ready: [],
      status: PartyStatus.LOBBY,
      depth: 0,
      unlocked: 0,
    };

    world.parties.add(id, data);
    handlers.sleep.roster(data, world);

    socket.join(`party:${id}`);
    socket.emit(Event.PARTY_CREATE, data);

    party.broadcast(socket, world);
  },

  join: (id: string, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const existing = world.parties.getByPlayerId(player.id);
    if (existing) return;

    const data = world.parties.get(id);

    if (!data || data.status !== PartyStatus.LOBBY) return;
    world.parties.addMember(id, player.id);
    handlers.sleep.roster(data, world);

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

    world.parties.removeMember(data.id, player.id);
    handlers.sleep.roster(data, world);

    socket.leave(`party:${data.id}`);
    socket.emit(Event.PARTY_LEAVE);

    if (
      data.status === PartyStatus.IN_GAME &&
      configs.maps[player.map].isInstanced
    ) {
      const village = configs.maps[MapName.VILLAGE];
      const landing =
        handlers.sleep.landing(player, world) ??
        { map: MapName.VILLAGE, ...village.spawn };

      handlers.sleep.clear(player.id, world, io);

      world.relics.forfeit(player.inventory);

      handlers.player.transfer(
        socket,
        io,
        world,
        player.id,
        landing.map,
        landing.x,
        landing.y,
        {
          isDead: false,
          health: MAX_HEALTH,
          inventory: new Array(20).fill(null),
        },
        undefined,
        data.id,
      );

      socket.emit(Event.PLAYER_INVENTORY_WIPE);

      world.sublevels.takeReturn(player.id);

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

  enter: async (
    io: Server,
    world: World,
    data: Party,
  ): Promise<boolean> => {
    const level = levels[data.depth];
    if (!level) return false;

    let spawn: { x: number; y: number };
    let tilemap: unknown = null;
    let landmarks: Landmark[] = [];

    if (level.biome) {
      const seed = `${data.id}-${data.depth}-${Date.now()}`;

      const { data: biome, error } = await tryCatch(
        handlers.generation.start(level.biome, seed, data.unlocked),
      );

      if (error || !biome) {
        console.error("Level generation failed:", error);
        return false;
      }

      spawn = biome.spawn;
      tilemap = biome.tilemap;
      landmarks = biome.entities
        .filter((e) => configs.landmarks.has(e.name))
        .map(({ name, x, y }) => ({ name, x, y }));

      biome.entities.forEach((biomeEntity) => {
        if (biomeEntity.name === EntityName.SILVER_SWORD) {
          if (
            world.relics.has(biomeEntity.name) ||
            Math.random() >= RELIC_CHANCE
          )
            return;

          world.relics.reserve(biomeEntity.name);
        }

        const id = randomUUID();
        const maxHealth =
          configs.entities[biomeEntity.name]?.maxHealth ?? MAX_HEALTH;
        const config: EntityConfig = {
          id,
          map: level.map,
          name: biomeEntity.name,
          x: biomeEntity.x,
          y: biomeEntity.y,
          health: maxHealth,
          maxHealth,
          createdAt: Date.now(),
          isLocked: false,
          loot: biomeEntity.loot,
          zone: biomeEntity.zone,
          textureSpawner: biomeEntity.textureSpawner,
        };

        world.entities.add(id, config);
        world.chunks.registerEntity(id, config.map, config.x, config.y, data.id);
      });
    } else {
      const config = configs.maps[level.map];
      spawn = config.spawn;

      const loader = new MapLoader();
      const tiled = loader.load(config.json);
      const entities = loader.parseEntities(level.map, tiled);

      landmarks = entities
        .filter((e) => configs.landmarks.has(e.name))
        .map(({ name, x, y }) => ({ name, x, y }));

      entities.forEach((entity) => {
        world.entities.add(entity.id, entity);
        world.chunks.registerEntity(
          entity.id,
          entity.map,
          entity.x,
          entity.y,
          data.id,
        );
      });
    }


    for (const id of data.members) {
      const member = world.players.get(id);
      if (!member) continue;

      const memberSocket = io.sockets.sockets.get(member.socketId);
      if (!memberSocket) continue;

      const prev = member.map;
      const wasDead = member.isDead;
      
      handlers.chunks.clear(memberSocket, world, id);
      world.sublevels.takeReturn(id);

      const candidates = world.players
        .getByMap(prev)
        .filter((p) => !data.members.includes(p.id));
      handlers.authority.transfer(io, world, prev, id, candidates);

      world.players.update(id, {
        map: level.map,
        x: spawn.x,
        y: spawn.y,
        isAuthority: false,
        ...(wasDead && {
          isDead: false,
          health: member.maxHealth ?? MAX_HEALTH,
        }),
      });

      memberSocket.leave(`map:${prev}`);
      memberSocket.join(`map:${level.map}`);
      memberSocket.to(`map:${prev}`).emit(Event.PLAYER_LEAVE, member.id);

      handlers.chunks.sync.player(
        memberSocket,
        world,
        id,
        level.map,
        spawn.x,
        spawn.y,
        io,
        data.id,
      );

      if (wasDead)
        handlers.broadcast.room(null, io, `party:${data.id}`, Event.PLAYER_REVIVE, {
          id,
          x: spawn.x,
          y: spawn.y,
          health: member.maxHealth ?? MAX_HEALTH,
        });
    }

    handlers.authority.assign(io, world, level.map, data.members[0], data.id);

    const players = data.members
      .map((id) => world.players.get(id))
      .filter(Boolean);

    const payload = {
      map: level.map,
      tilemap,
      spawn,
      players,
      landmarks,
    };

    io.to(`party:${data.id}`).emit(Event.PARTY_START, payload);

    return true;
  },

  announce: (io: Server, world: World) => {
    const list = world.parties.getLobbies();
    const maps = Object.values(MapName).filter(
      (m) => !configs.maps[m].isInstanced,
    );

    for (const map of maps) io.to(`map:${map}`).emit(Event.PARTY_LIST, list);
  },

  start: async (socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const data = world.parties.getByPlayerId(player.id);

    if (!data || data.leader !== player.id) return;
    if (data.status !== PartyStatus.LOBBY) return;

    handlers.sleep.roster(data, world);
    if (!data.members.length || data.ready.length !== data.members.length)
      return;

    await party.begin(io, world, data);
  },

  begin: async (io: Server, world: World, data: Party): Promise<boolean> => {
    if (data.status !== PartyStatus.LOBBY) return false;

    data.depth = 0;
    data.status = PartyStatus.IN_GAME;

    const map = levels[data.depth].map;
    io.to(`party:${data.id}`).emit(Event.PARTY_START_LOADING, map);

    for (const memberId of data.members) handlers.sleep.depart(memberId, world);

    data.ready = [];

    const ok = await party.enter(io, world, data);

    if (!ok) {
      data.status = PartyStatus.LOBBY;

      for (const memberId of data.members)
        handlers.sleep.wake(memberId, io, world);

      return false;
    }

    party.announce(io, world);

    return true;
  },

  descend: async (
    transition: Transition,
    io: Server,
    socket: Socket,
    world: World,
  ): Promise<boolean> => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return false;

    const data = world.parties.getByPlayerId(player.id);
    if (!data || data.status !== PartyStatus.IN_GAME) return false;

    const next = levels[data.depth + 1];
    if (!next || transition.to !== next.map) return false;

    const prevMap = levels[data.depth].map;
    data.depth += 1;

    const map = levels[data.depth].map;
    socket.emit(Event.PARTY_START_LOADING, map);
    socket.to(`party:${data.id}`).emit(Event.PARTY_START_LOADING, map);

    const ok = await party.enter(io, world, data);

    if (!ok) {
      data.depth -= 1;
      return false;
    }

    if (configs.maps[prevMap].isInstanced) {
      const entityIds = world.chunks.getEntitiesByPrefix(
        `${prevMap}:${data.id}`,
      );

      handlers.sublevel.teardown(entityIds, socket, io, world);

      for (const entityId of entityIds)
        handlers.entity.remove(
          entityId,
          Event.ENTITY_DESTROY,
          socket,
          io,
          world,
        );

      handlers.authority.release(io, world, prevMap, data.id);
    }

    party.broadcast(socket, world);
    return true;
  },
};
