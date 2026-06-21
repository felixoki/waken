import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { Texture } from "../loaders/Texture";
import { TileManager } from "../managers/Tile";

export default class IslesScene extends Scene {
  constructor() {
    super(MapName.ISLES);
  }

  preload() {
    Texture.load(this, MapName.ISLES);
  }

  create() {
    super.create();

    const { tilemap, thresholds } = MapFactory.create(this, MapName.ISLES);
    this.tileManager = new TileManager(tilemap, thresholds);
    this.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
