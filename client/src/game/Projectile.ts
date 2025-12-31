import { Hitbox } from "./Hitbox";
import { Scene } from "./scenes/Scene";

export class Projectile extends Hitbox {
  private start: { x: number; y: number };
  private range: number;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    ownerId: string,
    speed: number,
    range: number,
    direction: { x: number; y: number }
  ) {
    super(scene, x, y, width, height, ownerId);

    this.start = { x, y };
    this.range = range;

    this.body.setVelocity(direction.x * speed, direction.y * speed);
    scene.events.on("update", this.update, this);
  }

  update(): void {
    const distance = Phaser.Math.Distance.Between(
      this.start.x,
      this.start.y,
      this.x,
      this.y
    );

    if (distance >= this.range) this.destroy();
  }

  destroy(fromScene?: boolean): void {
    this.scene.events.off("update", this.update, this);
    super.destroy(fromScene);
  }
}
