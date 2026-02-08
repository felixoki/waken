import { MapName } from "@server/types";
import { Scene } from "../scenes/Scene";
import { configs } from "@server/configs";

export class Preloader {
  static load(scene: Scene, map: MapName) {
    const config = configs.maps[map];

    if (!config) throw new Error(`Map config for ${map} not found`);

    /**
     * Particle texture for spells
     */
    if (!scene.textures.exists("particles")) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture("particles", 16, 16);
      graphics.destroy();
    }

    /**
     * Tilemap
     */
    scene.load.tilemapTiledJSON(config.id, `assets/maps/${config.json}`);

    /**
     * Tilesets and spritesheets - only load if not already loaded
     */
    config.spritesheets.forEach((spritesheet) => {
      if (!scene.textures.exists(spritesheet.key)) {
        scene.load.spritesheet(
          spritesheet.key,
          `assets/sprites/${spritesheet.file}`,
          {
            frameWidth: spritesheet.frameWidth || 64,
            frameHeight: spritesheet.frameHeight || 64,
          }
        );
      }
    });
  }
}
