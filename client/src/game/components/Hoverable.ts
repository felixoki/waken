import { ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

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
  detach(): void {}

  private _hover(): void {
    const offset = 2;
    const color = 0xffffff;
    const decay = 0.02;
    const power = 1;

    this.entity.preFX?.addShadow(0, -offset, decay, power, color);
    this.entity.preFX?.addShadow(0, offset, decay, power, color);
    this.entity.preFX?.addShadow(-offset, 0, decay, power, color);
    this.entity.preFX?.addShadow(offset, 0, decay, power, color);
  }

  private _unhover(): void {
    this.entity.preFX?.clear();
  }
}
