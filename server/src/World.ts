import { configs } from "./configs/index.js";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ItemsStore } from "./stores/Items";
import { Event, MapName, TimePhase, TimeState } from "./types/index.js";
import { EconomyManager } from "./managers/Economy";
import {
  DAY,
  MAX_HEALTH,
  MAX_MANA,
  PHASE_STARTS,
  REGEN_HEALTH_PER_SECOND,
  REGEN_MANA_PER_SECOND,
} from "./globals";
import { PartyStore } from "./stores/Party";
import { Server } from "socket.io";
import { ChunkManager } from "./managers/Chunk";
import { AuthorityManager } from "./managers/Authority";
import { combat } from "./handlers/combat.js";

export class World {
  private time: TimeState = { current: 0, days: 0, phase: TimePhase.DAWN };
  private regenAccumulator = 0;
  private server: Server;

  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public readonly parties: PartyStore;
  public readonly chunks: ChunkManager;
  public readonly authority: AuthorityManager;

  public economy: EconomyManager;

  constructor(server: Server) {
    this.server = server;

    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();
    this.parties = new PartyStore();
    this.chunks = new ChunkManager();
    this.authority = new AuthorityManager();

    this.economy = new EconomyManager(this.items);
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
      this.server.emit(Event.WORLD_PHASE, this.time.phase);
    }

    this.economy.update();

    this.regenAccumulator += delta;

    if (this.regenAccumulator >= 1000) {
      this.regenAccumulator -= 1000;

      for (const player of this.players.all) {
        if (player.isDead) continue;

        const health = Math.min(
          player.health + REGEN_HEALTH_PER_SECOND,
          MAX_HEALTH,
        );
        const mana = Math.min(player.mana + REGEN_MANA_PER_SECOND, MAX_MANA);

        if (health !== player.health) {
          this.players.update(player.id, { health });
          this.server.to(player.socketId).emit(Event.PLAYER_HEALTH, health);
        }

        if (mana !== player.mana) {
          this.players.update(player.id, { mana });
          this.server.to(player.socketId).emit(Event.PLAYER_MANA, mana);
        }
      }
    }

    if (this.economy.dirty) {
      this.economy.dirty = false;
      this.server.emit(Event.ECONOMY_UPDATE, this.economy.getSnapshot());
    }

    combat.effects.tick(this, this.server, Date.now());
  }

  getTime(): TimeState {
    return { ...this.time };
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
