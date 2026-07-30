import { Scene } from "../scenes/Scene";

export const texture = {
  spawn: (
    scene: Scene,
    x: number,
    y: number,
    sprite: string,
    frames: number,
    frameRate: number,
  ): void => {
    if (!scene.textures.exists(sprite)) return;

    const key = `${sprite}_spawn`;

    if (!scene.anims.exists(key))
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(sprite, {
          start: 0,
          end: frames - 1,
        }),
        frameRate,
      });

    const anim = scene.add.sprite(x, y, sprite);
    anim.setDepth(y);
    anim.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => anim.destroy());
    anim.play(key);
  },
};
