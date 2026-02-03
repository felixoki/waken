import {
  AnimationConfig,
  ComponentName,
  Direction,
  StateName,
} from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class AnimationComponent extends Component {
  private entity: Entity;
  private config: Partial<Record<StateName, AnimationConfig>>;

  public name = ComponentName.ANIMATION;

  constructor(
    entity: Entity,
    config: Partial<Record<StateName, AnimationConfig>>,
  ) {
    super();
    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    this._createAnims();
  }

  update(): void {}

  play(state: StateName, direction: Direction): void {
    if (!this.config[state]) return;

    const textureKey = `${this.entity.name}-${state}`;
    let dir = direction;

    const animKey = `${textureKey}-${dir}`;

    if (this.entity.texture.key !== textureKey)
      this.entity.setTexture(textureKey);

    if (this.entity.anims.currentAnim?.key !== animKey)
      this.entity.play(animKey);
  }

  private _createAnims(): void {
    const scene = this.entity.scene;
    const animations = Object.entries(this.config);
    const directions = Object.values(Direction);

    animations.forEach(([state, config]) => {
      const key = `${this.entity.name}-${state}`;

      directions.forEach((direction, dirIndex) => {
        const anim = `${key}-${direction}`;
        const start = dirIndex * config.frameCount;
        const end = start + config.frameCount - 1;

        if (!scene.anims.exists(anim)) {
          scene.anims.create({
            key: anim,
            frames: scene.anims.generateFrameNumbers(key, { start, end }),
            frameRate: config.frameRate,
            repeat: config.repeat,
          });
        }
      });
    });
  }

  detach(): void {}
}
