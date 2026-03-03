import { MapName } from "@server/types";
import { Preloader } from "../loaders/Preloader";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class BlacksmithScene extends Scene {
  constructor() {
    super(MapName.BLACKSMITH_HOUSE);
  }

  preload() {
    Preloader.load(this, MapName.BLACKSMITH_HOUSE);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.BLACKSMITH_HOUSE);
    this.tileManager = new TileManager(map);
    this.cameraManager.setZoom(3);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
