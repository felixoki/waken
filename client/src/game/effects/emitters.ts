import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";

export const emitters = {
  shard: (scene: Scene, x: number, y: number) => {
    const emitter = scene.add.particles(x, y, "particles", {
      tint: [0x00ccff, 0xaaffff, 0xffffff],
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.6, end: 0.2 },
      speed: { min: 20, max: 40 },
      lifespan: 400,
      frequency: 15,
      quantity: 2,
      blendMode: "ADD",
    });
    emitter.setDepth(1000);

    return emitter;
  },

  slash: (
    scene: Scene,
    entity: Entity,
    direction: { x: number; y: number },
  ) => {
    const angle = Math.atan2(direction.y, direction.x);
    const degrees = Phaser.Math.RadToDeg(angle);

    const lines = 4;
    const spread = 70;
    const duration = 300;
    const steps = 20;
    const radius = 32;

    for (let i = 0; i < lines; i++) {
      const offset = (i - (lines - 1) / 2) * 12;

      for (let step = 0; step < steps; step++) {
        const delay = (step / steps) * duration + Phaser.Math.Between(-10, 10);
        const progress = step / (steps - 1);

        const currentAngle = degrees + offset + (progress - 0.5) * spread;
        const rad = Phaser.Math.DegToRad(currentAngle);
        const distance = radius + progress * 15 + Phaser.Math.Between(-3, 3);

        const x = entity.x + Math.cos(rad) * distance;
        const y = entity.y + Math.sin(rad) * distance;

        scene.time.delayedCall(delay, () => {
          const emitter = scene.add.particles(x, y, "particles", {
            tint: [0xff3300, 0xff5500, 0xff6600, 0xff8800],
            alpha: { start: 1, end: 0 },
            scale: { start: 0.4, end: 0.03 },
            speed: { min: 10, max: 25 },
            angle: { min: currentAngle - 20, max: currentAngle + 20 },
            lifespan: 300,
            blendMode: "ADD",
            quantity: 3,
            frequency: -1,
          });

          emitter.setDepth(2000);
          emitter.explode();

          scene.time.delayedCall(200, () => {
            emitter.destroy();
          });
        });
      }
    }
  },
};
