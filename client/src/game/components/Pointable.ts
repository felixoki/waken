import { ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class PointableComponent extends Component {
  private entity: Entity;

  public name: ComponentName = ComponentName.POINTABLE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    this.entity.setInteractive();
    this.entity.on("pointerdown", this._onPointerDown, this);
  }

  private _onPointerDown(
    _pointer: Phaser.Input.Pointer,
    _localX: number,
    _localY: number,
    event: Phaser.Types.Input.EventData,
  ): void {
    const player = this.entity.scene.managers.players.player;
    this.entity.emit("pointed", player);

    event.stopPropagation();
  }

  detach(): void {
    this.entity.off("pointerdown", this._onPointerDown, this);
    this.entity.disableInteractive();
  }
}
