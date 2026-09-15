import { Server, Socket } from "socket.io";
import {
  ComponentName,
  Direction,
  EntityConfig,
  EntityName,
  Event,
  MapName,
  Party,
  SleepableConfig,
  PlayerConfig,
} from "../types/index.js";
import { configs } from "../configs/index.js";
import { SLEEP_RANGE } from "../globals.js";
import { World } from "../World.js";
import { handlers } from "./index.js";

export const sleep = {
  config: (name: EntityName): SleepableConfig | undefined => {
    const component = configs.entities[name]?.components.find(
      (c) => c.name === ComponentName.SLEEPABLE,
    );

    return component?.name === ComponentName.SLEEPABLE
      ? component.config
      : undefined;
  },

  enter: async (
    data: { entityId: string },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    const bed = world.entities.get(data.entityId);

    if (!player || !bed || player.isDead) return;
    if (bed.map !== player.map) return;

    const config = sleep.config(bed.name);
    if (!config) return;

    if (Math.hypot(player.x - bed.x, player.y - bed.y) > SLEEP_RANGE) return;

    if (bed.isLocked && bed.lockedBy !== player.id) {
      socket.emit(Event.PLAYER_SLEEP_DENIED, { entityId: bed.id });
      return;
    }

    if (player.sleep && player.sleep.bed !== bed.id)
      sleep.release(player.sleep.bed, world, io);

    bed.isLocked = true;
    bed.lockedBy = player.id;

    player.sleep = { bed: bed.id, isAsleep: true };
    player.x = bed.x + config.anchor.x;
    player.y = bed.y + config.anchor.y;

    sleep.emit(io, world, Event.PLAYER_SLEEP, bed.map, bed.x, bed.y, {
      id: player.id,
      entityId: bed.id,
      x: player.x,
      y: player.y,
    });

    sleep.occupancy(io, world, bed);
    sleep.broadcast(io, world, player.id);
  },

  request: (
    data: { direction?: Direction } | undefined,
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    sleep.wake(player.id, io, world, false, data?.direction);
  },

  wake: (
    id: string,
    io: Server,
    world: World,
    silent = false,
    direction?: Direction,
  ) => {
    const player = world.players.get(id);
    if (!player?.sleep) return;

    const landing = sleep.landing(player, world, direction);

    sleep.clear(id, world, io);

    if (landing && landing.map === player.map) {
      player.x = landing.x;
      player.y = landing.y;
    }

    if (!silent)
      sleep.emit(io, world, Event.PLAYER_WAKE, player.map, player.x, player.y, {
        id: player.id,
        x: player.x,
        y: player.y,
      });

    sleep.broadcast(io, world, player.id);
  },

  depart: (id: string, world: World) => {
    const player = world.players.get(id);
    if (!player?.sleep) return;

    player.sleep.isAsleep = false;
  },

  landing: (
    player: PlayerConfig,
    world: World,
    direction?: Direction,
  ): { map: MapName; x: number; y: number } | undefined => {
    const bed = player.sleep && world.entities.get(player.sleep.bed);
    const config = bed && sleep.config(bed.name);

    if (!bed || !config) return undefined;

    const side =
      (direction && config.exits[direction]) ??
      Object.values(config.exits).find((entry) => !!entry);

    if (!side) return undefined;

    return { map: bed.map, x: bed.x + side.x, y: bed.y + side.y };
  },

  clear: (id: string, world: World, io?: Server) => {
    const player = world.players.get(id);
    const bed = player?.sleep ? world.entities.get(player.sleep.bed) : undefined;

    if (player) player.sleep = undefined;
    if (!bed) return;

    sleep.release(bed.id, world, io);
  },

  release: (entityId: string, world: World, io?: Server) => {
    const bed = world.entities.get(entityId);
    if (!bed) return;

    bed.isLocked = false;
    bed.lockedBy = undefined;

    if (io) sleep.occupancy(io, world, bed);
  },

  occupancy: (io: Server, world: World, bed: EntityConfig) => {
    const event = bed.isLocked ? Event.ENTITY_LOCK : Event.ENTITY_UNLOCK;
    const data = bed.isLocked ? { entityId: bed.id } : bed.id;

    sleep.emit(io, world, event, bed.map, bed.x, bed.y, data);
  },

  emit: (
    io: Server,
    world: World,
    event: Event,
    map: MapName,
    x: number,
    y: number,
    data: unknown,
  ) => {
    const key = world.chunks.toChunkKey(map, x, y);
    if (key) handlers.broadcast.room(null, io, `chunk:${key}`, event, data);
  },

  roster: (party: Party, world: World): Party => {
    party.ready = party.members.filter((id) => {
      const member = world.players.get(id);
      return !!member?.sleep?.isAsleep && !member.isDead;
    });

    return party;
  },

  broadcast: (io: Server, world: World, playerId: string) => {
    const party = world.parties.getByPlayerId(playerId);
    if (!party) return;

    io.to(`party:${party.id}`).emit(
      Event.PARTY_UPDATE,
      sleep.roster(party, world),
    );
  },

};
