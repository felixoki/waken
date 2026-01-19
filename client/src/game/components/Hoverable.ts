import { ComponentName, PipelineName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { OutlinePipeline } from "../pipelines/Outline";

export class HoverableComponent extends Component {
  private entity: Entity;

  public name = ComponentName.HOVERABLE;

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
  }

  private _hover(): void {
    this.entity.setPostPipeline(PipelineName.OUTLINE);

    const pipelines = this.entity.postPipelines;

    if (pipelines && pipelines.length) {
      const pipeline = pipelines[pipelines.length - 1];
      (pipeline as OutlinePipeline).thickness = 1;
    }
  }

  private _unhover(): void {
    this.entity.resetPostPipeline();
  }
}
