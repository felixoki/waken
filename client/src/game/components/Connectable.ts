import { ComponentName, ConnectableConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { handlers } from "../handlers";
import type { TextureComponent } from "./Texture";

export class ConnectableComponent extends Component {
  private entity: Entity;
  private mask = -1;

  public config: ConnectableConfig;
  public name = ComponentName.CONNECTABLE;

  constructor(entity: Entity, config: ConnectableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  set(mask: number): void {
    if (this.mask === mask) return;
    this.mask = mask;

    this.entity
      .getComponent<TextureComponent>(ComponentName.TEXTURE)
      ?.swap(
        handlers.connect.texture(this.config, mask),
        handlers.connect.key(this.entity.name, mask),
      );
  }
}
