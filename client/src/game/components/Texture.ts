import { ComponentName, TextureConfig } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class TextureComponent extends Component {
  private entity: Entity;
  private config: TextureConfig;
  private key: string;

  public name: ComponentName = ComponentName.TEXTURE;

  constructor(entity: Entity, config: TextureConfig, key: string) {
    super();

    this.entity = entity;
    this.config = config;
    this.key = key;
  }

  attach(): void {
    this._create();

    this.entity.setTexture(this.key);
    this.entity.setOrigin(0.5, 0.5);
  }

  private _create(): void {
    const scene = this.entity.scene;
    const { tileSize, tiles, spritesheet } = this.config;

    if (scene.textures.exists(this.key)) return;

    const width = tiles.length
      ? Math.max(...tiles.map((t) => t.end - t.start + 1)) * tileSize
      : tileSize;
    const height = tiles.length ? tiles.length * tileSize : tileSize;

    const rt = scene.make.renderTexture({ width, height }, false);

    if (!tiles.length) {
      rt.saveTexture(this.key);
      rt.destroy();
      return;
    }

    const texture = scene.textures.get(spritesheet);
    const columns = Math.floor(texture.source[0].width / tileSize);

    tiles.forEach((r, i) => {
      for (let col = r.start; col <= r.end; col++) {
        const destX = (col - r.start) * tileSize;
        const destY = i * tileSize;
        const frameIndex = (r.row - 1) * columns + (col - 1);

        rt.drawFrame(spritesheet, frameIndex, destX, destY);
      }
    });

    rt.saveTexture(this.key);
    rt.destroy();
  }

  swap(config: TextureConfig, key: string): void {
    this.config = config;
    this.key = key;

    this._create();
    this.entity.setTexture(this.key);
  }

  public canvas(): HTMLCanvasElement {
    const scene = this.entity.scene;
    const { tileSize, tiles, spritesheet } = this.config;

    const width = tiles.length
      ? Math.max(...tiles.map((t) => t.end - t.start + 1)) * tileSize
      : tileSize;
    const height = tiles.length ? tiles.length * tileSize : tileSize;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    if (!tiles.length) return canvas;

    const texture = scene.textures.get(spritesheet);
    const image = texture.getSourceImage() as CanvasImageSource;
    const columns = Math.floor(texture.source[0].width / tileSize);

    tiles.forEach((r, i) => {
      for (let col = r.start; col <= r.end; col++) {
        const destX = (col - r.start) * tileSize;
        const destY = i * tileSize;
        const frameIndex = (r.row - 1) * columns + (col - 1);
        const srcCol = frameIndex % columns;
        const srcRow = Math.floor(frameIndex / columns);

        ctx.drawImage(
          image,
          srcCol * tileSize,
          srcRow * tileSize,
          tileSize,
          tileSize,
          destX,
          destY,
          tileSize,
          tileSize,
        );
      }
    });

    return canvas;
  }

  update(): void {}

  detach(): void {}
}
