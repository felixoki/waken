import { ComponentName, Event, TransitionConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class TransitionComponent extends Component {
  private entity: Entity;
  private config: TransitionConfig;
  private zone?: Phaser.GameObjects.Zone;
  private collider?: Phaser.Physics.Arcade.Collider;
  private fired = false;

  public name = ComponentName.TRANSITION;

  constructor(entity: Entity, config: TransitionConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    const scene = this.entity.scene;
    const { width, height, offsetX, offsetY } = this.config;

    const x = this.entity.x + offsetX;
    const y = this.entity.y + offsetY;

    this.zone = scene.add.zone(x, y, width, height);
    scene.physics.add.existing(this.zone);

    const body = this.zone.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);

    const group = scene.physicsManager.groups.players;

    this.collider = scene.physics.add.collider(
      this.zone,
      group,
      this._enter,
      undefined,
      this,
    );
  }

  update(): void {
    if (!this.zone || !this.entity) return;

    this.zone.setPosition(
      this.entity.x + this.config.offsetX,
      this.entity.y + this.config.offsetY,
    );
  }

  detach(): void {
    this.zone?.destroy();
    this.collider?.destroy();
  }

  private _enter(_zone: any, player: any): void {
    if (this.fired) return;

    const local = player as Entity;
    if (local !== this.entity.scene.managers.players.player) return;

    this.fired = true;

    this.entity.scene.game.events.emit(Event.PLAYER_TRANSITION, {
      to: this.config.to,
      x: this.config.x,
      y: this.config.y,
    });

    setTimeout(() => {
      this.fired = false;
    }, 1000);
  }
}
