import { MapName } from "@server/types";
import { Texture } from "../loaders/Texture";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class GlassblowerScene extends Scene {
  constructor() {
    super(MapName.GLASSBLOWER_HOUSE);
  }

  preload() {
    Texture.load(this, MapName.GLASSBLOWER_HOUSE);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.GLASSBLOWER_HOUSE);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
