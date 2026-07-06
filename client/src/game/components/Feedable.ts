import { ComponentName, Event, FeedableConfig, SlotType } from "@server/types";
import { RANGE_CAPTURE } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { PointableComponent } from "./Pointable";
import { HoverableComponent } from "./Hoverable";
import EventBus from "../EventBus";

export class FeedableComponent extends Component {
  private entity: Entity;
  private config: FeedableConfig;
  private isFeedable = false;
  private isHovered = false;

  public name = ComponentName.FEEDABLE;

  constructor(entity: Entity, config: FeedableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    if (this.entity.tame?.isTamed) this._enable();
  }

  update(): void {
    if (this.isHovered) this._refresh();
  }

  detach(): void {
    if (this.isFeedable) {
      this.entity.off("pointed", this._onPointed, this);
      this.entity.off("pointerover", this._onHover, this);
      this.entity.off("pointerout", this._onHoverOut, this);
    }

    if (this.isHovered) EventBus.emit(Event.TOOLTIP_TOGGLE, null);
  }

  private _enable(): void {
    if (this.isFeedable) return;

    this.isFeedable = true;

    if (!this.entity.hasComponent(ComponentName.POINTABLE))
      this.entity.addComponent(new PointableComponent(this.entity));

    if (!this.entity.hasComponent(ComponentName.HOVERABLE))
      this.entity.addComponent(new HoverableComponent(this.entity));

    this.entity.on("pointed", this._onPointed, this);
    this.entity.on("pointerover", this._onHover, this);
    this.entity.on("pointerout", this._onHoverOut, this);
  }

  private _onHover(): void {
    this.isHovered = true;
    this._refresh();
  }

  private _refresh(): void {
    const fed =
      !!this.entity.tame?.fedAt &&
      Date.now() - this.entity.tame.fedAt < this.config.duration;

    const cam = this.entity.scene.cameras.main;
    const x = (this.entity.x - cam.worldView.x) * cam.zoom;
    const y = (this.entity.y - cam.worldView.y) * cam.zoom;

    EventBus.emit(Event.TOOLTIP_TOGGLE, {
      text: fed ? "Happy" : "Hungry",
      x,
      y,
    });
  }

  private _onHoverOut(): void {
    this.isHovered = false;
    EventBus.emit(Event.TOOLTIP_TOGGLE, null);
  }

  private _onPointed(player: Entity): void {
    if (!this.entity.tame?.isTamed || player.isLocked) return;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    if (
      !slot ||
      slot.type !== SlotType.ENTITY ||
      !this.config.foods.includes(slot.item.name)
    )
      return;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_CAPTURE) return;

    this.entity.scene.game.events.emit(Event.ENTITY_FEED, {
      id: this.entity.id,
      food: slot.item.name,
    });
  }
}
