import { ComponentName, GlimmerConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { light } from "../handlers/light";

export class GlimmerComponent extends Component {
  name = ComponentName.GLIMMER;

  public entity: Entity;
  public light: Phaser.GameObjects.Light;
  public intensity: number;
  public active: boolean = true;

  private radius: number;
  private base: number;
  private gain: number;
  private fire: Phaser.GameObjects.Particles.ParticleEmitter;
  private smoke: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(entity: Entity, config: GlimmerConfig) {
    super();

    this.entity = entity;
    this.radius = config.radius;
    this.base = config.intensity;
    this.gain = light.gain(entity.scene, config.radius);
    this.intensity = this.base * this.gain;

    this.light = entity.scene.lights.addLight(
      entity.x,
      entity.y,
      light.radius(entity.scene, config.radius),
      config.color,
      this.intensity,
    );

    entity.scene.scale.on("resize", this._resize, this);

    this.fire = entity.scene.add.particles(entity.x, entity.y, "particle_circle", {
      tint: [0xff6600, 0xff9922, 0xffcc44, 0xffee88],
      alpha: { start: 0, end: 0.75 },
      scale: { start: 0.03, end: 0.08 },
      speed: { min: 0.2, max: 0.8 },
      angle: { min: 240, max: 300 },
      gravityY: -5,
      lifespan: 2200,
      frequency: 300,
      quantity: 1,
      x: { min: -6, max: 6 },
      y: { min: -4, max: 4 },
      blendMode: "ADD",
    });
    this.fire.setDepth(999999);

    this.smoke = entity.scene.add.particles(entity.x, entity.y, "particle_circle", {
      tint: [0x888888, 0xaaaaaa, 0xcccccc],
      alpha: { start: 0, end: 0.18 },
      scale: { start: 0.05, end: 0.2 },
      speed: { min: 0.1, max: 0.6 },
      angle: { min: 240, max: 300 },
      gravityY: -2,
      lifespan: 3500,
      frequency: 500,
      quantity: 1,
      x: { min: -8, max: 8 },
      y: { min: -4, max: 4 },
      blendMode: "NORMAL",
    });
    this.smoke.setDepth(999999);
  }

  private _resize(): void {
    const gain = light.gain(this.entity.scene, this.radius);

    this.light.setRadius(light.radius(this.entity.scene, this.radius));
    this.light.intensity *= gain / this.gain;
    this.intensity = this.base * gain;
    this.gain = gain;
  }

  update() {
    const { x, y } = this.entity;
    this.light.setPosition(x, y);
    this.fire.setPosition(x, y);
    this.smoke.setPosition(x, y);
  }

  detach() {
    this.entity.scene.scale.off("resize", this._resize, this);
    this.entity.scene.lights.removeLight(this.light);
    this.fire.destroy();
    this.smoke.destroy();
  }
}
