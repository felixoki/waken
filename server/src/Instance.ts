import { configs } from "./configs";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ItemsStore } from "./stores/Items";
import { MapName } from "./types";

export class Instance {
  public readonly id: string;
  public readonly host: string;
  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;

  constructor(id: string, host: string) {
    this.id = id;
    this.host = host;

    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();

    const loader = new MapLoader();

    const village = loader.load(configs.maps.village.json);
    const villageEntities = loader.parseEntities(MapName.VILLAGE, village);

    const herbalist = loader.load(configs.maps.herbalist_house.json);
    const herbalistEntities = loader.parseEntities(
      MapName.HERBALIST_HOUSE,
      herbalist,
    );

    [...villageEntities, ...herbalistEntities].forEach((e) =>
      this.entities.add(e.id, e),
    );
  }
}
