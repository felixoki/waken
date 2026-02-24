import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { Preloader } from "../loaders/Preloader";
import { TileManager } from "../managers/Tile";

export default class RealmScene extends Scene {
  constructor() {
    super(MapName.REALM);
  }

  preload() {
    Preloader.load(this, MapName.REALM);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.REALM);
    this.tileManager = new TileManager(map);
    this.cameraManager.setZoom(3);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
