import { ComponentName, Event, StorageConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { RANGE_INTERACTING } from "@server/globals";

export class StorageComponent extends Component {
  private static openId: string | null = null;

  private entity: Entity;
  private slots: number;
  private range = RANGE_INTERACTING;

  public name = ComponentName.STORAGE;

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

  detach(): void {
    if (StorageComponent.openId === this.entity.id)
      StorageComponent.openId = null;

    this.entity.off("pointed", this._open, this);
    this.entity.scene.game.events.off(Event.STORAGE_CLOSE, this._close, this);
    this.entity.scene.game.events.off(
      Event.STORAGE_CONFIRM,
      this._confirm,
      this,
    );
  }

  private _open(): void {
    if (StorageComponent.openId || this.entity.isLocked) return;

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

    StorageComponent.openId = entityId;

    const animKey = `${this.entity.name}_tex_anim`;
    if (this.entity.scene.anims.exists(animKey)) this.entity.play(animKey);
  }

  private _close(entityId: string): void {
    if (entityId !== this.entity.id) return;

    if (StorageComponent.openId === entityId) StorageComponent.openId = null;

    const animKey = `${this.entity.name}_tex_anim`;

    if (this.entity.scene.anims.exists(animKey))
      this.entity.playReverse(animKey);
  }
}
