import { ComponentName, PipelineName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class WindswayComponent extends Component {
  private entity: Entity;

  public name = ComponentName.WINDSWAY;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    this.entity.setPipeline(PipelineName.WIND);
  }

  update(): void {}

  detach(): void {
    this.entity.resetPipeline();
  }
}
