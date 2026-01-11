import { MapName, TiledProperty } from "@server/types";
import { Scene } from "../scenes/Scene";
import { configs } from "@server/configs";
export class MapFactory {
  static create(scene: Scene, map: MapName): Phaser.Tilemaps.Tilemap {
    const config = configs.maps[map];

    const tilemap = scene.make.tilemap({ key: map });
    const tilesets = config.spritesheets
      .filter((s) => s.asTileset)
      .map((s) => {
        const tileset = tilemap.addTilesetImage(
          s.key,
          s.key,
          s.frameWidth,
          s.frameHeight,
          0,
          0
        );

        return tileset;
      })
      .filter((t): t is Phaser.Tilemaps.Tileset => t !== null);

    tilemap.layers.forEach((data, index) => {
      const name = data.name;

      if (name === "objects") return;

      const properties = data.properties as TiledProperty[] | undefined;
      const hasCollision = properties?.some(
        (prop) => prop.name === "collides" && prop.value === true
      );

      const layer = tilemap.createLayer(name, tilesets, 0, 0);

      if (!layer) return;

      if (hasCollision) {
        layer.setCollisionByExclusion([-1, 0]);

        scene.physics.add.collider(scene.physicsManager.groups.players, layer);
        scene.physics.add.collider(scene.physicsManager.groups.entities, layer);
      }

      layer.setDepth(index * 10);
    });

    return tilemap;
  }
}
