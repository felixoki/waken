import {
  ComponentName,
  EntityName,
  Event,
  MilkableConfig,
  SlotType,
} from "@server/types";
import { RANGE_CAPTURE } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { PointableComponent } from "./Pointable";

export class MilkableComponent extends Component {
  private entity: Entity;
  private config: MilkableConfig;
  private isMilkable = false;

  public name = ComponentName.MILKABLE;

  constructor(entity: Entity, config: MilkableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    if (!this.entity.tame?.isTamed) return;

    this.isMilkable = true;

    if (!this.entity.hasComponent(ComponentName.POINTABLE))
      this.entity.addComponent(new PointableComponent(this.entity));

    this.entity.on("pointed", this._onPointed, this);
  }

  update(): void {}

  detach(): void {
    if (this.isMilkable) this.entity.off("pointed", this._onPointed, this);
  }

  private _onPointed(player: Entity): void {
    if (!this.entity.tame?.isTamed || player.isLocked) return;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    if (
      !slot ||
      slot.type !== SlotType.ENTITY ||
      slot.item.name !== EntityName.BUCKET
    )
      return;

    const milkedAt = this.entity.tame.milkedAt;
    if (milkedAt && Date.now() - milkedAt < this.config.cooldown) return;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_CAPTURE) return;

    this.entity.scene.game.events.emit(Event.ENTITY_MILK, {
      id: this.entity.id,
    });
  }
}
