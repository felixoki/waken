import { MapName } from "@server/types";
import { Preloader } from "../loaders/Preloader";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class TavernScene extends Scene {
  constructor() {
    super(MapName.TAVERN);
  }

  preload() {
    Preloader.load(this, MapName.TAVERN);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.TAVERN);
    this.tileManager = new TileManager(map);
    this.cameraManager.setZoom(3);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
