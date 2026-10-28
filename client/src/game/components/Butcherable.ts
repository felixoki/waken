import { ComponentName, EntityName, Event, SlotType } from "@server/types";
import { RANGE_CAPTURE } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { PointableComponent } from "./Pointable";

export class ButcherableComponent extends Component {
  private entity: Entity;

  public name = ComponentName.BUTCHERABLE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    if (!this.entity.hasComponent(ComponentName.POINTABLE))
      this.entity.addComponent(new PointableComponent(this.entity));

    this.entity.on("pointed", this._onPointed, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._onPointed, this);
  }

  private _onPointed(player: Entity): void {
    if (player.isLocked) return;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    if (
      !slot ||
      slot.type !== SlotType.ENTITY ||
      slot.item.name !== EntityName.BUTCHERS_KNIFE
    )
      return;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_CAPTURE) return;

    this.entity.scene.game.events.emit(Event.ENTITY_BUTCHER, {
      id: this.entity.id,
    });
  }
}
