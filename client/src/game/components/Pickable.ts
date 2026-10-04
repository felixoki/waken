import { ComponentName, Event, PickableConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { Player } from "../Player";
import { InventoryComponent } from "./Inventory";
import { vfx } from "../vfx";

export class PickableComponent extends Component {
  private entity: Entity;
  private config?: PickableConfig;
  private isPicking = false;

  public name = ComponentName.PICKABLE;

  constructor(entity: Entity, config?: PickableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    this.entity.on("pointed", this.pickup, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this.pickup, this);
  }

  pickup(player: Player): void {
    if (this.isPicking) return;

    const inventory = player.getComponent<InventoryComponent>(
      ComponentName.INVENTORY,
    );

    const item = this.config?.item ?? this.entity.name;
    const quantity = this.config?.quantity ?? 1;

    if (!inventory?.add(item, quantity)) return;

    this.isPicking = true;

    this.entity.scene.game.events.emit(Event.ENTITY_PICKUP, this.entity.id);

    vfx.shaders.stretch(this.entity, () => {
      this.entity.scene?.managers.entities.remove(this.entity.id);
    });
  }
}
