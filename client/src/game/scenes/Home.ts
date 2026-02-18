import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { Preloader } from "../loaders/Preloader";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class HomeScene extends Scene {
  constructor() {
    super(MapName.HOME);
  }

  preload() {
    Preloader.load(this, MapName.HOME);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.HOME);
    this.tileManager = new TileManager(map);
    this.cameraManager.setZoom(3);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
