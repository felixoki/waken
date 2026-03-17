import { GAME_HEIGHT, GAME_WIDTH } from "@server/globals";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";

export class CameraManager {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  follow(target: Entity): void {
    this.camera.startFollow(target, false);
  }

  setZoom(zoom: number): void {
    this.camera.setZoom(zoom);
  }

  fitZoom(): void {
    const calc = (w: number, h: number) =>
      Math.min(w / GAME_WIDTH, h / GAME_HEIGHT);

    this.setZoom(calc(this.scene.scale.width, this.scene.scale.height));

    this.scene.scale.on("resize", (size: Phaser.Structs.Size) => {
      this.setZoom(calc(size.width, size.height));
    });
  }

  getWorldPoint(x: number, y: number): Phaser.Math.Vector2 {
    return this.camera.getWorldPoint(x, y);
  }

  getScreenPosition(
    x: number,
    y: number,
    entity: Entity,
  ): { x: number; y: number } {
    return {
      x: this.camera.centerX + (x - entity.x) * this.camera.zoom,
      y: this.camera.centerY + (y - entity.y) * this.camera.zoom,
    };
  }
}
