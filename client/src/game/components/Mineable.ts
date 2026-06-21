import {
  ComponentName,
  EntityName,
  Event,
  SlotType,
  StateName,
} from "@server/types";
import { RANGE_MINING } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { handlers } from "../handlers";
import EventBus from "../EventBus";

export class MineableComponent extends Component {
  private entity: Entity;

  public name = ComponentName.MINEABLE;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this._mine, this);
    EventBus.on(Event.HOTBAR_UPDATE, this._onHotbarUpdate, this);

    this._sync();
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._mine, this);
    EventBus.off(Event.HOTBAR_UPDATE, this._onHotbarUpdate, this);
  }

  private _onHotbarUpdate = () => {
    this._sync();
  };

  private _sync(): void {
    if (this._isToolEquipped()) {
      this.entity.setInteractive();
      return;
    }

    this.entity.disableInteractive();
  }

  private _isToolEquipped(): boolean {
    const player = this.entity.scene.managers.players.player;
    if (!player) return false;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    return (
      !!slot &&
      slot.type === SlotType.ENTITY &&
      slot.item.name === EntityName.PICKAXE
    );
  }

  private _mine(): void {
    const player = this.entity.scene.managers.players.player;
    if (!player || player.isLocked || !this._isToolEquipped()) return;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    if (Math.hypot(dx, dy) > RANGE_MINING) return;

    const direction = handlers.direction.getDirectionToPoint(player, {
      x: this.entity.x,
      y: this.entity.y,
    });
    const angle = Math.atan2(direction.y, direction.x);

    player.setFacing(handlers.direction.fromAngle(angle, player.facing));

    player.target = {
      x: this.entity.x,
      y: this.entity.y,
      id: this.entity.id,
    };

    player.transitionTo(StateName.MINING);
  }
}
