import { SpellConfig } from "@server/types";
import { Hitbox } from "./Hitbox";
import { Scene } from "./scenes/Scene";

export class Projectile extends Hitbox {
  private start: { x: number; y: number };
  private range: number;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    ownerId: string,
    direction: { x: number; y: number },
    config: SpellConfig,
  ) {
    super(
      scene,
      x,
      y,
      config.hitbox!.width,
      config.hitbox!.height,
      ownerId,
      config,
    );

    this.start = { x, y };
    this.range = config.range!;

    this.body.setVelocity(
      direction.x * config.speed!,
      direction.y * config.speed!,
    );

    scene.events.on("update", this.update, this);
  }

  update(): void {
    const distance = Phaser.Math.Distance.Between(
      this.start.x,
      this.start.y,
      this.x,
      this.y,
    );

    if (distance >= this.range) this.destroy();
  }

  setEmitter(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
    this.emitter = emitter;
    this.emitter.setPosition(0, 0);
    this.emitter.startFollow(this);
  }

  destroy(fromScene?: boolean): void {
    this.scene.events.off("update", this.update, this);

    if (this.emitter) {
      this.emitter.stop();
      this.emitter.destroy();
    }

    super.destroy(fromScene);
  }
}
