import { AuraConfig, ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class AuraComponent extends Component {
  name = ComponentName.AURA;

  private entity: Entity;
  private ambient: Phaser.GameObjects.Particles.ParticleEmitter;
  private ambientWhite: Phaser.GameObjects.Particles.ParticleEmitter;
  private tints: number[];
  private trailTimer: number = 0;
  private trailInterval: number = 80;
  private trails: Set<Phaser.GameObjects.Particles.ParticleEmitter> = new Set();
  private timers: Set<Phaser.Time.TimerEvent> = new Set();

  constructor(entity: Entity, config: AuraConfig) {
    super();

    this.entity = entity;
    this.tints = config.tints;

    this.ambient = entity.scene.add.particles(
      entity.x,
      entity.y,
      "particle_square",
      {
        tint: this.tints,
        alpha: { start: 0.7, end: 0 },
        scale: { start: 0.15, end: 0.02 },
        speed: { min: 3, max: 12 },
        angle: { min: 0, max: 360 },
        lifespan: config.lifespan ?? 4000,
        frequency: config.frequency ?? 80,
        quantity: config.quantity ?? 3,
        blendMode: "NORMAL",
      },
    );
    this.ambient.setDepth(entity.depth - 1);

    this.ambientWhite = entity.scene.add.particles(
      entity.x,
      entity.y,
      "particle_square",
      {
        tint: [0xccccff, 0xddddff, 0xeeeeff, 0xffffff],
        alpha: { start: 0.5, end: 0 },
        scale: { start: 0.1, end: 0.01 },
        speed: { min: 3, max: 10 },
        angle: { min: 0, max: 360 },
        lifespan: 3500,
        frequency: 120,
        quantity: 1,
        blendMode: "ADD",
      },
    );
    this.ambientWhite.setDepth(entity.depth - 1);
  }

  update(): void {
    const { x, y } = this.entity;
    const body = this.entity.body as Phaser.Physics.Arcade.Body;

    this.ambient.setPosition(x, y);
    this.ambient.setDepth(this.entity.depth - 1);
    this.ambientWhite.setPosition(x, y);
    this.ambientWhite.setDepth(this.entity.depth - 1);

    const isMoving =
      body && (Math.abs(body.velocity.x) > 1 || Math.abs(body.velocity.y) > 1);
    const speed = body
      ? Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2)
      : 0;
    const interval = speed > 200 ? 10 : this.trailInterval;

    if (isMoving) {
      this.trailTimer += this.entity.scene.game.loop.delta;

      if (this.trailTimer >= interval) {
        this.trailTimer = 0;

        const ember = this.entity.scene.add.particles(x, y, "particle_square", {
          tint: this.tints,
          alpha: { start: 0.6, end: 0 },
          scale: { start: 0.12, end: 0.01 },
          speed: { min: 3, max: 12 },
          angle: { min: 0, max: 360 },
          lifespan: 5000,
          quantity: 3,
          frequency: -1,
          blendMode: "NORMAL",
        });
        ember.setDepth(this.entity.depth - 1);
        ember.explode();
        this.trails.add(ember);

        const whiteEmber = this.entity.scene.add.particles(
          x,
          y,
          "particle_square",
          {
            tint: [0xccccff, 0xddddff, 0xffffff],
            alpha: { start: 0.4, end: 0 },
            scale: { start: 0.08, end: 0.01 },
            speed: { min: 3, max: 10 },
            angle: { min: 0, max: 360 },
            lifespan: 4000,
            quantity: 2,
            frequency: -1,
            blendMode: "ADD",
          },
        );
        whiteEmber.setDepth(this.entity.depth - 1);
        whiteEmber.explode();
        this.trails.add(whiteEmber);

        const timer = this.entity.scene.time.delayedCall(5000, () => {
          ember.destroy();
          whiteEmber.destroy();
          this.trails.delete(ember);
          this.trails.delete(whiteEmber);
          this.timers.delete(timer);
        });

        this.timers.add(timer);
      }
    } else this.trailTimer = 0;
  }

  detach(): void {
    this.timers.forEach((t) => t.destroy());
    this.timers.clear();
    this.ambient.destroy();
    this.ambientWhite.destroy();
    this.trails.forEach((e) => e.destroy());
    this.trails.clear();
  }
}
