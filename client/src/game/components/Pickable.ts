import { ComponentName, Event, LooseKind } from "@server/types";
import { COLLECT_DELAY, RANGE_COLLECT, RANGE_PICKUP } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class PickableComponent extends Component {
  private entity: Entity;
  private loose?: LooseKind;
  private armed: boolean;
  private readyAt = 0;
  private isPicking = false;

  public name = ComponentName.PICKABLE;

  constructor(entity: Entity, loose?: LooseKind) {
    super();

    this.entity = entity;
    this.loose = loose;
    this.armed = loose === LooseKind.LOOT;
  }

  attach(): void {
    this.entity.on("pointed", this._onPointed, this);
    this.readyAt = this.entity.scene.time.now + COLLECT_DELAY;
  }

  update(): void {
    if (!this.loose || this.isPicking) return;
    if (this.entity.scene.time.now < this.readyAt) return;

    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    const inside = dx * dx + dy * dy <= RANGE_COLLECT * RANGE_COLLECT;

    if (!this.armed) {
      this.armed = !inside;
      return;
    }

    if (!inside || player.isTransitioning) return;

    this.armed = false;
    this.pickup();
  }

  detach(): void {
    this.entity.off("pointed", this._onPointed, this);
  }

  pickup(): void {
    if (this.isPicking) return;

    this.isPicking = true;
    this.entity.scene.game.events.emit(Event.ENTITY_PICKUP, this.entity.id);
  }

  release(): void {
    this.isPicking = false;
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
