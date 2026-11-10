import { ComponentName, PipelineName } from "@server/types";
import { RANGE_PICKUP } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { OutlinePipeline } from "../pipelines/Outline";

export class HoverableComponent extends Component {
  private static hovered?: HoverableComponent;

  private entity: Entity;
  private outlined = false;

  public name = ComponentName.HOVERABLE;

  static tick(): void {
    HoverableComponent.hovered?._sync();
  }

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointerover", this._hover, this);
    this.entity.on("pointerout", this._unhover, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointerover", this._hover, this);
    this.entity.off("pointerout", this._unhover, this);
    if (HoverableComponent.hovered === this) HoverableComponent.hovered = undefined;
  }

  private _hover(): void {
    HoverableComponent.hovered = this;
    this._sync();
  }

  private _unhover(): void {
    if (HoverableComponent.hovered === this) HoverableComponent.hovered = undefined;
    this._outline(false);
  }

  private _sync(): void {
    this._outline(this._inReach());
  }

  private _inReach(): boolean {
    if (!this.entity.hasComponent(ComponentName.PICKABLE)) return true;

    const player = this.entity.scene.managers.players.player;
    if (!player) return false;

    const dx = this.entity.x - player.x;
    const dy = this.entity.y - player.y;
    return dx * dx + dy * dy <= RANGE_PICKUP * RANGE_PICKUP;
  }

  private _outline(on: boolean): void {
    if (on === this.outlined) return;
    this.outlined = on;

    if (!on) {
      this.entity.resetPostPipeline();
      return;
    }

    this.entity.setPostPipeline(PipelineName.OUTLINE);

    const pipelines = this.entity.postPipelines;

    if (pipelines && pipelines.length) {
      const pipeline = pipelines[pipelines.length - 1];
      (pipeline as OutlinePipeline).thickness = 2;
    }
  }
}
