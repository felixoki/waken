import {
  ComponentName,
  EntityName,
  Event,
  SlotType,
  TamableConfig,
} from "@server/types";
import { RANGE_CAPTURE } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { PointableComponent } from "./Pointable";
import { HoverableComponent } from "./Hoverable";

const ORBIT_COLORS = [0xfff275, 0xffd166, 0xf4a259];
const ORBIT_RADIUS = 10;
const ORBIT_COUNT = 3;

export class TamableComponent extends Component {
  private entity: Entity;
  private config: TamableConfig;
  private isCapturable = false;
  private circles: Phaser.GameObjects.Image[] = [];

  public name = ComponentName.TAMABLE;

  constructor(entity: Entity, config: TamableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    if (this.entity.tame?.isPacified) {
      this._showConfusion();
      this._enableCapture();
    }
  }

  update(): void {
    if (!this.circles.length) return;

    const t = this.entity.scene.time.now / 350;
    const cx = this.entity.x;
    const cy = this.entity.y - this.entity.displayHeight * 0.5 - 2;

    for (let i = 0; i < this.circles.length; i++) {
      const angle = t + (i / this.circles.length) * Math.PI * 2;
      const circle = this.circles[i];

      circle.x = cx + Math.cos(angle) * ORBIT_RADIUS;
      circle.y = cy + Math.sin(angle) * ORBIT_RADIUS * 0.5;
      circle.setDepth(this.entity.depth + 1);
    }
  }

  detach(): void {
    if (this.isCapturable) this.entity.off("pointed", this._onPointed, this);
    this.circles.forEach((circle) => circle.destroy());
    this.circles = [];
  }

  public get captures() {
    return this.config.entity;
  }

  public pacify(): void {
    this.entity.tame.isPacified = true;
    this._showConfusion();
    this._enableCapture();
  }

  private _showConfusion(): void {
    if (this.circles.length) return;

    for (let i = 0; i < ORBIT_COUNT; i++) {
      const circle = this.entity.scene.add.image(
        this.entity.x,
        this.entity.y,
        "particle_circle",
      );

      circle.setTint(ORBIT_COLORS[i % ORBIT_COLORS.length]);
      circle.setScale(0.35);
      circle.setDepth(this.entity.depth + 1);
      this.circles.push(circle);
    }
  }

  private _enableCapture(): void {
    if (this.isCapturable) return;

    this.isCapturable = true;

    if (!this.entity.hasComponent(ComponentName.POINTABLE))
      this.entity.addComponent(new PointableComponent(this.entity));

    if (!this.entity.hasComponent(ComponentName.HOVERABLE))
      this.entity.addComponent(new HoverableComponent(this.entity));

    this.entity.on("pointed", this._onPointed, this);
  }

  private _onPointed(player: Entity): void {
    if (!this.entity.tame?.isPacified || player.isLocked) return;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    if (
      !slot ||
      slot.type !== SlotType.ENTITY ||
      slot.item.name !== EntityName.SOULSTONE ||
      slot.item.soul
    )
      return;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_CAPTURE) return;

    this.entity.scene.game.events.emit(Event.ENTITY_CAPTURE, {
      id: this.entity.id,
    });
  }
}
