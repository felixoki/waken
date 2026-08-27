import { Server } from "socket.io";
import { Event, WeatherName } from "../types/index.js";
import { World } from "../World.js";
import {
  WEATHER_MIN_DURATION,
  WEATHER_MAX_DURATION,
  WEATHER_RAIN_CHANCE,
  WEATHER_CLEAR_CHANCE,
  WEATHER_STORM_CHANCE,
  STRIKE_MIN_INTERVAL,
  STRIKE_MAX_INTERVAL,
  STRIKE_DISTANCE_BIAS,
} from "../globals.js";

export const weather = {
  tick: (delta: number, world: World, server: Server): void => {
    world.weather.remaining -= delta;
    if (world.weather.remaining <= 0) weather.roll(world, server);

    if (world.weather.current !== WeatherName.STORM) return;

    world.weather.lightning -= delta;
    if (world.weather.lightning <= 0) weather.strike(world, server);
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

  strike: (world: World, server: Server): void => {
    world.weather.lightning = weather.interval();

    server.emit(
      Event.WORLD_LIGHTNING,
      Math.pow(Math.random(), STRIKE_DISTANCE_BIAS),
    );
  },

  interval: (): number =>
    STRIKE_MIN_INTERVAL +
    Math.random() * (STRIKE_MAX_INTERVAL - STRIKE_MIN_INTERVAL),
};
