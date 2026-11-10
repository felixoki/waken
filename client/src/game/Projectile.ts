import { SpellConfig } from "@server/types";
import { Hitbox } from "./Hitbox";
import { Scene } from "./scenes/Scene";
import { depth } from "./vfx/depth";
export class Projectile extends Hitbox {
  private start: { x: number; y: number };
  private range: number;
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private biases: number[] = [];
  private depthY: number;

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
    this.depthY = Math.round(y);
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

    if (distance >= this.range) {
      this.destroy();
      return;
    }

    const depthY = Math.round(this.y);
    if (depthY === this.depthY) return;

    this.depthY = depthY;
    for (let i = 0; i < this.emitters.length; i++)
      this.emitters[i].setDepth(depth.at(this.y, this.biases[i]));
  }

  setEmitter(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
    emitter.setPosition(0, 0);
    emitter.startFollow(this);
    this.biases.push(emitter.depth - depth.at(this.y));
    this.emitters.push(emitter);
  }

  destroy(fromScene?: boolean): void {
    this.scene.events.off("update", this.update, this);

    for (const emitter of this.emitters) {
      emitter.stop();
      emitter.destroy();
    }

    super.destroy(fromScene);
  }
}
