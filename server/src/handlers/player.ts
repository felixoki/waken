import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import {
  Direction,
  Event,
  Input,
  MapName,
  PlayerConfig,
  SpellName,
  Transition,
} from "../types/index.js";
import { configs } from "../configs/index.js";
import { World } from "../World.js";
import { handlers } from "./index.js";
import { WORLD_ID } from "../server.js";
import { save } from "../db/save.js";
import { load } from "../db/load.js";

export const player = {
  create: async (socket: Socket, world: World, playerId?: string) => {
    let player = world.players.getBySocketId(socket.id);

    if (!player) {
      const map = configs.maps[MapName.VILLAGE];
      const isAuthority = !world.authority.get(map.id);

      const id = playerId || randomUUID();
      let saved = null;

      if (WORLD_ID && playerId) saved = await load.player(WORLD_ID, playerId);

      const savedMap = saved?.data?.map as MapName | undefined;
      const isRealmSave = savedMap === MapName.REALM;

      player = {
        id,
        socketId: socket.id,
        map: isRealmSave ? map.id : savedMap || map.id,
        x: isRealmSave ? map.spawn.x : saved?.position?.x || map.spawn.x,
        y: isRealmSave ? map.spawn.y : saved?.position?.y || map.spawn.y,
        facing: (saved?.data?.facing as Direction) || Direction.DOWN,
        health: saved?.health || 100,
        mana: saved?.mana || 100,
        isAuthority,
        isDead: false,
        spells: (saved?.data?.spells as SpellName[]) || [],
        inventory: saved?.data?.inventory ?? new Array(20).fill(null),
      };

      world.players.add(player.id, player);
      socket.join(`map:${player.map}`);

      if (isAuthority) world.authority.set(player.map, player.id);
    }

    socket.emit(Event.PLAYER_CREATE_LOCAL, player);
    socket.emit(
      Event.PLAYER_CREATE_OTHERS,
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

    socket.to(`map:${player.map}`).emit(Event.PLAYER_CREATE, player);
    socket.emit(Event.PARTY_LIST, world.parties.getLobbies());
    socket.emit(Event.WORLD_TIME, world.getTime());
    socket.emit(Event.ECONOMY_UPDATE, world.economy.getSnapshot());
    socket.emit(Event.STORE_SYNC, world.items.snapshot());
    socket.emit(Event.SPELLS_SYNC, player.spells);
  },

  delete: async (io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (WORLD_ID && player.map !== MapName.REALM)
      await save.player(WORLD_ID, {
        playerId: player.id,
        position: { x: player.x, y: player.y },
        health: player.health,
        data: {
          map: player.map,
          facing: player.facing,
          spells: player.spells,
          inventory: player.inventory,
        },
      });

    if (player.locked) {
      const entity = world.entities.get(player.locked);

      if (entity) {
        entity.isLocked = false;
        handlers.broadcast.toChunk(
          socket,
          world,
          Event.ENTITY_UNLOCK,
          player.locked,
          entity.map,
          entity.x,
          entity.y,
        );
      }
    }

    for (const entity of world.entities.all)
      if (entity.lockedBy === player.id) {
        entity.isLocked = false;
        entity.lockedBy = undefined;
      }

    handlers.party.leave(socket, io, world);

    const keys = handlers.chunks.clear(socket, world, player.id);
    keys.forEach((key) => {
      socket.to(`chunk:${key}`).emit(Event.PLAYER_LEAVE, player.id);
    });

    const wasAuthority = world.authority.get(player.map) === player.id;
    world.players.remove(player.id);

    if (wasAuthority) {
      const candidates = world.players.getByMap(player.map);
      handlers.authority.transfer(io, world, player.map, player.id, candidates);
    }
  },

  input: (data: Input, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.isDead) return;

    world.players.update(player.id, {
      ...player,
      ...{
        x: data.x,
        y: data.y,
        state: data.state,
        ...(data.facing && { facing: data.facing }),
        isRunning: data.isRunning,
      },
    });

    const party = world.parties.getByPlayerId(player.id);
    const realmPartyId = player.map === MapName.REALM ? party?.id : undefined;

    const key = world.chunks.toChunkKey(
      player.map,
      data.x,
      data.y,
      realmPartyId,
    );
    socket.to(`chunk:${key}`).emit(Event.PLAYER_INPUT, data);

    if (party) socket.to(`party:${party.id}`).emit(Event.PLAYER_INPUT, data);

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      player.map,
      data.x,
      data.y,
      io,
      realmPartyId,
    );
  },

  transfer: (
    socket: Socket,
    io: Server,
    world: World,
    playerId: string,
    to: MapName,
    x: number,
    y: number,
    updates?: Partial<PlayerConfig>,
    exclude?: string[],
    partyId?: string,
  ) => {
    const player = world.players.get(playerId);
    if (!player) return;

    const from = player.map;

    handlers.chunks.clear(socket, world, playerId);

    const fromPartyId = from === MapName.REALM ? partyId : undefined;
    const candidates = fromPartyId
      ? (world.parties.get(fromPartyId)?.members ?? [])
          .map((id) => world.players.get(id))
          .filter(
            (p): p is PlayerConfig =>
              !!p && p.map === MapName.REALM && !(exclude ?? []).includes(p.id),
          )
      : world.players
          .getByMap(from)
          .filter((p) => !(exclude ?? []).includes(p.id));

    handlers.authority.transfer(
      io,
      world,
      from,
      playerId,
      candidates,
      fromPartyId,
    );

    const isAuthority = !world.authority.get(to);

    world.players.update(playerId, {
      map: to,
      x,
      y,
      isAuthority,
      ...updates,
    });

    if (isAuthority) world.authority.set(to, playerId);

    socket.leave(`map:${from}`);
    socket.join(`map:${to}`);
    socket.to(`map:${from}`).emit(Event.PLAYER_LEAVE, playerId);

    const updated = world.players.get(playerId);
    const others = world.players.getOthersOnMap(playerId, to);

    socket.emit(Event.PLAYER_TRANSITION, updated);
    socket.emit(Event.PLAYER_CREATE_OTHERS, others);

    handlers.chunks.sync.player(socket, world, playerId, to, x, y);

    socket.to(`map:${to}`).emit(Event.PLAYER_CREATE, updated);
  },

  transition: (data: Transition, io: Server, socket: Socket, world: World) => {
    const p = world.players.getBySocketId(socket.id);
    if (!p) return;

    const prev = p.map;
    const partyData = world.parties.getByPlayerId(p.id);
    const partyId = prev === MapName.REALM ? partyData?.id : undefined;

    player.transfer(
      socket,
      io,
      world,
      p.id,
      data.to,
      data.x,
      data.y,
      undefined,
      undefined,
      partyId,
    );

    if (partyData && prev === MapName.REALM)
      handlers.party.cleanup(socket, io, world, partyData.id);
  },

  spectate: (data: { targetId: string }, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || !player.isDead) return;

    const target = world.players.get(data.targetId);
    if (!target || target.map !== player.map) return;

    const party = world.parties.getByPlayerId(player.id);
    if (!party || !party.members.includes(target.id)) return;

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      target.map,
      target.x,
      target.y,
    );
  },
};
