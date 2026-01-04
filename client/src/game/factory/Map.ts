import { MapName, TiledProperty } from "@server/types";
import { Scene } from "../scenes/Scene";

export class MapFactory {
  static create(scene: Scene, map: MapName, name: string, key: string) {
    const tilemap = scene.make.tilemap({ key: map });
    const tileset = tilemap.addTilesetImage(name, key, 16, 16, 0, 0);

    if (!tileset)
      throw new Error(`Tileset with name ${name} and key ${key} not found`);

    tilemap.layers.forEach((data, index) => {
      const name = data.name;

      if (name === "objects") return;

      const properties = data.properties as TiledProperty[] | undefined;
      const hasCollision = properties?.some(
        (prop) => prop.name === "collides" && prop.value === true
      );

      const layer = tilemap.createLayer(name, tileset, 0, 0);

      if (!layer) return;

      if (hasCollision) {
        layer.setCollisionByExclusion([-1, 0]);
        
        scene.physics.add.collider(
          scene.physicsManager.groups.players,
          layer
        );
        scene.physics.add.collider(
          scene.physicsManager.groups.entities,
          layer
        );
      }
      
      layer.setDepth(index * 10);
    });
  }
}
