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

  private _onPointerDown(): void {
    const playerManager = this.entity.scene.playerManager;
    const player = playerManager.player;
    player?.inputManager?.setTarget(this.entity.id);
  }

  detach(): void {
    this.entity.off("pointerdown", this._onPointerDown, this);
    this.entity.disableInteractive();
  }
}
