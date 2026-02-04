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

    const objectLayers = tilemap.objects;

    objectLayers.forEach((layer) => {
      const properties = layer.properties as TiledProperty[];

      if (!properties || !Array.isArray(properties)) return;

      const render = properties.some(
        (prop) => prop.name === "renders" && prop.value === true,
      );

      const texture = properties.find((prop) => prop.name === "texture");

      if (render && texture)
        this.createStaticLayer(scene, tilemap, layer, texture.value);
    });

    return tilemap;
  }

  private static createStaticLayer(
    scene: Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.ObjectLayer,
    texture: string,
  ): void {
    layer.objects.forEach((obj) => {
      if (!obj.gid) return;

      const tileset = tilemap.tilesets.find((ts) => ts.name === texture);
      if (!tileset) return;

      const id = obj.gid - tileset.firstgid;
      const x = obj.x ?? 0;
      const y = obj.y ?? 0;

      const image = scene.add.image(x, y, texture, id);
      image.setOrigin(0, 1);
      image.setDepth(50);
    });
  }
}
