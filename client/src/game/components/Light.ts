import { ComponentName, LightConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class LightComponent extends Component {
  name = ComponentName.LIGHT;

  public entity: Entity;
  public light: Phaser.GameObjects.Light;
  public intensity: number;

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

  update() {
    this.light.setPosition(this.entity.x, this.entity.y);
  }

  detach() {
    this.entity.scene.lights.removeLight(this.light);
  }
}
