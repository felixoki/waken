import { configs } from "./configs";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ItemsStore } from "./stores/Items";
import { MapName } from "./types";
import { EconomyManager } from "./managers/Economy";
import { DAY } from "./globals";
import { generateBiome } from "./biomes";
import { BiomeName } from "./types/generation";
import { randomUUID } from "crypto";

export class World {
  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public economy: EconomyManager;
  private time: { current: number; days: number } = {
    current: 0,
    days: 0,
  };

  constructor() {
    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();
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

    const realm = generateBiome(BiomeName.FOREST, "test-seed-123");
    
    if (realm) {
      for (const e of realm.entities) {
        const id = randomUUID();
        this.entities.add(id, {
          id,
          map: MapName.REALM,
          name: e.name,
          x: e.x,
          y: e.y,
          health: 100,
        });
      }
    }
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
