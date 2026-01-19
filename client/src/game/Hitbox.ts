import { SpellConfig } from "@server/types";
import { Scene } from "./scenes/Scene";

export class Hitbox extends Phaser.GameObjects.Rectangle {
  protected emitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  public hits = new Set<string>();
  public ownerId: string;
  public config: SpellConfig;

  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    ownerId: string,
    config: SpellConfig,
  ) {
    super(scene, x, y, width, height);

    this.ownerId = ownerId;
    this.config = config;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physicsManager.groups.hits.add(this);

    if (config.particles) {
      this.emitter = this.scene.add.particles(
        x,
        y,
        "particles",
        config.particles,
      );
      this.emitter.setDepth(1000);
    }

    /**
     * We should add proper shaders later on
     */
    if (config.shader) {
      this.setDepth(9999);
      this.setFillStyle(0xffffff, 0.3);
    }

    if (config.duration)
      scene.time.delayedCall(config.duration, () => this.destroy());
  }

  destroy(fromScene?: boolean): void {
    if (this.emitter) {
      this.emitter.stop();
      this.emitter.destroy();
    }

    super.destroy(fromScene);
  }
}
