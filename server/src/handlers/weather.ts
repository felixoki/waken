import { Server } from "socket.io";
import {
  Effect,
  EffectName,
  EntityConfig,
  Event,
  MapName,
  PlayerConfig,
  WeatherName,
} from "../types/index.js";
import { World } from "../World.js";
import { configs } from "../configs/index.js";
import { handlers } from "./index.js";
import {
  WEATHER_MIN_DURATION,
  WEATHER_MAX_DURATION,
  WEATHER_RAIN_CHANCE,
  WEATHER_CLEAR_CHANCE,
  WEATHER_STORM_CHANCE,
  STRIKE_MIN_INTERVAL,
  STRIKE_MAX_INTERVAL,
  STRIKE_DISTANCE_BIAS,
  WET_INTERVAL,
  WET_DURATION,
} from "../globals.js";

export const weather = {
  tick: (delta: number, world: World, server: Server): void => {
    world.weather.remaining -= delta;
    if (world.weather.remaining <= 0) weather.roll(world, server);

    weather.soak(world, server, Date.now());

    if (world.weather.current !== WeatherName.STORM) return;

    world.weather.lightning -= delta;
    if (world.weather.lightning <= 0) weather.strike(world, server);
  },

  soak: (world: World, io: Server, now: number): void => {
    if (now < world.weather.soaked) return;

    world.weather.soaked = now + WET_INTERVAL;

    const raining =
      world.weather.current === WeatherName.RAIN ||
      world.weather.current === WeatherName.STORM;

    if (raining) {
      for (const player of world.players.all)
        if (weather.exposed(player.map))
          weather.drench(player.id, false, world, io, now);

      for (const entity of world.entities.all)
        if (
          configs.entities[entity.name]?.behaviors?.length &&
          weather.exposed(entity.map)
        )
          weather.drench(entity.id, true, world, io, now);
    }

    weather.dry(world, io, now, raining);
  },

  exposed: (map: MapName): boolean => !configs.maps[map]?.isIndoor,

  socket: (target: EntityConfig | PlayerConfig): string | undefined =>
    "socketId" in target ? target.socketId : undefined,

  drench: (
    id: string,
    isEntity: boolean,
    world: World,
    io: Server,
    now: number,
  ): void => {
    const store = isEntity ? world.entities : world.players;
    const target = store.get(id);

    if (!target) return;

    const effects: Effect[] = target.effects ?? [];
    const existing = effects.find((e) => e.name === EffectName.WET);

    if (existing?.held) return;

    const effect: Effect = existing ?? {
      name: EffectName.WET,
      expiresAt: 0,
      lastTickAt: now,
      ownerId: "",
    };

    effect.held = true;
    effect.expiresAt = now + WET_DURATION;

    if (!existing) effects.push(effect);

    store.update(id, { effects });
    world.affected.add(id);

    weather.announce(id, isEntity, weather.socket(target), effect, world, io);
  },

  dry: (world: World, io: Server, now: number, raining: boolean): void => {
    for (const id of world.affected) {
      const isEntity = !!world.entities.get(id);
      const store = isEntity ? world.entities : world.players;
      const target = store.get(id);

      const effects: Effect[] = target?.effects ?? [];
      const held = effects.find((e) => e.name === EffectName.WET && e.held);

      if (!target || !held) continue;
      if (raining && weather.exposed(target.map)) continue;

      held.held = false;
      held.expiresAt = now + WET_DURATION;

      store.update(id, { effects });

      weather.announce(id, isEntity, weather.socket(target), held, world, io);
    }
  },

  announce: (
    id: string,
    isEntity: boolean,
    socketId: string | undefined,
    effect: Effect,
    world: World,
    io: Server,
  ): void => {
    const data = { id, effect };

    if (!isEntity) {
      if (socketId)
        handlers.broadcast.room(
          null,
          io,
          socketId,
          Event.EFFECT_APPLY,
          data,
        );

      return;
    }

    const key = world.chunks.getChunkByEntity(id);

    if (key)
      handlers.broadcast.room(
        null,
        io,
        `chunk:${key}`,
        Event.EFFECT_APPLY,
        data,
      );
  },

  roll: (world: World, server: Server): void => {
    world.weather.current =
      Math.random() < WEATHER_RAIN_CHANCE
        ? Math.random() < WEATHER_STORM_CHANCE
          ? WeatherName.STORM
          : WeatherName.RAIN
        : Math.random() < WEATHER_CLEAR_CHANCE
          ? WeatherName.CLEAR
          : WeatherName.CLOUDY;

    world.weather.lightning = weather.interval();
    world.weather.remaining =
      WEATHER_MIN_DURATION +
      Math.random() * (WEATHER_MAX_DURATION - WEATHER_MIN_DURATION);

    server.emit(Event.WORLD_WEATHER, world.weather.current);
  },

  strike: (world: World, io: Server): void => {
    world.weather.lightning = weather.interval();

    const distance = Math.pow(Math.random(), STRIKE_DISTANCE_BIAS);

    for (const player of world.players.all)
      if (weather.exposed(player.map) && player.socketId)
        handlers.broadcast.room(
          null,
          io,
          player.socketId,
          Event.WORLD_LIGHTNING,
          distance,
        );
  },

  interval: (): number =>
    STRIKE_MIN_INTERVAL +
    Math.random() * (STRIKE_MAX_INTERVAL - STRIKE_MIN_INTERVAL),
};
