import { ComponentName, Direction, StateName } from "@server/types";
import { AnimationConfig } from "@server/configs";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class AnimationComponent extends Component {
  public name = ComponentName.ANIMATION;
  private entity: Entity;
  private config: Record<StateName, AnimationConfig>;
  private useMirroring: boolean;

  constructor(
    entity: Entity,
    config: Record<StateName, AnimationConfig>,
    useMirroring: boolean = false
  ) {
    super();
    this.entity = entity;
    this.config = config;
    this.useMirroring = useMirroring;
  }

  attach(): void {
    this._createAnims();
  }

  update(): void {}

  play(state: StateName, direction: Direction): void {
    const textureKey = `${this.entity.name}-${state}`;
    let dir = direction;

    if (this.useMirroring) {
      const dirs = this.entity.directions;
      
      const hasVertical =
        dirs.includes(Direction.UP) || dirs.includes(Direction.DOWN);
      const hasHorizontal =
        dirs.includes(Direction.LEFT) || dirs.includes(Direction.RIGHT);

      if (hasHorizontal) {
        this.entity.setFlipX(dirs.includes(Direction.LEFT));
        if (!hasVertical) dir = Direction.DOWN;
      }
    }

    const animKey = `${textureKey}-${dir}`;

    if (this.entity.texture.key !== textureKey)
      this.entity.setTexture(textureKey);

    this.entity.play(animKey);
  }

  private _createAnims(): void {
    const scene = this.entity.scene;
    const animations = Object.entries(this.config);
    const directions = this.useMirroring
      ? [Direction.DOWN, Direction.UP]
      : Object.values(Direction);

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
