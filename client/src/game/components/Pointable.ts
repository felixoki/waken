import { ComponentName, StateName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class PointableComponent extends Component {
  public name: ComponentName = ComponentName.POINTABLE;
  private entity: Entity;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    this.entity.setInteractive();
    this.entity.on("pointerdown", this._onPointerDown, this);
  }

  private _onPointerDown(): void {
    const playerManager = this.entity.scene.playerManager;
    const player = playerManager.player;
    player?.inputManager?.setTarget(this.entity.id);

    this.entity.states?.get(StateName.SLASHING)?.enter(this.entity);
  }

  detach(): void {
    this.entity.off("pointerdown", this._onPointerDown, this);
    this.entity.disableInteractive();
  }
}
