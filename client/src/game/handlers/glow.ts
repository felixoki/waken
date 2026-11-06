import {
  GLOW_BLUR,
  GLOW_CURVE,
  GLOW_EMIT,
  GLOW_FACE,
  GLOW_GAP,
  GLOW_HOT,
  GLOW_LIGHT,
  GLOW_ROCK,
  GLOW_STRENGTH,
  GLOW_TINT,
} from "@server/globals";
import { PipelineName } from "@server/types";
import type { Scene } from "../scenes/Scene";

type Sheet = { data: Uint8ClampedArray; width: number };

export const glow = {
  apply: (
    scene: Scene,
    pits: Phaser.Tilemaps.TilemapLayer,
    lit: Phaser.Tilemaps.TilemapLayer[],
  ): void => {
    const { tileWidth: tw, tileHeight: th } = pits.tilemap;
    const cols = pits.layer.width;
    const rows = pits.layer.height;
    const region = new Uint8Array(cols * rows);
    let x0 = cols, y0 = rows, x1 = -1, y1 = -1;

    pits.forEachTile((tile) => {
      if (tile.index <= 0) return;
      region[tile.y * cols + tile.x] = 1;
      x0 = Math.min(x0, tile.x);
      x1 = Math.max(x1, tile.x);
      y0 = Math.min(y0, tile.y - 1);
      y1 = Math.max(y1, tile.y);
    });
    if (x1 < 0) return;
    y0 = Math.max(0, y0);

    const pad = GLOW_BLUR * 2;
    const ox = Math.max(0, x0 * tw - pad);
    const oy = Math.max(0, y0 * th - pad);
    const width = Math.min(cols * tw, (x1 + 1) * tw + pad) - ox;
    const height = Math.min(rows * th, (y1 + 1) * th + pad) - oy;

    const sheets = new Map<string, Sheet>();
    const sheet = (tileset: Phaser.Tilemaps.Tileset): Sheet | null => {
      const name = tileset.image?.key;
      if (!name) return null;
      const cached = sheets.get(name);
      if (cached) return cached;
      const source = scene.textures.get(name).getSourceImage() as HTMLImageElement;
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.canvas.width = source.width;
      ctx.canvas.height = source.height;
      ctx.drawImage(source, 0, 0);
      const made = { data: ctx.getImageData(0, 0, source.width, source.height).data, width: source.width };
      sheets.set(name, made);
      return made;
    };

    const rgb = new Float32Array(3);
    const solid = (px: number, py: number): boolean => {
      for (const layer of lit) {
        const tile = layer.getTileAt(Math.floor(px / tw), Math.floor(py / th));
        if (!tile || tile.index <= 0 || !tile.tileset) continue;
        const src = sheet(tile.tileset);
        const at = tile.tileset.getTileTextureCoordinates(tile.index) as { x: number; y: number } | null;
        if (!src || !at) continue;
        const i = ((at.y + (py % th)) * src.width + at.x + (px % tw)) * 4;
        if (src.data[i + 3] < 128) continue;
        rgb[0] = src.data[i];
        rgb[1] = src.data[i + 1];
        rgb[2] = src.data[i + 2];
        return true;
      }
      return false;
    };

    const inside = (px: number, py: number): boolean =>
      region[Math.floor(py / th) * cols + Math.floor(px / tw)] === 1;
    const open = (px: number, py: number): boolean => inside(px, py) && !solid(px, py);

    const light = glow.field(width, height, ox, oy, open);
    glow.blur(light, width, height, GLOW_BLUR);

    const key = `${scene.scene.key}:glow`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvas = scene.textures.createCanvas(key, width, height);
    if (!canvas) return;
    const image = canvas.context.createImageData(width, height);
    const out = image.data;
    const hot = [(GLOW_HOT >> 16) & 0xff, (GLOW_HOT >> 8) & 0xff, GLOW_HOT & 0xff];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const l = light[y * width + x];
        if (l < 0.004) continue;
        const px = ox + x;
        const py = oy + y;
        const rock = solid(px, py);
        if (!rock && !inside(px, py)) continue;

        const k = GLOW_LIGHT * l * GLOW_STRENGTH;
        const e = rock ? 0 : GLOW_EMIT * l * l * GLOW_STRENGTH;
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          const base = rock ? rgb[c] : GLOW_ROCK[c];
          out[i + c] = Math.min(255, base * GLOW_TINT[c] * k + hot[c] * e);
        }
        out[i + 3] = 255;
      }
    }

    canvas.context.putImageData(image, 0, 0);
    canvas.refresh();

    scene.add
      .image(ox, oy, key)
      .setOrigin(0, 0)
      .setDepth((lit[0]?.depth ?? pits.depth) + 5)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setPipeline(PipelineName.GLOW);
  },

  field: (
    width: number,
    height: number,
    ox: number,
    oy: number,
    open: (px: number, py: number) => boolean,
  ): Float32Array => {
    const light = new Float32Array(width * height);
    const runs: number[] = [];

    for (let x = 0; x < width; x++) {
      runs.length = 0;
      let y = 0;
      while (y < height) {
        if (!open(ox + x, oy + y)) {
          y++;
          continue;
        }
        const start = y;
        while (y < height && open(ox + x, oy + y)) y++;
        const n = runs.length;
        if (n && start - runs[n - 1] <= GLOW_GAP) {
          runs[n - 2] = start;
          runs[n - 1] = y;
        } else runs.push(start, start, y);
      }

      for (let i = 0; i < runs.length; i += 3) {
        const bottom = runs[i + 2];
        const top = Math.max(0, Math.min(runs[i + 1] - GLOW_FACE, runs[i]));
        const span = Math.max(1, bottom - 1 - top);
        for (let yy = top; yy < bottom; yy++) {
          const v = Math.pow((yy - top) / span, GLOW_CURVE);
          const j = yy * width + x;
          if (v > light[j]) light[j] = v;
        }
      }
    }

    return light;
  },

  blur: (data: Float32Array, width: number, height: number, radius: number): void => {
    if (radius < 1) return;
    const line = new Float32Array(Math.max(width, height));
    const span = radius * 2 + 1;

    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < height; y++) {
        const row = y * width;
        for (let x = 0; x < width; x++) line[x] = data[row + x];
        let sum = 0;
        for (let x = 0; x <= radius && x < width; x++) sum += line[x];
        for (let x = 0; x < width; x++) {
          data[row + x] = sum / span;
          if (x + radius + 1 < width) sum += line[x + radius + 1];
          if (x - radius >= 0) sum -= line[x - radius];
        }
      }
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) line[y] = data[y * width + x];
        let sum = 0;
        for (let y = 0; y <= radius && y < height; y++) sum += line[y];
        for (let y = 0; y < height; y++) {
          data[y * width + x] = sum / span;
          if (y + radius + 1 < height) sum += line[y + radius + 1];
          if (y - radius >= 0) sum -= line[y - radius];
        }
      }
    }
  },
};
