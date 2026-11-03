import { BodyConfig, ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class BodyComponent extends Component {
  private entity: Entity;
  private config: BodyConfig;
  private frame = { width: 0, height: 0 };
  private applied = { width: 0, height: 0 };

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

      this.entity.isStatic = true;

      return;
    }

    const body = this.entity.body as Phaser.Physics.Arcade.Body;
    this.frame = { width: this.entity.frame.width, height: this.entity.frame.height };

    body.setSize(this.config.width, this.config.height);
    body.setOffset(this.config.offsetX, this.config.offsetY);
    body.setImmovable(this.config.immovable || false);
    body.pushable = this.config.pushable || false;

    const group = collides
      ? this.entity.scene.physicsManager.groups.entities
      : this.entity.scene.physicsManager.groups.overlaps;

    group.add(this.entity);

    if (this.config.static) this.entity.isStatic = true;
  }

  update(): void {
    if (this.entity.isStatic || !this.frame.width) return;

    const body = this.entity.body as Phaser.Physics.Arcade.Body | null;
    const { width, height } = this.entity.frame;
    if (!body || (width === this.applied.width && height === this.applied.height)) return;

    this.applied = { width, height };
    body.setOffset(
      this.config.offsetX + (width - this.frame.width) / 2,
      this.config.offsetY + (height - this.frame.height) / 2,
    );
  }

  detach(): void {}
}
