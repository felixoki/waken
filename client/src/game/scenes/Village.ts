import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { Preloader } from "../loaders/Preloader";
import { TileManager } from "../managers/Tile";

export default class Village extends Scene {
  constructor() {
    super("Village");
  }

  preload() {
    Preloader.load(this, MapName.VILLAGE);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.VILLAGE);
    this.tileManager = new TileManager(map);
    this.cameras.main.setZoom(2);
  }
}
