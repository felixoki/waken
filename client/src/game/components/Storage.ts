import { ComponentName, Event, StorageConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { RANGE_INTERACTING } from "@server/globals";
import EventBus from "../EventBus";

export class StorageComponent extends Component {
  private static active: StorageComponent | null = null;

  private entity: Entity;
  private slots: number;
  private range = RANGE_INTERACTING;

  public name = ComponentName.STORAGE;

  static close(): void {
    const active = StorageComponent.active;
    if (active) EventBus.emit(Event.STORAGE_CLOSE, active.entity.id);
  }

  static tick(): void {
    StorageComponent.active?._check();
  }

  constructor(entity: Entity, config: StorageConfig) {
    super();
    this.entity = entity;
    this.slots = config.slots;
  }

  attach(): void {
    this.entity.on("pointed", this._open, this);
    this.entity.scene.game.events.on(Event.STORAGE_CLOSE, this._close, this);
    this.entity.scene.game.events.on(
      Event.STORAGE_CONFIRM,
      this._confirm,
      this,
    );
  }

  update(): void {}

  private _check(): void {
    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      player.x,
      player.y,
    );

    if (distance > this.range)
      EventBus.emit(Event.STORAGE_CLOSE, this.entity.id);
  }

  detach(): void {
    if (StorageComponent.active === this) StorageComponent.active = null;

    this.entity.off("pointed", this._open, this);
    this.entity.scene.game.events.off(Event.STORAGE_CLOSE, this._close, this);
    this.entity.scene.game.events.off(
      Event.STORAGE_CONFIRM,
      this._confirm,
      this,
    );
  }

  private _open(): void {
    if (StorageComponent.active || this.entity.isLocked) return;

    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      player.x,
      player.y,
    );

    if (distance > this.range) return;

    this.entity.scene.game.events.emit(Event.STORAGE_OPEN, {
      entityId: this.entity.id,
      slots: this.slots,
    });
  }

  private _confirm(entityId: string): void {
    if (entityId !== this.entity.id) return;

    StorageComponent.active = this;

    const animKey = `${this.entity.name}_tex_anim`;
    if (this.entity.scene.anims.exists(animKey)) this.entity.play(animKey);
  }

  private _close(entityId: string): void {
    if (entityId !== this.entity.id) return;

    if (StorageComponent.active === this) StorageComponent.active = null;

    const animKey = `${this.entity.name}_tex_anim`;

    if (this.entity.scene.anims.exists(animKey))
      this.entity.playReverse(animKey);
  }
}
