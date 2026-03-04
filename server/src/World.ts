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

export class World {
  private time: TimeState = { current: 0, days: 0, phase: TimePhase.DAWN };
  private server: Server;

  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public readonly parties: PartyStore;

  public economy: EconomyManager;

  constructor(server: Server) {
    this.server = server;

    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();
    this.parties = new PartyStore();
    this.economy = new EconomyManager(this.items);

    this.load();
  }

  load() {
    const loader = new MapLoader();

    Object.entries(configs.maps).forEach(([name, config]) => {
      if (name === MapName.REALM) return;
      const tilemap = loader.load(config.json);
      const entities = loader.parseEntities(name as MapName, tilemap);
      entities.forEach((e) => this.entities.add(e.id, e));
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
  }

  getTime(): TimeState {
    return { ...this.time };
  }

  private _getPhase(current: number): TimePhase {
    const progress = current / DAY;

    let result = TimePhase.DAWN;

    for (const { phase, start } of PHASE_STARTS)
      if (progress >= start) result = phase;

    return result;
  }
}
