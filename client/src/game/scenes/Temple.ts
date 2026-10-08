import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";
import { configs } from "@server/configs";

export default class TempleScene extends Scene {
  constructor() {
    super(MapName.TEMPLE);
  }

  preload() {
    const config = configs.maps[MapName.TEMPLE];

    config.spritesheets.forEach((sheet) => {
      if (!this.textures.exists(sheet.key))
        this.load.spritesheet(sheet.key, `assets/sprites/${sheet.file}`, {
          frameWidth: sheet.frameWidth || 64,
          frameHeight: sheet.frameHeight || 64,
        });
    });
  }

  create() {
    super.create();

    const { tilemap, thresholds, colliders } = MapFactory.create(
      this,
      MapName.TEMPLE,
    );
    this.setTiles(new TileManager(tilemap, thresholds, colliders));
    this.physics.world.setBounds(
      0,
      0,
      tilemap.widthInPixels,
      tilemap.heightInPixels,
    );

    this.cameraManager.fitZoom();
  }

  teardown(): void {
    super.teardown();
    this.cache.tilemap.remove(MapName.TEMPLE);
  }

  rebuild(tilemap: any): void {
    super.create();

    this.cache.tilemap.add(MapName.TEMPLE, {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: tilemap,
    });

    const {
      tilemap: map,
      thresholds,
      colliders,
    } = MapFactory.create(this, MapName.TEMPLE);
    this.setTiles(new TileManager(map, thresholds, colliders));
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
