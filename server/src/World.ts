import { configs } from "./configs";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ItemsStore } from "./stores/Items";
import { MapName, TimePhase, TimeState } from "./types";
import { EconomyManager } from "./managers/Economy";
import { DAY, PHASE_STARTS } from "./globals";
import { PartyStore } from "./stores/Party";
import { Server } from "socket.io";
import { ChunkManager } from "./managers/Chunk";

export class World {
  private time: TimeState = { current: 0, days: 0, phase: TimePhase.DAWN };
  private server: Server;

  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public readonly parties: PartyStore;
  public readonly chunks: ChunkManager;

  public economy: EconomyManager;

  private authority = new Map<MapName, string>();

  constructor(server: Server) {
    this.server = server;

    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();
    this.parties = new PartyStore();
    this.chunks = new ChunkManager();

    this.economy = new EconomyManager(this.items);

    this.load();
  }

  load() {
    const loader = new MapLoader();

    Object.entries(configs.maps)
      .filter(([name, _]) => name !== MapName.REALM)
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
      this.server.emit("world:phase", this.time.phase);
    }

    this.economy.update();

    if (this.economy.dirty) {
      this.economy.dirty = false;
      this.server.emit("economy:update", this.economy.getSnapshot());
    }
  }

  getTime(): TimeState {
    return { ...this.time };
  }

  getAuthority(map: MapName): string | undefined {
    return this.authority.get(map);
  }

  setAuthority(map: MapName, playerId: string): void {
    this.authority.set(map, playerId);
  }

  clearAuthority(map: MapName): void {
    this.authority.delete(map);
  }

  transferAuthority(map: MapName, from: string, exclude: string[] = []): string | undefined {
    if (this.authority.get(map) !== from) return undefined;

    const next = this.players
      .getByMap(map)
      .find((p) => p.id !== from && !exclude.includes(p.id));

    if (next) {
      this.authority.set(map, next.id);
      this.players.update(next.id, { isAuthority: true });
      return next.id;
    }

    this.authority.delete(map);
    return undefined;
  }

  private _getPhase(current: number): TimePhase {
    const progress = current / DAY;

    let result = TimePhase.DAWN;

    for (const { phase, start } of PHASE_STARTS)
      if (progress >= start) result = phase;

    return result;
  }
}
