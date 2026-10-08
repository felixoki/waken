import { LIGHT_FLOOR } from "@server/globals";

export const light = {
  floor: (scene: Phaser.Scene): number =>
    LIGHT_FLOOR * Math.min(scene.scale.width, scene.scale.height),

  radius: (scene: Phaser.Scene, radius: number): number =>
    Math.hypot(radius, light.floor(scene)),

  gain: (scene: Phaser.Scene, radius: number): number => {
    const floor = light.floor(scene);

    return (radius * radius + floor * floor) / (radius * radius);
  },
};
