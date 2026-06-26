import {
  AnimationConfig,
  ComponentName,
  Direction,
  EntityName,
  StateName,
} from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { configs } from "@server/configs";

export class AnimationComponent extends Component {
  private entity: Entity;
  private config: Partial<Record<StateName, AnimationConfig>>;
  private variant: string | null = null;
  private skin: string | null = null;

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

  private get base(): string {
    return this.skin ?? this.entity.name;
  }

  private get activeConfig(): Partial<Record<StateName, AnimationConfig>> {
    return this.skin
      ? (configs.animations[this.skin as EntityName] ?? this.config)
      : this.config;
  }

  setVariant(variant: string | null): void {
    this.variant = variant;
    if (variant) this._createVariantAnims(variant);
  }

  setSkin(skin: string | null): void {
    this.skin = skin;
    this._createAnims();
    this.play(this.entity.state, this.entity.facing);
  }

  play(state: StateName, direction: Direction): void {
    if (!this.activeConfig[state]) return;

    const variantKey = this.variant
      ? `${this.base}-${state}-${this.variant}`
      : null;
    const defaultKey = `${this.base}-${state}`;
    const useVariant =
      variantKey !== null && this.entity.scene.textures.exists(variantKey);

    const textureKey = useVariant ? variantKey! : defaultKey;
    const animKey = `${textureKey}-${direction}`;

    if (this.entity.texture.key !== textureKey)
      this.entity.setTexture(textureKey);

    if (this.entity.anims.currentAnim?.key !== animKey)
      this.entity.play(animKey);
  }

  playKey(key: string, direction: Direction, config: AnimationConfig): void {
    const scene = this.entity.scene;
    const textureKey = `${this.base}-${key}`;

    if (!scene.textures.exists(textureKey)) return;

    Object.values(Direction).forEach((dir, dirIndex) => {
      const anim = `${textureKey}-${dir}`;
      const start = dirIndex * config.frameCount;
      const end = start + config.frameCount - 1;

      if (!scene.anims.exists(anim)) {
        scene.anims.create({
          key: anim,
          frames: scene.anims.generateFrameNumbers(textureKey, { start, end }),
          frameRate: config.frameRate,
          repeat: config.repeat,
        });
      }
    });

    const animKey = `${textureKey}-${direction}`;

    if (this.entity.texture.key !== textureKey)
      this.entity.setTexture(textureKey);

    if (this.entity.anims.currentAnim?.key !== animKey)
      this.entity.play(animKey);
  }

  private _createVariantAnims(variant: string): void {
    const scene = this.entity.scene;
    const directions = Object.values(Direction);

    Object.entries(this.config).forEach(([state, config]) => {
      const key = `${this.entity.name}-${state}-${variant}`;

      if (!scene.textures.exists(key)) return;

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

  private _createAnims(): void {
    const scene = this.entity.scene;
    const animations = Object.entries(this.activeConfig);
    const directions = Object.values(Direction);

    animations.forEach(([state, config]) => {
      const key = `${this.base}-${state}`;

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
