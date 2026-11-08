import { ComponentName, Event } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class PickableComponent extends Component {
  private entity: Entity;
  private isPicking = false;

  public name = ComponentName.PICKABLE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this.pickup, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this.pickup, this);
  }

  pickup(): void {
    if (this.isPicking) return;

    this.isPicking = true;
    this.entity.scene.game.events.emit(Event.ENTITY_PICKUP, this.entity.id);
  }

  release(): void {
    this.isPicking = false;
  }
}
