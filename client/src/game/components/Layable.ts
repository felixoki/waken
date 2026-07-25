import { ComponentName, Event, LayableConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class LayableComponent extends Component {
  private entity: Entity;
  private config: LayableConfig;
  private lastEmit = 0;

  public name = ComponentName.LAYABLE;

  constructor(entity: Entity, config: LayableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {}

  update(): void {
    const player = this.entity.scene.managers.players.player;
    
    if (!player?.isAuthority) return;
    if (!this.entity.tame?.isTamed) return;

    const now = Date.now();
    const last = this.entity.tame.bredAt ?? this.entity.createdAt ?? now;

    if (now - last < this.config.cooldown) return;
    if (now - this.lastEmit < 3000) return;

    this.lastEmit = now;

    this.entity.scene.game.events.emit(Event.ENTITY_LAY, {
      id: this.entity.id,
    });
  }

  detach(): void {}
}
