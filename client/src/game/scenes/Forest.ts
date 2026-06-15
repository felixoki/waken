import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";
import { configs } from "@server/configs";

export default class ForestScene extends Scene {
  constructor() {
    super(MapName.FOREST);
  }

  preload() {
    const config = configs.maps[MapName.FOREST];

    config.spritesheets.forEach((sheet) => {
      if (!this.textures.exists(sheet.key)) {
        this.load.spritesheet(sheet.key, `assets/sprites/${sheet.file}`, {
          frameWidth: sheet.frameWidth || 64,
          frameHeight: sheet.frameHeight || 64,
        });
      }
    });
  }

  create() {
    super.create();

    const { tilemap, thresholds } = MapFactory.create(this, MapName.FOREST);
    this.tileManager = new TileManager(tilemap, thresholds);
    this.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    this.cameraManager.fitZoom();
  }

  teardown(): void {
    this.children.removeAll(true);
    this.tileManager?.destroy();
    this.tileManager = undefined!;
    this.cache.tilemap.remove(MapName.FOREST);
  }

  rebuild(tilemap: any): void {
    super.create();

    this.cache.tilemap.add(MapName.FOREST, {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: tilemap,
    });

    const { tilemap: map, thresholds } = MapFactory.create(this, MapName.FOREST);
    this.tileManager = new TileManager(map, thresholds);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
