import { ComponentName, Event, LooseKind } from "@server/types";
import {
  MAGNET_ACCELERATION,
  MAGNET_SPEED,
  RANGE_COLLECT,
  RANGE_MAGNET,
  RANGE_PICKUP,
} from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class PickableComponent extends Component {
  private entity: Entity;
  private loose?: LooseKind;
  private armed: boolean;
  private returning?: Phaser.Tweens.Tween;
  private isPicking = false;
  private isPulling = false;
  private speed = 0;
  private originX = 0;
  private originY = 0;
  private originDepth = 0;

  public name = ComponentName.PICKABLE;

  constructor(entity: Entity, loose?: LooseKind) {
    super();

    this.entity = entity;
    this.loose = loose;
    this.armed = loose === LooseKind.LOOT;
  }

  attach(): void {
    this.entity.on("pointed", this._onPointed, this);
    this.originX = this.entity.x;
    this.originY = this.entity.y;
  }

  update(): void {
    if (!this.loose || this.isPicking) return;

    const scene = this.entity.scene;
    const player = scene.managers.players.player;
    if (!player) return;

    const dx = player.x - this.entity.x;
    const dy = player.y - this.entity.y;
    const distanceSq = dx * dx + dy * dy;

    if (this.isPulling) {
      if (player.isTransitioning || distanceSq > 4 * RANGE_MAGNET * RANGE_MAGNET) {
        this._return();
        return;
      }

      if (distanceSq <= RANGE_COLLECT * RANGE_COLLECT) {
        this.pickup();
        return;
      }

      const delta = scene.game.loop.delta / 1000;
      const distance = Math.sqrt(distanceSq);
      this.speed += MAGNET_ACCELERATION * delta;
      const step = Math.min(this.speed * delta, distance);

      this.entity.setPosition(
        this.entity.x + (dx / distance) * step,
        this.entity.y + (dy / distance) * step,
      );
      this.entity.setDepth(player.depth + 1);
      return;
    }

    const inside = distanceSq <= RANGE_MAGNET * RANGE_MAGNET;

    if (!this.armed) {
      this.armed = !inside;
      return;
    }

    if (!inside || player.isTransitioning) return;

    this.armed = false;
    this.isPulling = true;
    this.speed = MAGNET_SPEED;
    this.originDepth = this.entity.depth;
    this.returning?.stop();
  }

  detach(): void {
    this.entity.off("pointed", this._onPointed, this);
  }

  pickup(): void {
    if (this.isPicking) return;

    this.isPicking = true;
    this.entity.scene.game.events.emit(Event.ENTITY_PICKUP, this.entity.id);
  }

  release(remaining = false): void {
    this.isPicking = false;
    if (remaining && this.isPulling) this._return();
  }

  private _return(): void {
    this.isPulling = false;
    this.armed = false;
    this.entity.setDepth(this.originDepth);
    this.returning = this.entity.scene.tweens.add({
      targets: this.entity,
      x: this.originX,
      y: this.originY,
      duration: 200,
      ease: "Sine.easeOut",
    });
  }

  private _onPointed(): void {
    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_PICKUP) return;

    this.pickup();
  }
}
