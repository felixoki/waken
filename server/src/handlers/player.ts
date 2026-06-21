import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import {
  Direction,
  EntityName,
  Event,
  Slot,
  SlotType,
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
import {
  MAX_HEALTH,
  MAX_MANA,
  REGEN_HEALTH_PER_SECOND,
  REGEN_INTERVAL,
  REGEN_MANA_PER_SECOND,
} from "../globals.js";

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
      const isInstanced = savedMap && configs.maps[savedMap].isInstanced;

      player = {
        id,
        socketId: socket.id,
        map: isInstanced ? map.id : savedMap || map.id,
        x: isInstanced ? map.spawn.x : saved?.position?.x || map.spawn.x,
        y: isInstanced ? map.spawn.y : saved?.position?.y || map.spawn.y,
        facing: (saved?.data?.facing as Direction) || Direction.DOWN,
        health: saved?.health || MAX_HEALTH,
        maxHealth: MAX_HEALTH,
        mana: saved?.mana || 100,
        isAuthority,
        isDead: false,
        spells: (saved?.data?.spells as SpellName[]) || [
          SpellName.SHARD,
          SpellName.SLASH,
          SpellName.LIGHTNING_STRIKE,
          SpellName.ABSORB_LIFE
        ],
        inventory: saved?.data?.inventory ?? new Array(20).fill(null),
        hotbar: (saved?.data?.hotbar as (Slot | null)[]) ?? [
          {
            type: SlotType.ENTITY,
            item: { name: EntityName.AXE, quantity: 1, stackable: false },
          },
          {
            type: SlotType.ENTITY,
            item: { name: EntityName.LANTERN, quantity: 1, stackable: false },
          },
          {
            type: SlotType.ENTITY,
            item: { name: EntityName.HOE, quantity: 1, stackable: false },
          },
          {
            type: SlotType.ENTITY,
            item: {
              name: EntityName.FISHING_ROD,
              quantity: 1,
              stackable: false,
            },
          },
          {
            type: SlotType.ENTITY,
            item: { name: EntityName.PICKAXE, quantity: 1, stackable: false },
          },
          {
            type: SlotType.ENTITY,
            item: {
              name: EntityName.WATERING_CAN,
              quantity: 1,
              stackable: false,
            },
          },
          null,
          null,
        ],
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

    if (WORLD_ID && !configs.maps[player.map].isInstanced)
      await save.player(WORLD_ID, {
        playerId: player.id,
        position: { x: player.x, y: player.y },
        health: player.health,
        data: {
          map: player.map,
          facing: player.facing,
          spells: player.spells,
          inventory: player.inventory,
          hotbar: player.hotbar,
        },
      });

    if (player.locked) {
      const entity = world.entities.get(player.locked);

      if (entity) {
        entity.isLocked = false;
        entity.facing = undefined;

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
    const partyId = configs.maps[player.map].isInstanced
      ? party?.id
      : undefined;

    const key = world.chunks.toChunkKey(player.map, data.x, data.y, partyId);
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
      partyId,
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

    const fromPartyId = configs.maps[from].isInstanced ? partyId : undefined;
    const candidates = fromPartyId
      ? (world.parties.get(fromPartyId)?.members ?? [])
          .map((id) => world.players.get(id))
          .filter(
            (p): p is PlayerConfig =>
              !!p &&
              configs.maps[p.map].isInstanced &&
              !(exclude ?? []).includes(p.id),
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

  transition: async (
    data: Transition,
    io: Server,
    socket: Socket,
    world: World,
  ) => {
    const p = world.players.getBySocketId(socket.id);
    if (!p) return;

    const partyData = world.parties.getByPlayerId(p.id);

    if (partyData && configs.maps[data.to].isInstanced) {
      await handlers.party.descend(data, io, socket, world);
      return;
    }

    const prev = p.map;
    const partyId = configs.maps[prev].isInstanced ? partyData?.id : undefined;

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

    if (partyData && configs.maps[prev].isInstanced)
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

  regen: (delta: number, world: World) => {
    world.players.regen += delta;
    if (world.players.regen < REGEN_INTERVAL) return;
    world.players.regen -= REGEN_INTERVAL;

    for (const player of world.players.all) {
      if (player.isDead) continue;

      const health = Math.min(
        player.health + REGEN_HEALTH_PER_SECOND,
        player.maxHealth || MAX_HEALTH,
      );
      const mana = Math.min(player.mana + REGEN_MANA_PER_SECOND, MAX_MANA);

      if (health !== player.health) {
        world.players.update(player.id, { health });
        world.server.to(player.socketId).emit(Event.PLAYER_HEALTH, health);
        world.server
          .to(`map:${player.map}`)
          .except(player.socketId)
          .emit(Event.PLAYER_HEALTH_SYNC, { id: player.id, health });
      }

      if (mana !== player.mana) {
        world.players.update(player.id, { mana });
        world.server.to(player.socketId).emit(Event.PLAYER_MANA, mana);
      }
    }
  },
};
