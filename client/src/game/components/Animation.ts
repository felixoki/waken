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
import { SPEED_DEFAULT } from "@server/globals";
import { handlers } from "../handlers";

export class AnimationComponent extends Component {
  private entity: Entity;
  private config: Partial<Record<StateName, AnimationConfig>>;
  private variant: string | null = null;
  private skin: string | null = null;
  private robe: string | null = null;
  private wanted: string | null = null;
  private speed: number;

  public name = ComponentName.ANIMATION;

  constructor(
    entity: Entity,
    config: Partial<Record<StateName, AnimationConfig>>,
  ) {
    super();
    this.entity = entity;
    this.config = config;
    this.speed = configs.entities[entity.name]?.speed ?? SPEED_DEFAULT;
  }

  attach(): void {
    this._createAnims();
  }

  update(): void {}

  get base(): string {
    if (this.skin) return this.skin;

    return this.robe
      ? handlers.robe.base(this.entity.name, this.robe)
      : this.entity.name;
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

  setRobe(robe: string | null): void {
    if (robe === this.wanted) return;

    this.wanted = robe;

    if (!robe) return this._wear(null);

    handlers.robe.load(this.entity.scene, robe, () => {
      if (this.wanted === robe && this.entity.active) this._wear(robe);
    });
  }

  private _wear(robe: string | null): void {
    this.robe = robe;
    this._createAnims();
    if (this.variant) this._createVariantAnims(this.variant);
    this.play(this.entity.state, this.entity.facing);
  }

  setSkin(skin: string | null): void {
    this.skin = skin;
    this._createAnims();
    this.play(this.entity.state, this.entity.facing);
  }

  play(state: StateName, direction: Direction): void {
    if (!this.activeConfig[state]) return;

    const base = this._base(state);
    const variantKey = this.variant ? `${base}-${state}-${this.variant}` : null;
    const defaultKey = `${base}-${state}`;
    const useVariant =
      variantKey !== null && this.entity.scene.textures.exists(variantKey);

    const textureKey = useVariant ? variantKey! : defaultKey;
    const animKey = `${textureKey}-${direction}`;

    if (this.entity.texture.key !== textureKey)
      this.entity.setTexture(textureKey);

    this.entity.anims.timeScale =
      state === StateName.WALKING || state === StateName.RUNNING
        ? this.speed
        : 1;

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

    this.entity.anims.timeScale = 1;

    if (this.entity.anims.currentAnim?.key !== animKey)
      this.entity.play(animKey);
  }

  private _base(state: StateName): string {
    if (this.skin || !this.robe) return this.base;

    return this.entity.scene.textures.exists(`${this.base}-${state}`)
      ? this.base
      : this.entity.name;
  }

  private _createVariantAnims(variant: string): void {
    const scene = this.entity.scene;
    const directions = Object.values(Direction);

    Object.entries(this.config).forEach(([state, config]) => {
      const key = `${this.base}-${state}-${variant}`;

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

      if (this.robe && !scene.textures.exists(key)) return;

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
