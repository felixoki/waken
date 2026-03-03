import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";

export const emitters = {
  shard: (scene: Scene, x: number, y: number) => {
    const emitter = scene.add.particles(x, y, "particle_circle", {
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
    const spread = 55;
    const duration = 150;
    const steps = 24;
    const radius = 28;

    for (let i = 0; i < lines; i++) {
      const offset = (i - (lines - 1) / 2) * 10;

      for (let step = 0; step < steps; step++) {
        const delay = (step / steps) * duration + Phaser.Math.Between(-5, 5);
        const progress = step / (steps - 1);

        const currentAngle = degrees + offset + (progress - 0.5) * spread;
        const rad = Phaser.Math.DegToRad(currentAngle);
        const distance = radius + progress * 8 + Phaser.Math.Between(-1, 1);

        const x = entity.x + Math.cos(rad) * distance;
        const y = entity.y + Math.sin(rad) * distance;

        scene.time.delayedCall(delay, () => {
          const envelope = Math.sin(progress * Math.PI);
          const alphaStart = 1 * envelope;
          const scaleStart = 0.25 * (0.3 + 0.7 * envelope);

          const emitter = scene.add.particles(x, y, "particle_diamond", {
            tint: [0xff3300, 0xff5500, 0xff6600, 0xff8800],
            alpha: { start: alphaStart, end: 0 },
            scale: { start: scaleStart, end: 0.04 },
            speed: { min: 3, max: 10 },
            angle: { min: currentAngle - 10, max: currentAngle + 10 },
            lifespan: 250,
            blendMode: "ADD",
            quantity: 2,
            frequency: -1,
          });

          emitter.setDepth(2000);
          emitter.explode();

          if (step % 4 === 0) {
            const ember = scene.add.particles(x, y, "particle_circle", {
              tint: [0xff6600, 0xff8800, 0xffaa33],
              alpha: { start: 0.6, end: 0 },
              scale: { start: 0.1, end: 0.02 },
              speed: { min: 3, max: 12 },
              lifespan: 600,
              blendMode: "ADD",
              quantity: 2,
              frequency: -1,
            });
            ember.setDepth(2001);
            ember.explode();

            scene.time.delayedCall(600, () => ember.destroy());
          }

          scene.time.delayedCall(200, () => {
            emitter.destroy();
          });
        });
      }
    }
  },

  claw: (
    scene: Scene,
    x: number,
    y: number,
    hitbox: { width: number; height: number },
    direction: { x: number; y: number },
  ) => {
    const slashes = 3;
    const gap = 10;
    const length = Math.max(hitbox.width, hitbox.height) * 0.8;
    const steps = 60;
    const duration = 30;
    const delay = 90;
    const delayPerSlash = 15;
    const bowAmount = 0.15;

    const facing = Phaser.Math.RadToDeg(Math.atan2(direction.y, direction.x));
    const tints = [0x2a1a1a, 0x3d2828, 0x553535, 0x684545, 0x7a5555];
    const sparkTints = [0xaa7070, 0xcc8888, 0xddaaaa];

    const spawn = (side: number, delay: number) => {
      const angle = facing + (side === 0 ? 35 : -35);
      const rad = Phaser.Math.DegToRad(angle);
      const perpRad = rad + Math.PI / 2;
      const bowDir = side === 0 ? -1 : 1;
      const sideOffset = side === 0 ? -6 : 6;

      for (let s = 0; s < slashes; s++) {
        const perpOffset = (s - (slashes - 1) / 2) * gap;
        const slashDelay = delay + s * delayPerSlash;

        const start = {
          x: x - (Math.cos(rad) * length) / 2 + Math.cos(perpRad) * perpOffset,
          y:
            y +
            sideOffset -
            (Math.sin(rad) * length) / 2 +
            Math.sin(perpRad) * perpOffset,
        };
        const end = {
          x: x + (Math.cos(rad) * length) / 2 + Math.cos(perpRad) * perpOffset,
          y:
            y +
            sideOffset +
            (Math.sin(rad) * length) / 2 +
            Math.sin(perpRad) * perpOffset,
        };

        for (let step = 0; step < steps; step++) {
          const progress = step / (steps - 1);
          const stepDelay =
            slashDelay + progress * duration + Phaser.Math.Between(-3, 3);

          scene.time.delayedCall(stepDelay, () => {
            const bow = Math.sin(progress * Math.PI) * length * bowAmount;
            const lx =
              start.x +
              (end.x - start.x) * progress +
              Math.cos(perpRad) * bow * bowDir;
            const ly =
              start.y +
              (end.y - start.y) * progress +
              Math.sin(perpRad) * bow * bowDir;

            const envelope = Math.sin(progress * Math.PI);
            const alphaStart = 0.9 * envelope;
            const scaleStart = 0.12 * (0.3 + 0.7 * envelope);

            const emitter = scene.add.particles(lx, ly, "particle_diamond", {
              tint: tints,
              alpha: { start: alphaStart, end: 0 },
              scale: { start: scaleStart, end: 0.02 },
              speed: { min: 2, max: 10 },
              angle: {
                min: angle - 15,
                max: angle + 15,
              },
              lifespan: 320,
              blendMode: "ADD",
              quantity: 40,
              frequency: -1,
            });
            emitter.setDepth(2000);
            emitter.explode();

            if (step % 3 === 0) {
              const spark = scene.add.particles(lx, ly, "particle_square", {
                tint: sparkTints,
                alpha: { start: 0.7, end: 0 },
                scale: { start: 0.08, end: 0.01 },
                speed: { min: 2, max: 6 },
                lifespan: 900,
                blendMode: "ADD",
                quantity: 4,
                frequency: -1,
              });
              spark.setDepth(2001);
              spark.explode();

              scene.time.delayedCall(650, () => spark.destroy());
            }

            scene.time.delayedCall(320, () => emitter.destroy());
          });
        }
      }
    };

    spawn(0, 0);
    spawn(1, delay);
  },

  death: (scene: Scene, x: number, y: number) => {
    const emitter = scene.add.particles(x, y, "particle_circle", {
      tint: [0xff3300, 0xff5500, 0xffaa00, 0xffffff],
      alpha: { start: 1, end: 0 },
      scale: { start: 0.5, end: 0.1 },
      speed: { min: 30, max: 80 },
      lifespan: 500,
      quantity: 16,
      frequency: -1,
      blendMode: "ADD",
    });

    emitter.setDepth(2000);
    emitter.explode();

    scene.time.delayedCall(500, () => {
      emitter.destroy();
    });
  },

  fall: (
    scene: Scene,
    impact: { x: number; y: number },
    onImpact: () => void,
  ) => {
    const duration = 800;
    const start = {
      x: impact.x + 160,
      y: impact.y - 200,
    };

    const shadow = scene.add.ellipse(impact.x, impact.y, 6, 3, 0x000000, 0.3);
    shadow.setDepth(1999);

    scene.tweens.add({
      targets: shadow,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0.5,
      duration: duration,
      ease: "Quad.easeIn",
      onComplete: () => shadow.destroy(),
    });

    const meteor = scene.add.rectangle(start.x, start.y, 1, 1, 0x000000, 0);
    meteor.setDepth(0);

    const trail = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xff2200, 0xff4400, 0xff6600, 0xffaa00, 0xffdd44],
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.5, end: 0.15 },
      speed: { min: 10, max: 25 },
      lifespan: 500,
      frequency: 12,
      quantity: 2,
      blendMode: "ADD",
    });
    trail.setDepth(2100);
    trail.startFollow(meteor);

    scene.tweens.add({
      targets: meteor,
      x: impact.x,
      y: impact.y,
      duration: duration,
      ease: "Quad.easeIn",
      onComplete: () => {
        trail.stop();
        scene.time.delayedCall(500, () => trail.destroy());
        meteor.destroy();
        onImpact();
      },
    });
  },

  impact: (scene: Scene, impact: { x: number; y: number }) => {
    const burst = scene.add.particles(impact.x, impact.y, "particle_circle", {
      tint: [0xff2200, 0xff4400, 0xff6600, 0xffaa00],
      alpha: { start: 1, end: 0 },
      scale: { start: 0.8, end: 0.1 },
      speed: { min: 50, max: 140 },
      lifespan: 500,
      quantity: 35,
      frequency: -1,
      blendMode: "ADD",
    });
    burst.setDepth(2000);
    burst.explode();

    const debris = scene.add.particles(impact.x, impact.y, "particle_square", {
      tint: [0x331100, 0x552200, 0x773300, 0xaa4400],
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.4, end: 0.08 },
      speed: { min: 40, max: 100 },
      lifespan: 600,
      quantity: 18,
      frequency: -1,
      blendMode: "NORMAL",
    });
    debris.setDepth(2000);
    debris.explode();

    const embers = scene.add.particles(impact.x, impact.y, "particle_circle", {
      tint: [0xff4400, 0xff6600, 0xffaa00],
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.25, end: 0.04 },
      speed: { min: 5, max: 15 },
      lifespan: 1000,
      quantity: 14,
      frequency: -1,
      blendMode: "ADD",
    });
    embers.setDepth(2001);
    embers.explode();

    scene.time.delayedCall(1000, () => {
      burst.destroy();
      debris.destroy();
      embers.destroy();
    });
  },
};
