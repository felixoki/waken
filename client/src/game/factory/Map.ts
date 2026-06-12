import { MapName, TiledProperty } from "@server/types";
import { Scene } from "../scenes/Scene";
import { configs } from "@server/configs";
import { Threshold } from "../managers/Tile";

export class MapFactory {
  static create(
    scene: Scene,
    map: MapName,
  ): { tilemap: Phaser.Tilemaps.Tilemap; thresholds: Threshold[] } {
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

    const rawLayers = scene.cache.tilemap.get(map)?.data?.layers ?? [];

    let tileLayerIndex = 0;
    let objectLayerIndex = 0;

    const thresholds: Threshold[] = [];

    rawLayers.forEach((rawLayer: any, overallIndex: number) => {
      const depth = overallIndex * 10;

      if (rawLayer.type === "tilelayer") {
        const data = tilemap.layers[tileLayerIndex];
        const currentIndex = tileLayerIndex;
        tileLayerIndex++;

        if (!data || data.name === "objects") return;

        const properties = data.properties as TiledProperty[] | undefined;

        const hasCollision = properties?.some(
          (prop) => prop.name === "collides" && prop.value === true,
        );

        const rendersAbove = properties?.some(
          (prop) => prop.name === "rendersAbove" && prop.value === true,
        );

        const layer = tilemap.createLayer(currentIndex, tilesets, 0, 0);

        if (!layer) return;

        if (hasCollision) {
          layer.setCollisionByExclusion([-1, 0]);
          this.createCollisions(scene, layer, thresholds);
        }

        layer.setDepth(rendersAbove ? 10000 + depth : depth);
      }

      if (rawLayer.type === "objectgroup") {
        const layer = tilemap.objects[objectLayerIndex];
        objectLayerIndex++;

        if (!layer) return;

        const properties = layer.properties as TiledProperty[];

        if (!properties || !Array.isArray(properties)) return;

        const render = properties.some(
          (prop) => prop.name === "renders" && prop.value === true,
        );

        const rendersAbove = properties.some(
          (prop) => prop.name === "rendersAbove" && prop.value === true,
        );

        const texture = properties.find((prop) => prop.name === "texture");

        const layerDepth = rendersAbove ? 10000 + depth : depth;

        if (render && texture)
          this.createStaticLayer(
            scene,
            tilemap,
            layer,
            texture.value,
            layerDepth,
          );
      }
    });

    return { tilemap, thresholds };
  }

  private static createStaticLayer(
    scene: Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    layer: Phaser.Tilemaps.ObjectLayer,
    texture: string,
    depth: number,
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
      image.setDepth(depth);
    });
  }

  private static createCollisions(
    scene: Scene,
    layer: Phaser.Tilemaps.TilemapLayer,
    thresholds: Threshold[],
  ): void {
    const tiles = layer.getTilesWithin().filter((t) => t.collides);
    let bodies = 0;

    tiles.forEach((tile) => {
      const tileset = tile.tileset;
      if (!tileset) return;

      const id = tile.index - tileset.firstgid;
      const data = (tileset as any).tileData?.[id];

      if (!data?.objectgroup?.objects) return;

      let isThreshold = false;

      data.objectgroup.objects.forEach((obj: any) => {
        const worldX = tile.pixelX + (obj.x || 0);
        const worldY = tile.pixelY + (obj.y || 0);

        if (!obj.width || !obj.height) return;

        const rendersAbove = obj.properties?.find(
          (p: any) => p.name === "rendersAbove",
        );

        const rect = scene.add.rectangle(
          worldX + obj.width / 2,
          worldY + obj.height / 2,
          obj.width,
          obj.height,
        );

        rect.setVisible(false);
        scene.physics.add.existing(rect, true);

        if (rendersAbove !== undefined) {
          isThreshold = true;

          scene.physics.add.collider(
            scene.managers.physics.groups.players,
            rect,
          );
          scene.physics.add.collider(
            scene.managers.physics.groups.entities,
            rect,
          );

          thresholds.push({
            body: rect,
            tileY: tile.pixelY,
            rendersAbove: rendersAbove.value,
          });

          return;
        }

        scene.physics.add.collider(scene.managers.physics.groups.players, rect);
        scene.physics.add.collider(
          scene.managers.physics.groups.entities,
          rect,
        );

        bodies++;
      });

      if (isThreshold) {
        const tileset = tile.tileset!;
        const frame = tile.index - tileset.firstgid;
        const image = scene.add.image(
          tile.pixelX,
          tile.pixelY,
          tileset.name,
          frame,
        );

        image.setOrigin(0, 0);
        image.setDepth(1000 + tile.pixelY);
        tile.setVisible(false);
      }
    });
  }
}
