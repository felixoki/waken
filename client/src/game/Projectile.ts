import { SpellName } from "@server/types";
import { Hitbox } from "./Hitbox";
import { Scene } from "./scenes/Scene";
import { configs } from "@server/configs";

export class Projectile extends Hitbox {
  private start: { x: number; y: number };
  private range: number;
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    ownerId: string,
    range: number,
    direction: { x: number; y: number },
    name: SpellName
  ) {
    const config = configs.spells[name];

    super(scene, x, y, config.hitbox.width, config.hitbox.height, ownerId, name);

    this.start = { x, y };
    this.range = range;

    this.body.setVelocity(direction.x * config.speed, direction.y * config.speed);

    this.emitter = this.scene.add.particles(0, 0, "particles", config.particles);
    this.emitter.setDepth(1000);
    this.emitter.startFollow(this);

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

    if (this.emitter) {
      this.emitter.stop();
      this.emitter.destroy();
    }

    super.destroy(fromScene);
  }
}
