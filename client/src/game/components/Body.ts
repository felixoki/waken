import { BodyConfig, ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class BodyComponent extends Component {
  private entity: Entity;
  private config: BodyConfig;

  public name: ComponentName = ComponentName.BODY;

  constructor(entity: Entity, config: BodyConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    const collides = this.config.collides ?? true;
    const useStaticBody = this.config.static && collides;

    this.entity.scene.physics.add.existing(this.entity, useStaticBody);

    if (useStaticBody) {
      const body = this.entity.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(this.config.width, this.config.height);
      body.setOffset(this.config.offsetX, this.config.offsetY);

      this.entity.scene.physicsManager.groups.statics.add(this.entity);
      this.entity.isStatic = true;

      return;
    }

    const body = this.entity.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.config.width, this.config.height);
    body.setOffset(this.config.offsetX, this.config.offsetY);
    body.pushable = this.config.pushable || false;
    body.setImmovable(this.config.immovable || false);

    const group = collides
      ? this.entity.scene.physicsManager.groups.entities
      : this.entity.scene.physicsManager.groups.overlaps;

    group.add(this.entity);

    if (this.config.static) this.entity.isStatic = true;
  }

  update(): void {}

  detach(): void {}
}
