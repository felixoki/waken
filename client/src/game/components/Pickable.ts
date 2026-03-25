import { ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { Player } from "../Player";
import { InventoryComponent } from "./Inventory";
import { effects } from "../effects";

export class PickableComponent extends Component {
  private entity: Entity;

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

  pickup(player: Player): void {
    const inventory = player.getComponent<InventoryComponent>(
      ComponentName.INVENTORY,
    );

    if (!inventory?.add(this.entity.name)) return;

    this.entity.scene.game.events.emit("entity:pickup", this.entity.id);

    effects.shaders.stretch(this.entity, () => {
      this.entity.scene?.managers.entities.remove(this.entity.id);
    });
  }
}
