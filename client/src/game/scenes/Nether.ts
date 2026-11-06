import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { Texture } from "../loaders/Texture";
import { TileManager } from "../managers/Tile";

export default class NetherScene extends Scene {
  constructor() {
    super(MapName.NETHER);
  }

  preload() {
    Texture.load(this, MapName.NETHER);
  }

  create() {
    super.create();

    const { tilemap, thresholds, colliders } = MapFactory.create(this, MapName.NETHER);
    this.setTiles(new TileManager(tilemap, thresholds, colliders));
    this.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
