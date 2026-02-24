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

    const width = Math.max(...tiles.map((t) => t.end - t.start + 1)) * tileSize;
    const height = tiles.length * tileSize;

    const rt = scene.make.renderTexture({ width, height }, false);

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

  update(): void {}

  detach(): void {}
}
