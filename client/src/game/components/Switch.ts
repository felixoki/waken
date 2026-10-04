import { ComponentName, Event, SwitchConfig } from "@server/types";
import { RANGE_INTERACTING } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class SwitchComponent extends Component {
  private entity: Entity;
  private config: SwitchConfig;
  private isOpen = false;

  public name = ComponentName.SWITCH;

  constructor(entity: Entity, config: SwitchConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    if (this.config.trigger) this.entity.on("pointed", this._request, this);
  }

  detach(): void {
    if (this.config.trigger) this.entity.off("pointed", this._request, this);
  }

  set(isOpen: boolean, instant = false): void {
    if (isOpen === this.isOpen) return;

    this.isOpen = isOpen;

    const key = `${this.entity.name}_tex_anim`;
    const anim = this.entity.scene.anims.get(key);

    if (anim && instant)
      this.entity.setTexture(`${key}_${isOpen ? anim.frames.length - 1 : 0}`);
    else if (anim && isOpen) this.entity.play(key);
    else if (anim) this.entity.playReverse(key);

    if (!this.config.trigger && this.entity.body)
      this.entity.body.enable = !isOpen;
  }

  private _request(): void {
    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      player.x,
      player.y,
    );

    if (distance > RANGE_INTERACTING) return;

    this.entity.scene.game.events.emit(Event.ENTITY_TOGGLE, this.entity.id);
  }
}
