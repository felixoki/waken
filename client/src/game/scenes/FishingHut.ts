import { MapName } from "@server/types";
import { Texture } from "../loaders/Texture";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class FishingHutScene extends Scene {
  constructor() {
    super(MapName.FISHING_HUT);
  }

  preload() {
    Texture.load(this, MapName.FISHING_HUT);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.FISHING_HUT);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
