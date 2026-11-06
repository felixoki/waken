import { ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class HiveComponent extends Component {
  public name = ComponentName.HIVE;

  private entity: Entity;
  private offset: { x: number; y: number };
  private hive: Phaser.GameObjects.Image | null = null;
  private bees: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(entity: Entity, offset: { x: number; y: number }) {
    super();
    this.entity = entity;
    this.offset = offset;
  }

  get position(): { x: number; y: number } {
    return {
      x: this.entity.x + this.offset.x,
      y: this.entity.y + this.offset.y + 11,
    };
  }

  attach(): void {
    const { scene } = this.entity;
    const depth = this.entity.depth + 0.5;
    const { x, y } = this.position;

    this.hive = scene.add
      .image(this.entity.x + this.offset.x, this.entity.y + this.offset.y, "beehive")
      .setOrigin(0.5, 0)
      .setDepth(depth);

    this.bees = scene.add
      .particles(x, y, "bee", {
        alpha: { start: 1, end: 0.7 },
        speed: { min: 4, max: 12 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 900, max: 1600 },
        frequency: 200,
        quantity: 1,
        maxAliveParticles: 8,
        emitZone: {
          type: "random",
          source: new Phaser.Geom.Circle(0, 0, 10),
          quantity: 1,
        },
      })
      .setDepth(depth + 0.01);
  }

  swarm(): void {
    const { scene } = this.entity;
    const { x, y } = this.position;

    const burst = scene.add
      .particles(x, y, "bee", {
        alpha: { start: 1, end: 0 },
        speed: { min: 20, max: 55 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 1400, max: 2400 },
        quantity: 28,
        frequency: -1,
        emitZone: {
          type: "random",
          source: new Phaser.Geom.Circle(0, 0, 6),
          quantity: 28,
        },
      })
      .setDepth(this.entity.depth + 1000);
    burst.explode();

    scene.time.delayedCall(2500, () => burst.destroy());
  }

  update(): void {}

  detach(): void {
    this.hive?.destroy();
    this.bees?.destroy();
    this.hive = null;
    this.bees = null;
  }
}
