import { ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { TextureComponent } from "../components/Texture";

export interface SpriteChunk {
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: number;
  alpha: number;
}

export const sprites = {
  pixels: (
    entity: Entity,
    block: number = 1,
    frame: Phaser.Textures.Frame = entity.frame,
  ): SpriteChunk[] => {
    const {
      scaleX: sx,
      scaleY: sy,
      x: worldX,
      y: worldY,
      originX,
      originY,
    } = entity;

    const source = frame.source.image as CanvasImageSource;
    const drawable =
      typeof HTMLImageElement !== "undefined" &&
      (source instanceof HTMLImageElement ||
        source instanceof HTMLCanvasElement);

    let canvas: HTMLCanvasElement;

    if (drawable) {
      canvas = document.createElement("canvas");
      canvas.width = frame.cutWidth;
      canvas.height = frame.cutHeight;

      canvas
        .getContext("2d")!
        .drawImage(
          source,
          frame.cutX,
          frame.cutY,
          frame.cutWidth,
          frame.cutHeight,
          0,
          0,
          frame.cutWidth,
          frame.cutHeight,
        );
    } else {
      const texture = entity.getComponent<TextureComponent>(
        ComponentName.TEXTURE,
      );

      if (!texture) return [];
      canvas = texture.canvas();
    }

    const width = canvas.width;
    const height = canvas.height;
    const { data } = canvas.getContext("2d")!.getImageData(0, 0, width, height);
    const chunks: SpriteChunk[] = [];

    for (let by = 0; by < height; by += block)
      for (let bx = 0; bx < width; bx += block) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let count = 0;

        const maxY = Math.min(by + block, height);
        const maxX = Math.min(bx + block, width);

        for (let py = by; py < maxY; py++)
          for (let px = bx; px < maxX; px++) {
            const i = (py * width + px) * 4;
            if (data[i + 3] === 0) continue;

            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            a += data[i + 3];

            count++;
          }

        if (count === 0) continue;

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        const tx = bx + block / 2;
        const ty = by + block / 2;

        chunks.push({
          x: worldX + (tx - width * originX) * sx,
          y: worldY + (ty - height * originY) * sy,
          tx,
          ty,
          color: (r << 16) | (g << 8) | b,
          alpha: a / count / 255,
        });
      }

    return chunks;
  },
};
