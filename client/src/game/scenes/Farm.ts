import { MapName } from "@server/types";
import { Texture } from "../loaders/Texture";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class FarmScene extends Scene {
  constructor() {
    super(MapName.FARM_HOUSE);
  }

  preload() {
    Texture.load(this, MapName.FARM_HOUSE);
  }

  create() {
    super.create();

    const { tilemap, thresholds } = MapFactory.create(this, MapName.FARM_HOUSE);
    this.tileManager = new TileManager(tilemap, thresholds);
    this.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
