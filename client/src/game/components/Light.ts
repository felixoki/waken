import { ComponentName, LightConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class LightComponent extends Component {
  name = ComponentName.LIGHT;

  public entity: Entity;
  public light: Phaser.GameObjects.Light;
  public intensity: number;
  public active: boolean = true;

  constructor(entity: Entity, config: LightConfig) {
    super();

    this.entity = entity;
    this.intensity = config.intensity;
    this.light = entity.scene.lights.addLight(
      entity.x,
      entity.y,
      config.radius,
      config.color,
      config.intensity,
    );
  }

  setActive(active: boolean): void {
    this.active = active;
    this.light.intensity = active ? this.intensity : 0;
  }

  update() {
    this.light.setPosition(this.entity.x, this.entity.y);
  }

  detach() {
    this.entity.scene.lights.removeLight(this.light);
  }
}
