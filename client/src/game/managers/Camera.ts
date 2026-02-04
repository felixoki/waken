import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";

export class CameraManager {
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Scene) {
    this.camera = scene.cameras.main;
  }

  follow(target: Entity): void {
    this.camera.startFollow(target, false);
    this.camera.roundPixels = true;
  }

  setZoom(zoom: number): void {
    this.camera.setZoom(zoom);
  }

  getWorldPoint(x: number, y: number): Phaser.Math.Vector2 {
    return this.camera.getWorldPoint(x, y);
  }

  getScreenPosition(
    x: number,
    y: number,
    entity: Entity
  ): { x: number; y: number } {
    return {
      x: this.camera.centerX + (x - entity.x) * this.camera.zoom,
      y: this.camera.centerY + (y - entity.y) * this.camera.zoom,
    };
  }
}
