import { ComponentName, LightConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { light } from "../handlers/light";

export class LightComponent extends Component {
  name = ComponentName.LIGHT;

  public entity: Entity;
  public light: Phaser.GameObjects.Light;
  public intensity: number;
  public active: boolean = true;

  private radius: number;
  private base: number;
  private gain: number;

  constructor(entity: Entity, config: LightConfig) {
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
  }

  private _resize(): void {
    const gain = light.gain(this.entity.scene, this.radius);

    this.light.setRadius(light.radius(this.entity.scene, this.radius));
    this.light.intensity *= gain / this.gain;
    this.intensity = this.base * gain;
    this.gain = gain;
  }

  setActive(active: boolean): void {
    this.active = active;
    this.light.intensity = active ? this.intensity : 0;
  }

  update() {
    this.light.setPosition(this.entity.x, this.entity.y);
  }

  detach() {
    this.entity.scene.scale.off("resize", this._resize, this);
    this.entity.scene.lights.removeLight(this.light);
  }
}
