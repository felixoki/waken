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
          0,
        );

        return tileset;
      })
      .filter((t): t is Phaser.Tilemaps.Tileset => t !== null);

    tilemap.layers.forEach((data, index) => {
      const name = data.name;

      /**
       * We will do this with a boolean from Tiled in the future
       */
      if (name === "objects") return;

      const properties = data.properties as TiledProperty[] | undefined;
      const hasCollision = properties?.some(
        (prop) => prop.name === "collides" && prop.value === true,
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

    /**
     * We will do this with a boolean from Tiled in the future
     */
    const objectLayers = tilemap.objects;

    objectLayers.forEach((layer) => {
      if (layer.name.includes("details"))
        this.createStaticLayer(scene, tilemap, layer);
    });

    return tilemap;
  }

  private static createStaticLayer(
    scene: Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.ObjectLayer,
  ): void {
    layer.objects.forEach((obj) => {
      if (!obj.gid) return;

      /**
       * Hardcoded for now, will be dynamic later
       */
      let textureKey = "ground_grass_details";
      if (layer.name === "flowers_details") textureKey = "village_home";

      const tileset = tilemap.tilesets.find((ts) => ts.name === textureKey);
      if (!tileset) return;

      const id = obj.gid - tileset.firstgid;
      const x = obj.x ?? 0;
      const y = obj.y ?? 0;

      const image = scene.add.image(x, y, textureKey, id);
      image.setOrigin(0, 1);
      image.setDepth(50);
    });
  }
}
