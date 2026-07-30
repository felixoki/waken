import { configs } from "./configs/index.js";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ItemsStore } from "./stores/Items";
import {
  Event,
  MapName,
  TimePhase,
  TimeState,
  WeatherName,
} from "./types/index.js";
import { EconomyManager } from "./managers/Economy";
import {
  DAY,
  PHASE_STARTS,
  WEATHER_MIN_DURATION,
  WEATHER_MAX_DURATION,
  WEATHER_RAIN_CHANCE,
} from "./globals";
import { PartyStore } from "./stores/Party";
import { Server } from "socket.io";
import { ChunkManager } from "./managers/Chunk";
import { AuthorityManager } from "./managers/Authority";
import { ZoneManager } from "./managers/Zone";
import { combat } from "./handlers/combat.js";
import { handlers } from "./handlers/index.js";
import { SublevelStore } from "./stores/Sublevel.js";

export class World {
  private time: TimeState = { current: 0, days: 0, phase: TimePhase.DAWN };
  private weather: { current: WeatherName; remaining: number } = {
    current: WeatherName.CLEAR,
    remaining: 0,
  };

  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public readonly parties: PartyStore;
  public readonly sublevels: SublevelStore;
  public readonly chunks: ChunkManager;
  public readonly authority: AuthorityManager;
  public readonly zones: ZoneManager;
  public readonly affected: Set<string> = new Set();

  public server: Server;
  public economy: EconomyManager;

  constructor(server: Server) {
    this.server = server;

    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();
    this.parties = new PartyStore();
    this.sublevels = new SublevelStore();
    this.chunks = new ChunkManager();
    this.authority = new AuthorityManager();
    this.zones = new ZoneManager();

    this.economy = new EconomyManager(this.items);
  }

  load() {
    const loader = new MapLoader();

    Object.entries(configs.maps)
      .filter(([name, _]) => !configs.maps[name as MapName].isInstanced)
      .forEach(([name, config]) => {
        const tilemap = loader.load(config.json);
        const entities = loader.parseEntities(name as MapName, tilemap);

        entities.forEach((entity) => {
          this.entities.add(entity.id, entity);
          this.chunks.registerEntity(entity.id, entity.map, entity.x, entity.y);
        });
      });
  }

  update(delta: number) {
    this.time.current += delta;

    if (this.time.current >= DAY) {
      this.time.current = 0;
      this.time.days++;
    }

    const phase = this._getPhase(this.time.current);

    if (phase !== this.time.phase) {
      this.time.phase = phase;
      this.server.emit(Event.WORLD_PHASE, this.time.phase);
    }

    this.weather.remaining -= delta;
    if (this.weather.remaining <= 0) this._rollWeather();

    handlers.player.regen(delta, this);

    this.economy.update(delta);

    if (this.economy.dirty) {
      this.economy.dirty = false;
      this.server.emit(Event.ECONOMY_UPDATE, this.economy.getSnapshot());
    }

    combat.effects.tick(this, this.server, Date.now());

    handlers.spawner.entity.tick(this, this.server, Date.now());
    handlers.spawner.texture.tick(this, this.server, Date.now());
  }

  getTime(): TimeState {
    return { ...this.time };
  }

  getWeather(): WeatherName {
    return this.weather.current;
  }

  private _rollWeather(): void {
    this.weather.current =
      Math.random() < WEATHER_RAIN_CHANCE
        ? WeatherName.RAIN
        : WeatherName.CLEAR;
    this.weather.remaining =
      WEATHER_MIN_DURATION +
      Math.random() * (WEATHER_MAX_DURATION - WEATHER_MIN_DURATION);
    this.server.emit(Event.WORLD_WEATHER, this.weather.current);
  }

  setTime(time: TimeState): void {
    this.time = time;
  }

  private _getPhase(current: number): TimePhase {
    const progress = current / DAY;

    let result = TimePhase.DAWN;

    for (const { phase, start } of PHASE_STARTS)
      if (progress >= start) result = phase;

    return result;
  }
}
