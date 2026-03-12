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

    this.entity.play(this.animKey);
    this.entity.setOrigin(0.5, 0.5);
  }

  private _createFrames(): void {
    const scene = this.entity.scene;
    const { tileSize, tiles, spritesheet, frames, direction } = this.config;

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

      tiles.forEach((r, rowIndex) => {
        for (let col = r.start; col <= r.end; col++) {
          const row = direction === "vertical" ? r.row + f * tiles.length : r.row;
          const c = direction === "horizontal" ? col + f * (r.end - r.start + 1) : col;

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

  detach(): void {}
}
