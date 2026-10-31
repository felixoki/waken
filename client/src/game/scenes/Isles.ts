import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { Texture } from "../loaders/Texture";
import { TileManager } from "../managers/Tile";

export default class IslesScene extends Scene {
  private clouds: {
    layer: Phaser.Tilemaps.TilemapLayer;
    amplitude: number;
    period: number;
  }[] = [];

  constructor() {
    super(MapName.ISLES);
  }

  preload() {
    Texture.load(this, MapName.ISLES);
  }

  create() {
    super.create();

    const { tilemap, thresholds, colliders } = MapFactory.create(this, MapName.ISLES);
    this.setTiles(new TileManager(tilemap, thresholds, colliders));
    this.physics.world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    this.clouds = (["clouds3", "clouds2", "clouds1"] as const).flatMap((name, i) => {
      const layer = tilemap.getLayer(name)?.tilemapLayer;
      return layer ? [{ layer, amplitude: 3 + i * 2, period: 48000 - i * 10000 }] : [];
    });

    this.cameraManager.fitZoom();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    for (const c of this.clouds)
      c.layer.x = Math.sin((time / c.period) * Math.PI * 2) * c.amplitude;
  }
}
