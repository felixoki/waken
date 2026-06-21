import {
  ComponentName,
  EntityName,
  Event,
  SlotType,
  StateName,
} from "@server/types";
import { RANGE_PLANTING, RANGE_WATERING } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { GrowableComponent } from "./Growable";
import { Raking } from "../state/Raking";
import { handlers } from "../handlers";
import EventBus from "../EventBus";

let selected: EntityName | null = null;
EventBus.on(Event.SEEDS_SELECT, (seed: EntityName | null) => {
  selected = seed;
});

export class FarmableComponent extends Component {
  private entity: Entity;
  private preview: Phaser.GameObjects.Graphics | null = null;
  private hovered = false;
  private outlined: Entity | null = null;

  public name = ComponentName.FARMABLE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    this.entity.setInteractive();
    this.entity.on("pointed", this._onPointed, this);
    this.entity.on("pointerover", this._onHover, this);
    this.entity.on("pointerout", this._onHoverOut, this);
    EventBus.on(Event.HOTBAR_UPDATE, this._onHotbarUpdate, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._onPointed, this);
    this.entity.off("pointerover", this._onHover, this);
    this.entity.off("pointerout", this._onHoverOut, this);
    EventBus.off(Event.HOTBAR_UPDATE, this._onHotbarUpdate, this);

    this._clearOutline();

    this.preview?.destroy();
    this.preview = null;
  }

  private _onHotbarUpdate = () => {
    if (this.hovered) this._refreshHover();
  };

  private _crop(): Entity | undefined {
    return this.entity.scene.managers.entities.all.find(
      (entity) =>
        entity.getComponent<GrowableComponent>(ComponentName.GROWABLE) &&
        Math.abs(entity.x - this.entity.x) < 1 &&
        Math.abs(entity.y - this.entity.y) < 1,
    );
  }

  private _onHover(): void {
    this.hovered = true;
    this._refreshHover();
  }

  private _onHoverOut(): void {
    this.hovered = false;

    this.preview?.setVisible(false);

    const crop = this._crop();
    crop?.getComponent<GrowableComponent>(ComponentName.GROWABLE)?.hideHint();

    this._clearOutline();
  }

  private _outline(crop: Entity): void {
    if (this.outlined === crop) return;

    this._clearOutline();
    crop.emit("pointerover");
    this.outlined = crop;
  }

  private _clearOutline(): void {
    if (!this.outlined) return;

    if (this.outlined.active) this.outlined.emit("pointerout");
    this.outlined = null;
  }

  private _refreshHover(): void {
    const tool = this._equippedTool();
    const crop = this._crop();
    const growable = crop?.getComponent<GrowableComponent>(
      ComponentName.GROWABLE,
    );

    if (crop) this._outline(crop);
    else this._clearOutline();

    if (growable) growable.showHint();

    if (tool === EntityName.HOE && !crop && selected) this._showPreview();
    else this.preview?.setVisible(false);
  }

  private _showPreview(): void {
    if (!this.preview) {
      this.preview = this.entity.scene.add.graphics();
      this.preview.setDepth(2000 + this.entity.y);
    }

    this.preview.clear();
    this.preview.fillStyle(0xffffff, 0.35);
    this.preview.fillRoundedRect(-8, -8, 16, 16, 3);
    this.preview.setPosition(this.entity.x, this.entity.y);
    this.preview.setVisible(true);
  }

  private _equippedTool(): EntityName | null {
    const player = this.entity.scene.managers.players.player;
    if (!player) return null;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    if (!slot || slot.type !== SlotType.ENTITY) return null;

    return slot.item.name;
  }

  private _onPointed(): void {
    const player = this.entity.scene.managers.players.player;
    if (!player || player.isLocked) return;

    const tool = this._equippedTool();
    const crop = this._crop();
    const growable = crop?.getComponent<GrowableComponent>(
      ComponentName.GROWABLE,
    );

    if (growable?.isMature()) {
      growable.harvest();
      return;
    }

    if (tool === EntityName.HOE) {
      if (crop || !selected) return;
      this._plant(player);
      return;
    }

    if (tool === EntityName.WATERING_CAN) {
      if (!crop || !growable?.needsWater()) return;
      this._water(player, crop);
      return;
    }
  }

  private _plant(player: Entity): void {
    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_PLANTING) return;

    this._face(player);

    player.target = {
      x: this.entity.x,
      y: this.entity.y,
      id: this.entity.id,
    };

    const raking = player.states?.get(StateName.RAKING) as Raking | undefined;
    raking?.setSeed(selected);

    this._onHoverOut();

    player.transitionTo(StateName.RAKING);
  }

  private _water(player: Entity, crop: Entity): void {
    const dx = crop.x - player.x;
    const dy = crop.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_WATERING) return;

    player.target = { x: crop.x, y: crop.y, id: crop.id };

    player.transitionTo(StateName.WATERING);
  }

  private _face(player: Entity): void {
    const direction = handlers.direction.getDirectionToPoint(player, {
      x: this.entity.x,
      y: this.entity.y,
    });
    const angle = Math.atan2(direction.y, direction.x);

    player.setFacing(handlers.direction.fromAngle(angle, player.facing));
  }
}
