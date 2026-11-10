import { ComponentName, Event, LooseKind } from "@server/types";
import {
  MAGNET_ACCELERATION,
  MAGNET_SPEED,
  RANGE_MAGNET,
  RANGE_PICKUP,
} from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class PickableComponent extends Component {
  private static loose = new Set<PickableComponent>();

  private entity: Entity;
  private kind?: LooseKind;
  private armed: boolean;
  private returning?: Phaser.Tweens.Tween;
  private isPicking = false;
  private speed = 0;
  private originX = 0;
  private originY = 0;
  private originDepth = 0;
  private onArrive?: () => void;

  public isPulling = false;
  public name = ComponentName.PICKABLE;

  static tick(): void {
    for (const pickable of PickableComponent.loose) pickable._tick();
  }

  constructor(entity: Entity, kind?: LooseKind) {
    super();

    this.entity = entity;
    this.kind = kind;
    this.armed = kind === LooseKind.LOOT;
  }

  attach(): void {
    this.entity.on("pointed", this._onPointed, this);
    this.originX = this.entity.x;
    this.originY = this.entity.y;
    if (this.kind) PickableComponent.loose.add(this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._onPointed, this);
    PickableComponent.loose.delete(this);
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

  absorb(done: () => void): boolean {
    if (!this.isPulling) return false;

    this.onArrive = done;
    return true;
  }

  private _tick(): void {
    const scene = this.entity.scene;
    if (!scene) return;

    const player = scene.managers.players.player;
    if (!player) return;

    const dx = player.x - this.entity.x;
    const dy = player.y - this.entity.y;
    const distanceSq = dx * dx + dy * dy;

    if (this.isPulling) {
      if (player.isTransitioning) return;

      if (distanceSq === 0) {
        this._arrive();
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
      if (step === distance) this._arrive();
      return;
    }

    if (this.isPicking) return;

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
    this.pickup();
  }

  private _arrive(): void {
    const done = this.onArrive;
    if (!done) return;

    this.onArrive = undefined;
    PickableComponent.loose.delete(this);
    this.entity.scene.tweens.add({
      targets: this.entity,
      alpha: 0,
      scale: this.entity.scale * 0.5,
      duration: 80,
      ease: "Sine.easeIn",
      onComplete: done,
    });
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
