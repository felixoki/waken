import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import {
  ComponentName,
  Direction,
  EffectName,
  EntityName,
  Event,
  Item,
  Modifier,
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
  CRIT_CHANCE,
  CRIT_MULTIPLIER,
  HOTBAR_SIZE,
  REGEN_HEALTH_PER_SECOND,
  REGEN_INTERVAL,
  REGEN_MANA_PER_SECOND,
} from "../globals.js";

export const player = {
  create: async (
    socket: Socket,
    io: Server,
    world: World,
    playerId?: string,
  ) => {
    let player = world.players.getBySocketId(socket.id);

    if (!player) {
      const map = configs.maps[MapName.VILLAGE];
      const isAuthority = !world.authority.get(map.id);

      const id = playerId || randomUUID();
      let saved = null;

      if (WORLD_ID && playerId) saved = await load.player(WORLD_ID, playerId);

      const inventory: (Item | null)[] = saved?.data?.inventory ?? [
        ...new Array(20).fill(null),
      ];
      const hotbar = (saved?.data?.hotbar as (Slot | null)[]) ?? [
        ...new Array(HOTBAR_SIZE).fill(null),
      ];

      for (const slot of hotbar.splice(HOTBAR_SIZE)) {
        const free = inventory.indexOf(null);

        if (slot?.type === SlotType.ENTITY && free !== -1)
          inventory[free] = slot.item;
      }

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
        mana: MAX_MANA,
        maxMana: MAX_MANA,
        isAuthority,
        isDead: false,
        spells: [
          ...new Set([
            SpellName.SHARD,
            SpellName.SLASH,
            SpellName.REVIVE,
            SpellName.LIGHTNING_STRIKE,
            SpellName.DELTA_WAVE,
            ...((saved?.data?.spells as SpellName[]) ?? []),
          ]),
        ].filter((name) => configs.spells[name]),
        inventory,
        hotbar,
        robe: (saved?.data?.robe as (Item | null)[]) ?? [null],
        active: Math.min((saved?.data?.active as number) ?? 0, HOTBAR_SIZE - 1),
        records:
          (saved?.data?.records as PlayerConfig["records"]) ?? {},
      };

      world.players.add(player.id, player);
      socket.join(`map:${player.map}`);

      if (isAuthority) handlers.authority.assign(io, world, player.map, player.id);
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
    socket.emit(Event.WORLD_WEATHER, world.getWeather());
    socket.emit(Event.ECONOMY_UPDATE, world.economy.getSnapshot());
    socket.emit(Event.STORE_SYNC, world.items.snapshot());
    socket.emit(Event.SPELLS_SYNC, player.spells);
  },

  delete: async (io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (player.sleep?.isAsleep) handlers.sleep.wake(player.id, io, world);

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
          robe: player.robe,
          active: player.active,
          records: player.records,
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
        active: data.active,
      },
    });

    const party = world.parties.getByPlayerId(player.id);
    const partyId = configs.maps[player.map].isInstanced
      ? (world.sublevels.entranceOf(player.id) ?? party?.id)
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

    const toPartyId = configs.maps[to].isInstanced
      ? world.parties.getByPlayerId(playerId)?.id
      : undefined;

    const isAuthority = !world.authority.get(to, toPartyId);

    world.players.update(playerId, {
      map: to,
      x,
      y,
      isAuthority,
      ...updates,
    });

    if (isAuthority) handlers.authority.assign(io, world, to, playerId, toPartyId);

    socket.leave(`map:${from}`);
    socket.join(`map:${to}`);
    socket.to(`map:${from}`).emit(Event.PLAYER_LEAVE, playerId);

    const updated = world.players.get(playerId);
    const others = world.players.getOthersOnMap(playerId, to);

    socket.emit(Event.PLAYER_TRANSITION, updated);
    socket.emit(Event.PLAYER_CREATE_OTHERS, others);

    handlers.chunks.sync.player(
      socket,
      world,
      playerId,
      to,
      x,
      y,
      io,
      toPartyId,
    );

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

    const party = world.parties.getByPlayerId(p.id);
    const from = configs.maps[p.map];
    const to = configs.maps[data.to];

    if (from.isInstanced && !from.isPartyInstance) {
      await handlers.sublevel.exit(data, io, socket, world);
      return;
    }

    if (to.isInstanced && !to.isPartyInstance) {
      await handlers.sublevel.enter(data, io, socket, world);
      return;
    }

    if (party && to.isInstanced) {
      const ok = await handlers.party.descend(data, io, socket, world);
      if (!ok) socket.emit(Event.PLAYER_TRANSITION_DENIED);
      return;
    }

    const prev = p.map;
    const partyId = configs.maps[prev].isInstanced ? party?.id : undefined;
    const leaving = !!party && configs.maps[prev].isInstanced;
    const landing = leaving ? handlers.sleep.landing(p, world) : undefined;

    if (leaving) handlers.sleep.clear(p.id, world, io);

    player.transfer(
      socket,
      io,
      world,
      p.id,
      landing?.map ?? data.to,
      landing?.x ?? data.x,
      landing?.y ?? data.y,
      undefined,
      undefined,
      partyId,
    );

    if (party && leaving) {
      handlers.party.cleanup(socket, io, world, party.id);
      handlers.party.leave(socket, io, world);
    }
  },

  robe: {
    is: (name: EntityName): boolean =>
      !!configs.entities[name]?.components.some(
        (component) => component.name === ComponentName.ROBE,
      ),
  },

  carried: (player: PlayerConfig): Item[] => {
    const items: Item[] = [];

    for (const item of player.inventory)
      if (item && !handlers.player.robe.is(item.name)) items.push(item);

    for (const item of player.robe) if (item) items.push(item);

    return items;
  },

  stats: (player: PlayerConfig) => {
    const stats = {
      multipliers: {
        damage: 1,
        crit: CRIT_MULTIPLIER,
        defense: 1,
        speed: 1,
        capture: 1,
      },
      regen: { health: REGEN_HEALTH_PER_SECOND, mana: REGEN_MANA_PER_SECOND },
      max: { health: MAX_HEALTH, mana: MAX_MANA },
      crit: CRIT_CHANCE,
      reflect: 0,
    };
    const scale = { health: 1, mana: 1 };
    const added = { health: 0, mana: 0 };

    const apply = (modifier: Modifier | null | undefined) => {
      if (!modifier) return;

      const { multipliers, regen, max, bonus } = modifier;

      if (multipliers) {
        if (multipliers.damage) stats.multipliers.damage *= multipliers.damage;
        if (multipliers.crit) stats.multipliers.crit *= multipliers.crit;
        if (multipliers.defense)
          stats.multipliers.defense *= multipliers.defense;
        if (multipliers.speed) stats.multipliers.speed *= multipliers.speed;
        if (multipliers.capture)
          stats.multipliers.capture *= multipliers.capture;
        if (multipliers.healthRegen) scale.health *= multipliers.healthRegen;
        if (multipliers.manaRegen) scale.mana *= multipliers.manaRegen;
      }

      if (bonus) {
        added.health += bonus.health ?? 0;
        added.mana += bonus.mana ?? 0;
        stats.crit += bonus.crit ?? 0;
        stats.reflect += bonus.reflect ?? 0;
      }

      if (regen) {
        if (regen.health)
          stats.regen.health = Math.max(stats.regen.health, regen.health);
        if (regen.mana)
          stats.regen.mana = Math.max(stats.regen.mana, regen.mana);
      }

      if (max) {
        if (max.health)
          stats.max.health = Math.max(stats.max.health, max.health);
        if (max.mana) stats.max.mana = Math.max(stats.max.mana, max.mana);
      }
    };

    for (const item of handlers.player.carried(player))
      apply(configs.entities[item.name]?.modifier);

    if (player.effects) {
      const now = Date.now();

      for (const effect of player.effects)
        if (effect.expiresAt > now)
          apply(configs.effects[effect.name]?.modifier);
    }

    stats.regen.health *= scale.health;
    stats.regen.mana *= scale.mana;
    stats.max.health += added.health;
    stats.max.mana += added.mana;

    return stats;
  },

  immune: (player: PlayerConfig, name: EffectName): boolean => {
    for (const item of handlers.player.carried(player))
      if (configs.entities[item.name]?.modifier?.immunities?.includes(name))
        return true;

    if (!player.effects) return false;

    const now = Date.now();

    for (const effect of player.effects)
      if (
        effect.expiresAt > now &&
        configs.effects[effect.name]?.modifier?.immunities?.includes(name)
      )
        return true;

    return false;
  },

  regen: (delta: number, world: World) => {
    world.players.regen += delta;
    if (world.players.regen < REGEN_INTERVAL) return;
    world.players.regen -= REGEN_INTERVAL;

    for (const player of world.players.all) {
      if (player.isDead) continue;

      const stats = handlers.player.stats(player);

      if (stats.max.health !== player.maxHealth) {
        world.players.update(player.id, { maxHealth: stats.max.health });
        world.server
          .to(player.socketId)
          .emit(Event.PLAYER_MAX_HEALTH, stats.max.health);
      }

      if (stats.max.mana !== player.maxMana) {
        world.players.update(player.id, { maxMana: stats.max.mana });
        world.server
          .to(player.socketId)
          .emit(Event.PLAYER_MAX_MANA, stats.max.mana);
      }

      const health = Math.min(
        player.health + stats.regen.health,
        stats.max.health,
      );
      const mana = Math.min(player.mana + stats.regen.mana, stats.max.mana);

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
