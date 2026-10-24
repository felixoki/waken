import { MapName } from "@server/types";
import { Texture } from "../loaders/Texture";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class WindmillScene extends Scene {
  constructor() {
    super(MapName.WINDMILL);
  }

  preload() {
    Texture.load(this, MapName.WINDMILL);
  }

  create() {
    super.create();

    const { tilemap, thresholds, colliders } = MapFactory.create(this, MapName.WINDMILL);
    this.setTiles(new TileManager(tilemap, thresholds, colliders));
    this.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
