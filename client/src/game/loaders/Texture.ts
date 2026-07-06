import { MapName } from "@server/types";
import { Scene } from "../scenes/Scene";
import { configs } from "@server/configs";
import { handlers } from "../handlers";

export class Texture {
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

    if (!scene.textures.exists("particle_glow")) {
      const g = scene.add.graphics();

      const steps = 8;
      for (let i = steps; i > 0; i--) {
        g.fillStyle(0xffffff, 0.16);
        g.fillCircle(16, 16, (16 * i) / steps);
      }
      g.generateTexture("particle_glow", 32, 32);
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

    handlers.textures.fangs(scene);
    handlers.textures.clouds(scene);

    if (!scene.textures.exists("particle_square")) {
      const g = scene.add.graphics();

      g.fillStyle(0xffffff);
      g.fillRect(2, 2, 12, 12);
      g.generateTexture("particle_square", 16, 16);
      g.destroy();
    }

    if (!scene.textures.exists("particle_leaf")) {
      const g = scene.add.graphics();

      g.fillStyle(0xffffff);
      g.fillPoints(
        [
          { x: 8, y: 0 },
          { x: 12, y: 5 },
          { x: 11, y: 11 },
          { x: 8, y: 16 },
          { x: 5, y: 11 },
          { x: 4, y: 5 },
        ],
        true,
      );
      g.generateTexture("particle_leaf", 16, 16);
      g.destroy();
    }

    if (!scene.textures.exists("particle_heart")) {
      const g = scene.add.graphics();

      g.fillStyle(0xffffff);
      g.fillCircle(5, 5, 4);
      g.fillCircle(11, 5, 4);
      g.fillTriangle(1, 6, 15, 6, 8, 15);
      g.generateTexture("particle_heart", 16, 16);
      g.destroy();
    }

    if (!scene.textures.exists("particle_butterfly")) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff);

      g.fillTriangle(7, 7, 1, 1, 1, 9);
      g.fillTriangle(7, 9, 2, 9, 3, 14);
      g.fillTriangle(9, 7, 15, 1, 15, 9);
      g.fillTriangle(9, 9, 14, 9, 13, 14);
      g.fillRect(7, 3, 2, 12);

      g.generateTexture("particle_butterfly", 16, 16);
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
      if (!scene.textures.exists(spritesheet.key))
        scene.load.spritesheet(
          spritesheet.key,
          `assets/sprites/${spritesheet.file}`,
          {
            frameWidth: spritesheet.frameWidth || 64,
            frameHeight: spritesheet.frameHeight || 64,
          },
        );
    });
  }
}

