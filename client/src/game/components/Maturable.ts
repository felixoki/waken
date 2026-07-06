import { ComponentName, Event, MaturableConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class MaturableComponent extends Component {
  private entity: Entity;
  private config: MaturableConfig;
  private matured = false;

  public name = ComponentName.MATURABLE;

  constructor(entity: Entity, config: MaturableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {}

  update(): void {
    if (this.matured) return;

    const player = this.entity.scene.managers.players.player;
    if (!player?.isAuthority) return;

    const createdAt = this.entity.createdAt ?? Date.now();
    if (Date.now() - createdAt < this.config.duration) return;

    this.matured = true;

    this.entity.scene.game.events.emit(Event.ENTITY_MATURE, {
      id: this.entity.id,
    });
  }

  detach(): void {}
}
