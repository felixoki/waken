import { ComponentName, TextureAnimationConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class TextureAnimationComponent extends Component {
  private entity: Entity;
  private config: TextureAnimationConfig;
  private animKey: string;

  public name = ComponentName.TEXTURE_ANIMATION;

  constructor(entity: Entity, config: TextureAnimationConfig) {
    super();

    this.entity = entity;
    this.config = config;
    this.animKey = `${entity.name}_tex_anim`;
  }

  attach(): void {
    this._createFrames();
    this._createAnim();

    this.entity.setOrigin(0.5, 0.5);

    if (this.config.offset) {
      this.entity.setX(this.entity.x + this.config.offset.x);
      this.entity.setY(this.entity.y + this.config.offset.y);
    }
    

    if (!this.config.autoplay) {
      this.entity.setTexture(`${this.animKey}_0`);
      return;
    }

    this.entity.play(this.animKey);
  }

  setPlaying(playing: boolean): void {
    if (playing) {
      if (!this.entity.anims.isPlaying) this.entity.play(this.animKey);
      return;
    }

    this.entity.stop();
    this.entity.setTexture(`${this.animKey}_0`);
  }

  private _createFrames(): void {
    const scene = this.entity.scene;
    const { tileSize, tiles, spritesheet, frames, direction } = this.config;
    const stride = this.config.stride ?? tiles.length;
    const wrap = this.config.wrap ?? frames;

    const texture = scene.textures.get(spritesheet);
    const columns = Math.floor(texture.source[0].width / tileSize);

    const frameWidth =
      Math.max(...tiles.map((t) => t.end - t.start + 1)) * tileSize;
    const frameHeight = tiles.length * tileSize;

    for (let f = 0; f < frames; f++) {
      const key = `${this.animKey}_${f}`;
      if (scene.textures.exists(key)) continue;

      const rt = scene.make.renderTexture(
        { width: frameWidth, height: frameHeight },
        false,
      );

      const step = f % wrap;
      const lane = Math.floor(f / wrap);

      tiles.forEach((r, rowIndex) => {
        const width = r.end - r.start + 1;

        for (let col = r.start; col <= r.end; col++) {
          const row =
            direction === "vertical"
              ? r.row + step * stride
              : r.row + lane * stride;
          const c =
            direction === "horizontal"
              ? col + step * width
              : col + lane * width;

          const frameIndex = (row - 1) * columns + (c - 1);
          const destX = (col - r.start) * tileSize;
          const destY = rowIndex * tileSize;

          rt.drawFrame(spritesheet, frameIndex, destX, destY);
        }
      });

      rt.saveTexture(key);
      rt.destroy();
    }
  }

  private _createAnim(): void {
    const scene = this.entity.scene;

    if (scene.anims.exists(this.animKey)) return;

    const texFrames = Array.from({ length: this.config.frames }, (_, i) => ({
      key: `${this.animKey}_${i}`,
      frame: 0,
    }));

    scene.anims.create({
      key: this.animKey,
      frames: texFrames,
      frameRate: this.config.frameRate,
      repeat: this.config.repeat,
    });
  }

  update(): void {}

  detach(): void {
    if (this.config.offset) {
      this.entity.setX(this.entity.x - this.config.offset.x);
      this.entity.setY(this.entity.y - this.config.offset.y);
    }
  }
}
