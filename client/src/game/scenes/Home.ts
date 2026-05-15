import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { Texture } from "../loaders/Texture";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class HomeScene extends Scene {
  constructor() {
    super(MapName.HOME);
  }

  preload() {
    Texture.load(this, MapName.HOME);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.HOME);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
