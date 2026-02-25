import { configs } from "./configs";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ItemsStore } from "./stores/Items";
import { MapName } from "./types";
import { EconomyManager } from "./managers/Economy";
import { DAY } from "./globals";
import { PartyStore } from "./stores/Party";

export class World {
  private time: { current: number; days: number } = { current: 0, days: 0 };
  
  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public readonly parties: PartyStore;

  public economy: EconomyManager;

  constructor() {
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

    this.economy.update();
  }
}
