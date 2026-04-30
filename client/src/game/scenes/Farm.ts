import { MapName } from "@server/types";
import { Preloader } from "../loaders/Preloader";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class FarmScene extends Scene {
  constructor() {
    super(MapName.FARM_HOUSE);
  }

  preload() {
    Preloader.load(this, MapName.FARM_HOUSE);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.FARM_HOUSE);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
