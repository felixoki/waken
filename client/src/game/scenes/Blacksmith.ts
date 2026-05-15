import { MapName } from "@server/types";
import { Texture } from "../loaders/Texture";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class BlacksmithScene extends Scene {
  constructor() {
    super(MapName.BLACKSMITH_HOUSE);
  }

  preload() {
    Texture.load(this, MapName.BLACKSMITH_HOUSE);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.BLACKSMITH_HOUSE);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
