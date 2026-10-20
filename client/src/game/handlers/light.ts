import { LIGHT_FACE, LIGHT_FLOOR, LIGHT_OFFSET } from "@server/globals";
import type { Scene } from "../scenes/Scene";
import type { LightMask } from "../managers/Tile";

export const light = {
  floor: (scene: Phaser.Scene): number =>
    LIGHT_FLOOR * Math.min(scene.scale.width, scene.scale.height),

  radius: (scene: Phaser.Scene, radius: number): number =>
    Math.hypot(radius, light.floor(scene)),

  gain: (scene: Phaser.Scene, radius: number): number => {
    const floor = light.floor(scene);

    return (radius * radius + floor * floor) / (radius * radius);
  },

  ground: (mask: LightMask, x: number, y: number): number => {
    const px = Math.floor(x);
    const py = Math.floor(y);

    if (px < 0 || py < 0 || px >= mask.width || py >= mask.height) return y;

    const drop = mask.drop[py * mask.width + px];

    return drop && drop <= LIGHT_FACE ? py + drop + 0.5 : y;
  },

  blocked: (
    mask: LightMask,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ): boolean => {
    const { width, height, solid } = mask;
    const ground = light.ground(mask, x0, y0);
    const from = ground === y0 ? y0 : ground + LIGHT_OFFSET;
    const to = light.ground(mask, x1, y1);
    const dx = x1 - x0;
    const dy = to - from;
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
    if (steps < 2) return false;

    const sx = dx / steps;
    const sy = dy / steps;

    for (let i = 1; i < steps; i++) {
      const px = Math.floor(x0 + sx * i);
      const py = Math.floor(from + sy * i);

      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      if (solid[py * width + px]) return true;
    }

    return false;
  },

  texture: (scene: Scene): Phaser.Textures.Texture | null => {
    const key = `${scene.scene.key}:light`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const { width, height, solid, drop } = scene.tileManager.getLightMask();
    if (!solid.includes(1)) return null;

    const data = new Uint8Array(width * height * 4);

    for (let i = 0; i < solid.length; i++) {
      data[i * 4] = solid[i] ? 255 : 0;
      data[i * 4 + 1] = drop[i];
      data[i * 4 + 3] = 255;
    }

    return scene.textures.addUint8Array(key, data, width, height);
  },
};
