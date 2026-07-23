import { ComponentName, Event, TransitionConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class TransitionComponent extends Component {
  private entity: Entity;
  private config: TransitionConfig;
  private zone?: Phaser.GameObjects.Zone;
  private collider?: Phaser.Physics.Arcade.Collider;
  private fired = false;
  private armed = false;

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

    scene.events.on(Phaser.Scenes.Events.UPDATE, this._arm, this);
  }

  update(): void {
    if (!this.zone || !this.entity) return;

    this.zone.setPosition(
      this.entity.x + this.config.offsetX,
      this.entity.y + this.config.offsetY,
    );
  }

  detach(): void {
    this.entity.scene.events.off(Phaser.Scenes.Events.UPDATE, this._arm, this);
    this.zone?.destroy();
    this.collider?.destroy();
  }

  private _arm(): void {
    if (this.armed || !this.zone) return;

    const player = this.entity.scene.managers.players.player;
    if (!player?.body) return;

    const a = this.zone.body as Phaser.Physics.Arcade.Body;
    const b = player.body as Phaser.Physics.Arcade.Body;

    const clear =
      a.right <= b.left ||
      a.left >= b.right ||
      a.bottom <= b.top ||
      a.top >= b.bottom;

    if (clear) {
      this.armed = true;
      this.entity.scene.events.off(
        Phaser.Scenes.Events.UPDATE,
        this._arm,
        this,
      );
    }
  }

  private _enter(_zone: any, player: any): void {
    if (this.fired || !this.armed) return;

    const local = player as Entity;
    if (local !== this.entity.scene.managers.players.player) return;

    this.fired = true;

    this.entity.scene.game.events.emit(Event.PLAYER_TRANSITION, {
      to: this.config.to,
      x: this.config.x,
      y: this.config.y,
      from: this.entity.id,
    });

    this.entity.scene.time.delayedCall(1000, () => {
      this.fired = false;
    });
  }
}
