import { MapName, MusicName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { Texture } from "../loaders/Texture";
import { TileManager } from "../managers/Tile";

export default class VillageScene extends Scene {
  constructor() {
    super(MapName.VILLAGE);
  }

  preload() {
    Texture.load(this, MapName.VILLAGE);
  }

  create() {
    super.create();

    const { tilemap, thresholds } = MapFactory.create(this, MapName.VILLAGE);
    this.tileManager = new TileManager(tilemap, thresholds);
    this.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    this.cameraManager.fitZoom();

    this.managers.sound.play.music(MusicName.OBLIVION);
  }
}
