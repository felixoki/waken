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

    const map = MapFactory.create(this, MapName.VILLAGE);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();

    this.managers.sound.play.music(MusicName.OBLIVION);
  }
}
