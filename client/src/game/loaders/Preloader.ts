import { MapName } from "@server/types";
import { Scene } from "../scenes/Scene";
import { configs } from "@server/configs";

export class Preloader {
  static load(scene: Scene, map: MapName) {
    const config = configs.maps[map];

    if (!config) throw new Error(`Map config for ${map} not found`);

    /**
     * Particle textures
     */
    if (!scene.textures.exists("particle_circle")) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff);
      g.fillCircle(8, 8, 8);
      g.generateTexture("particle_circle", 16, 16);
      g.destroy();
    }

    if (!scene.textures.exists("particle_diamond")) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff);
      g.beginPath();
      g.moveTo(8, 0);
      g.lineTo(16, 12);
      g.lineTo(8, 24);
      g.lineTo(0, 12);
      g.closePath();
      g.fillPath();
      g.generateTexture("particle_diamond", 16, 24);
      g.destroy();
    }

    if (!scene.textures.exists("particle_square")) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff);
      g.fillRect(2, 2, 12, 12);
      g.generateTexture("particle_square", 16, 16);
      g.destroy();
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
