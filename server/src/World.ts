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
  Position,
  SpotName,
  WeatherName,
  WeatherState,
  ClimateState,
  Encounter,
} from "./types/index.js";
import { EconomyManager } from "./managers/Economy";
import {
  DAY,
  PHASE_STARTS,
} from "./globals";
import { PartyStore } from "./stores/Party";
import { Server } from "socket.io";
import { ChunkManager } from "./managers/Chunk";
import { AuthorityManager } from "./managers/Authority";
import { ZoneManager } from "./managers/Zone";
import { SurfaceManager } from "./managers/Surface";
import { combat } from "./handlers/combat.js";
import { handlers } from "./handlers/index.js";
import { SublevelStore } from "./stores/Sublevel.js";
import { RelicStore } from "./stores/Relic.js";
import { StoryStore } from "./stores/Story.js";

export class World {
  private time: TimeState = { current: 0, days: 0, phase: TimePhase.DAWN };
  public weather: WeatherState = {
    current: WeatherName.CLOUDY,
    remaining: 0,
    lightning: 0,
    soaked: 0,
    waded: 0,
  };
  public climate: ClimateState = { chilled: 0 };

  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public readonly parties: PartyStore;
  public readonly sublevels: SublevelStore;
  public readonly relics: RelicStore;
  public readonly story: StoryStore;
  public readonly chunks: ChunkManager;
  public readonly authority: AuthorityManager;
  public readonly zones: ZoneManager;
  public readonly surfaces: SurfaceManager;
  public readonly affected: Set<string> = new Set();
  public readonly dropped: Set<string> = new Set();
  public readonly chilled: Set<string> = new Set();
  public readonly freecast: Set<string> = new Set();
  public readonly spots: Map<SpotName, Position> = new Map();
  public readonly encounters: Map<string, Encounter> = new Map();
  private scheduling = true;
  private driving = 0;
  private ticks = 0;

  public server: Server;
  public economy: EconomyManager;

  constructor(server: Server) {
    this.server = server;

    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();
    this.parties = new PartyStore();
    this.sublevels = new SublevelStore();
    this.relics = new RelicStore();
    this.story = new StoryStore();
    this.chunks = new ChunkManager();
    this.authority = new AuthorityManager();
    this.zones = new ZoneManager();
    this.surfaces = new SurfaceManager();

    this.economy = new EconomyManager(this.items);
  }

  loadSpots() {
    const loader = new MapLoader();

    for (const [name, config] of Object.entries(configs.maps)) {
      if (!config.json) continue;

      const tilemap = loader.load(config.json);

      for (const [spot, position] of loader.parseSpots(name as MapName, tilemap))
        this.spots.set(spot, position);
    }
  }

  load() {
    const loader = new MapLoader();

    Object.entries(configs.maps)
      .filter(([name, _]) => !configs.maps[name as MapName].isInstanced)
      .forEach(([name, config]) => {
        const tilemap = loader.load(config.json);
        const entities = loader.parseEntities(name as MapName, tilemap);

        this.surfaces.register(name as MapName, tilemap);

        entities.forEach((entity) => {
          entity.tame = handlers.taming.native(entity);
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
      handlers.village.day(this);
    }

    const phase = this._getPhase(this.time.current);

    if (phase !== this.time.phase) {
      this.time.phase = phase;
      this.server.emit(Event.WORLD_PHASE, this.time.phase);
      this.scheduling = true;
    }

    if (this.scheduling)
      this.scheduling = handlers.schedule.apply(this, this.server);

    this.driving += delta;
    if (this.driving >= 1000) {
      this.driving = 0;
      handlers.storage.drive(this, this.server);

      if (++this.ticks % 10 === 0) this.scheduling = true;
    }

    handlers.weather.tick(delta, this, this.server);
    handlers.climate.tick(this, this.server, Date.now());

    handlers.player.regen(delta, this);

    this.economy.update(
      delta,
      this.time.phase,
      this.weather.current === WeatherName.RAIN ||
        this.weather.current === WeatherName.STORM,
    );

    if (this.economy.dirty) {
      this.economy.dirty = false;
      this.server.emit(Event.ECONOMY_UPDATE, this.economy.getSnapshot());
    }

    combat.effects.tick(this, this.server, Date.now());

    handlers.spawner.entity.tick(this, this.server, Date.now());
    handlers.spawner.texture.tick(this, this.server, Date.now());
    handlers.item.decay(this, Date.now());
  }

  getTime(): TimeState {
    return { ...this.time };
  }

  getWeather(): WeatherName {
    return this.weather.current;
  }

  isRaining(): boolean {
    return (
      this.weather.current === WeatherName.RAIN ||
      this.weather.current === WeatherName.STORM
    );
  }

  setTime(time: TimeState): void {
    this.time = time;
    this.scheduling = true;
  }

  private _getPhase(current: number): TimePhase {
    const progress = current / DAY;

    let result = TimePhase.DAWN;

    for (const { phase, start } of PHASE_STARTS)
      if (progress >= start) result = phase;

    return result;
  }
}
