import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { sprites } from "../handlers/sprites";

export const emitters = {
  burning: (entity: Entity): (() => void) => {
    const emitter = entity.scene.add.particles(0, 0, "particle_circle", {
      tint: [0xff4400, 0xff8800, 0xffcc00],
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.3, end: 0.05 },
      speed: { min: 10, max: 30 },
      lifespan: 600,
      frequency: 40,
      quantity: 2,
      blendMode: "ADD",
      follow: entity,
    });
    emitter.setDepth(999);
    return () => emitter.destroy();
  },

  cold: (entity: Entity): (() => void) => {
    const emitter = entity.scene.add.particles(0, 0, "particle_circle", {
      tint: [0xaaddff, 0xeeffff, 0xffffff],
      alpha: { start: 0.6, end: 0 },
      scale: { start: 0.2, end: 0.04 },
      speed: { min: 5, max: 15 },
      lifespan: 800,
      frequency: 80,
      quantity: 1,
      blendMode: "ADD",
      follow: entity,
    });
    emitter.setDepth(999);
    return () => emitter.destroy();
  },

  poisoned: (entity: Entity): (() => void) => {
    const emitter = entity.scene.add.particles(0, 0, "particle_circle", {
      tint: [0x44cc44, 0x88ff44, 0x226622],
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.15, end: 0.03 },
      speed: { min: 5, max: 20 },
      lifespan: 700,
      frequency: 100,
      quantity: 1,
      gravityY: 20,
      follow: entity,
    });
    emitter.setDepth(999);
    return () => emitter.destroy();
  },

  water: (
    entity: Entity,
    offset: { x: number; y: number },
    angle: { min: number; max: number },
  ): (() => void) => {
    const emitter = entity.scene.add.particles(0, 0, "particle_circle", {
      tint: [0x4aa6ff, 0x88ccff, 0xcdeeff],
      alpha: { start: 0.85, end: 0 },
      scale: { start: 0.18, end: 0.08 },
      speed: { min: 12, max: 28 },
      angle,
      gravityY: 60,
      lifespan: 900,
      frequency: 220,
      quantity: 1,
      follow: entity,
      followOffset: offset,
    });
    emitter.setDepth(entity.depth + 1);

    return () => {
      emitter.stop();
      entity.scene.time.delayedCall(600, () => emitter.destroy());
    };
  },

  shard: (scene: Scene, x: number, y: number, chargePercent?: number) => {
    const power = chargePercent ?? 1;
    const emitter = scene.add.particles(x, y, "particle_circle", {
      tint: [0x00ccff, 0xaaffff, 0xffffff],
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.4, end: 0.15 },
      speed: { min: 20, max: 40 },
      lifespan: 400,
      frequency: 15,
      quantity: Math.max(1, Math.round(2 * power)),
      blendMode: "ADD",
    });
    emitter.setDepth(1000);

    const embers = scene.add.particles(x, y, "particle_circle", {
      tint: [0x00ccff, 0x88ddff, 0xaaffff],
      alpha: { start: 0.6, end: 0 },
      scale: { start: 0.1, end: 0.02 },
      speed: { min: 1, max: 6 },
      lifespan: 500,
      frequency: 30,
      quantity: 2,
      blendMode: "ADD",
    });
    embers.setDepth(1001);
    embers.startFollow(emitter);

    return { main: emitter, embers };
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

  backslash: (
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
      const offset = (i - (lines - 1) / 2) * -10;

      for (let step = 0; step < steps; step++) {
        const delay = (step / steps) * duration + Phaser.Math.Between(-5, 5);
        const progress = step / (steps - 1);

        const currentAngle = degrees + offset + (0.5 - progress) * spread;
        const rad = Phaser.Math.DegToRad(currentAngle);
        const distance = radius + progress * 8 + Phaser.Math.Between(-1, 1);

        const x = entity.x + Math.cos(rad) * distance;
        const y = entity.y + Math.sin(rad) * distance;

        scene.time.delayedCall(delay, () => {
          const envelope = Math.sin(progress * Math.PI);
          const alphaStart = 1 * envelope;
          const scaleStart = 0.25 * (0.3 + 0.7 * envelope);

          const emitter = scene.add.particles(x, y, "particle_diamond", {
            tint: [0xff4400, 0xff6600, 0xff7700, 0xff9900],
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
              tint: [0xff7700, 0xff9900, 0xffbb44],
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

  stab: (scene: Scene, entity: Entity, direction: { x: number; y: number }) => {
    const angle = Math.atan2(direction.y, direction.x);
    const degrees = Phaser.Math.RadToDeg(angle);
    const rad = Phaser.Math.DegToRad(degrees);

    const stepsPerArm = 18;
    const armLength = 34;
    const halfAngle = 22;
    const tipDistance = 36;
    const duration = 140;
    const pushDistance = 16;

    const originX = entity.x;
    const originY = entity.y;

    const armAngles = [degrees + 180 - halfAngle, degrees + 180 + halfAngle];

    const totalFrames = 5;

    for (let f = 0; f < totalFrames; f++) {
      const frameDelay = (f / (totalFrames - 1)) * duration;
      const push = (f / (totalFrames - 1)) * pushDistance;

      scene.time.delayedCall(frameDelay, () => {
        const tipX = originX + Math.cos(rad) * (tipDistance + push);
        const tipY = originY + Math.sin(rad) * (tipDistance + push);

        for (let a = 0; a < armAngles.length; a++) {
          const armRad = Phaser.Math.DegToRad(armAngles[a]);
          const armDelay = a * 40;

          for (let step = 1; step < stepsPerArm; step++) {
            const progress = step / (stepsPerArm - 1);

            scene.time.delayedCall(armDelay, () => {
              const px = tipX + Math.cos(armRad) * armLength * progress;
              const py = tipY + Math.sin(armRad) * armLength * progress;

              const taper = 0.15 + progress * 0.85;

              const emitter = scene.add.particles(px, py, "particle_diamond", {
                tint: [0xffaa00, 0xffcc44, 0xffdd66, 0xffffff],
                alpha: { start: 0.9 * taper, end: 0 },
                scale: { start: 0.3 * taper, end: 0.05 },
                speed: { min: 30, max: 60 },
                angle: { min: degrees - 10, max: degrees + 10 },
                lifespan: 200,
                blendMode: "ADD",
                quantity: 2,
                frequency: -1,
              });

              emitter.setDepth(2000);
              emitter.explode();

              if (step % 3 === 0) {
                const ember = scene.add.particles(px, py, "particle_circle", {
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

              scene.time.delayedCall(200, () => emitter.destroy());
            });
          }
        }

        const spark = scene.add.particles(tipX, tipY, "particle_diamond", {
          tint: [0xffffff, 0xffee88],
          alpha: { start: 0.7, end: 0 },
          scale: { start: 0.12, end: 0.02 },
          speed: { min: 40, max: 70 },
          angle: { min: degrees - 6, max: degrees + 6 },
          lifespan: 120,
          blendMode: "ADD",
          quantity: 1,
          frequency: -1,
        });
        spark.setDepth(2001);
        spark.explode();

        scene.time.delayedCall(120, () => spark.destroy());
      });
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

  dissolve: (entity: Entity) => {
    const scene = entity.scene;
    const { scaleX: sx, scaleY: sy, depth } = entity;

    const chunks = sprites.pixels(entity, 1);

    const windAngle = -Math.PI / 6;
    const cosW = Math.cos(windAngle);
    const sinW = Math.sin(windAngle);

    let minDot = Infinity;
    let maxDot = -Infinity;

    for (const c of chunks) {
      const dot = c.tx * cosW + c.ty * sinW;
      if (dot < minDot) minDot = dot;
      if (dot > maxDot) maxDot = dot;
    }

    const dotRange = maxDot - minDot || 1;
    const stagger = 400;
    const duration = 600;
    const radius = Math.max(sx, sy) * 0.6;

    entity.setVisible(false);

    const particles: Phaser.GameObjects.Arc[] = [];

    for (const c of chunks) {
      const circle = scene.add.circle(c.x, c.y, radius, 0x111111);
      circle.setDepth(depth);
      particles.push(circle);

      const dot = c.tx * cosW + c.ty * sinW;
      const delay = ((dot - minDot) / dotRange) * stagger;

      const driftX =
        cosW * Phaser.Math.Between(10, 30) + Phaser.Math.Between(-6, 6);
      const driftY =
        sinW * Phaser.Math.Between(10, 30) + Phaser.Math.Between(-6, 6);

      scene.tweens.add({
        targets: circle,
        x: c.x + driftX,
        y: c.y + driftY,
        alpha: 0,
        delay,
        duration: duration + Phaser.Math.Between(-100, 100),
        ease: "Quad.easeIn",
        onComplete: () => circle.destroy(),
      });
    }

    scene.time.delayedCall(stagger + duration + 200, () => {
      particles.forEach((p) => {
        if (p.active) p.destroy();
      });
    });
  },

  break: (entity: Entity) => {
    const scene = entity.scene;
    const { scaleX: sx, scaleY: sy, depth, x: cx, y: cy } = entity;

    const block = 4;
    const chunks = sprites.pixels(entity, block);

    entity.setVisible(false);

    const width = block * sx;
    const height = block * sy;

    const pieces: Phaser.GameObjects.Rectangle[] = [];

    for (const c of chunks) {
      const rect = scene.add.rectangle(
        c.x,
        c.y,
        width,
        height,
        c.color,
        c.alpha,
      );
      rect.setDepth(depth);
      pieces.push(rect);

      const dx = c.x - cx;
      const dy = c.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;

      const power = Phaser.Math.Between(6, 16);
      const gravity = Phaser.Math.Between(12, 24);
      const duration = Phaser.Math.Between(750, 1150);

      scene.tweens.add({
        targets: rect,
        x: c.x + nx * power + Phaser.Math.Between(-3, 3),
        y: c.y + ny * power + gravity,
        angle: Phaser.Math.Between(-220, 220),
        alpha: 0,
        scale: { from: 1, to: 0.3 },
        delay: Phaser.Math.Between(0, 40),
        duration,
        ease: "Quad.easeOut",
        onComplete: () => rect.destroy(),
      });
    }

    const embers = scene.add.particles(cx, cy, "particle_circle", {
      tint: [0xffcc88, 0xeebb77, 0xcc9955],
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.12, end: 0.02 },
      speed: { min: 6, max: 24 },
      gravityY: 30,
      lifespan: { min: 600, max: 1000 },
      blendMode: "ADD",
      quantity: 14,
      frequency: -1,
    });
    embers.setDepth(depth + 2);
    embers.explode();
    scene.time.delayedCall(1100, () => embers.destroy());

    const puffs = 5;
    const smoke: Phaser.GameObjects.Arc[] = [];

    for (let i = 0; i < puffs; i++) {
      const ox = Phaser.Math.Between(-10, 10);
      const oy = Phaser.Math.Between(-10, 10);
      const puff = scene.add.circle(
        cx + ox,
        cy + oy,
        Phaser.Math.Between(4, 8),
        0x888888,
        0.5,
      );
      puff.setDepth(depth + 1);
      smoke.push(puff);

      scene.tweens.add({
        targets: puff,
        y: cy + oy - Phaser.Math.Between(10, 20),
        scale: { from: 0.6, to: 1.8 },
        alpha: 0,
        duration: Phaser.Math.Between(500, 850),
        ease: "Quad.easeOut",
        onComplete: () => puff.destroy(),
      });
    }

    scene.time.delayedCall(1400, () => {
      pieces.forEach((p) => {
        if (p.active) p.destroy();
      });
      smoke.forEach((p) => {
        if (p.active) p.destroy();
      });
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

  dust: (scene: Scene, x: number, y: number) => {
    const puff = scene.add.particles(x, y, "particle_circle", {
      tint: [0xb89a6a, 0xd4b87a, 0xc8a96e, 0xe8d0a0, 0x9a7a50],
      alpha: { start: 0.6, end: 0 },
      scale: { start: 0.5, end: 0.08 },
      speed: { min: 25, max: 70 },
      angle: { min: 190, max: 350 },
      gravityY: 40,
      lifespan: 700,
      quantity: 22,
      frequency: -1,
      blendMode: "NORMAL",
    });
    puff.setDepth(2000);
    puff.explode();

    const grit = scene.add.particles(x, y, "particle_square", {
      tint: [0x8a6a40, 0xaa8850, 0xc8a060],
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.18, end: 0.03 },
      speed: { min: 40, max: 100 },
      angle: { min: 180, max: 360 },
      gravityY: 80,
      lifespan: 500,
      quantity: 14,
      frequency: -1,
      blendMode: "NORMAL",
    });
    grit.setDepth(2001);
    grit.explode();

    scene.time.delayedCall(700, () => {
      puff.destroy();
      grit.destroy();
    });
  },

  butterfly: (scene: Scene, x: number, y: number) => {
    const emitter = scene.add.particles(x, y, "particle_butterfly", {
      tint: [
        0x66ccff, 0x88ddff, 0xaa88ff, 0xdd66ff, 0xff66aa, 0xff8866, 0xffcc44,
        0x66ffaa, 0x44ffdd, 0xccffff, 0xffffff,
      ],
      alpha: { start: 1, end: 0 },
      scale: { start: 0.35, end: 0.15 },
      speed: { min: 2, max: 8 },
      lifespan: 900,
      frequency: 50,
      quantity: 1,
      blendMode: "ADD",
      rotate: { min: -25, max: 25 },
    });
    emitter.setDepth(2000);

    return emitter;
  },

  lightning: (
    scene: Scene,
    source: { x: number; y: number },
    dest: { x: number; y: number },
  ) => {
    const createBolt = (
      sx: number,
      sy: number,
      dx: number,
      dy: number,
    ): { x: number; y: number }[] => {
      const tanX = dx - sx;
      const tanY = dy - sy;
      const length = Math.sqrt(tanX * tanX + tanY * tanY);
      const nx = tanY / length;
      const ny = -tanX / length;

      const positions: number[] = [0];
      const segCount = Math.max(4, Math.floor(length / 4));

      for (let i = 0; i < segCount; i++) positions.push(Math.random());

      positions.sort((a, b) => a - b);

      const sway = 60;
      const jaggedness = 1 / sway;
      const points: { x: number; y: number }[] = [{ x: sx, y: sy }];
      let prevDisplacement = 0;

      for (let i = 1; i < positions.length; i++) {
        const pos = positions[i];
        const scale = length * jaggedness * (pos - positions[i - 1]);
        const envelope = pos > 0.95 ? 20 * (1 - pos) : 1;

        let displacement = Phaser.Math.FloatBetween(-sway, sway);
        displacement -= (displacement - prevDisplacement) * (1 - scale);
        displacement *= envelope;

        points.push({
          x: sx + pos * tanX + displacement * nx,
          y: sy + pos * tanY + displacement * ny,
        });

        prevDisplacement = displacement;
      }

      points.push({ x: dx, y: dy });
      return points;
    };

    const drawBolt = (
      g: Phaser.GameObjects.Graphics,
      points: { x: number; y: number }[],
      thickness: number,
      color: number,
      alpha: number,
    ) => {
      g.lineStyle(thickness, color, alpha);
      g.beginPath();
      g.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++)
        g.lineTo(points[i].x, points[i].y);

      g.strokePath();
    };

    const g = scene.add.graphics();
    g.setDepth(2500);

    const mainPoints = createBolt(source.x, source.y, dest.x, dest.y);

    drawBolt(g, mainPoints, 2, 0x8888ff, 0.8);
    drawBolt(g, mainPoints, 1, 0xffffff, 1);

    for (let i = 0; i < mainPoints.length; i++) {
      if (i % 2 !== 0) continue;
      const p = mainPoints[i];

      const spark = scene.add.particles(p.x, p.y, "particle_circle", {
        tint: [0x8888ff, 0xaaaaff, 0xccccff, 0xffffff],
        alpha: { start: 0.7, end: 0 },
        scale: { start: 0.08, end: 0.01 },
        speed: { min: 1, max: 5 },
        lifespan: 2500,
        quantity: 4,
        frequency: -1,
        blendMode: "ADD",
      });
      spark.setDepth(2500);
      spark.explode();

      scene.time.delayedCall(2500, () => spark.destroy());
    }

    const branchCount = Phaser.Math.Between(2, 5);
    const diff = { x: dest.x - source.x, y: dest.y - source.y };

    for (let b = 0; b < branchCount; b++) {
      const t = Phaser.Math.FloatBetween(0.2, 0.7);
      const idx = Math.min(
        Math.floor(t * (mainPoints.length - 1)),
        mainPoints.length - 2,
      );
      const branchStart = mainPoints[idx];

      const branchAngle = ((b % 2 === 0 ? 1 : -1) * Math.PI) / 6;
      const cos = Math.cos(branchAngle);
      const sin = Math.sin(branchAngle);
      const remaining = 1 - t;
      const branchEnd = {
        x:
          branchStart.x +
          (diff.x * remaining * cos - diff.y * remaining * sin) * 0.5,
        y:
          branchStart.y +
          (diff.x * remaining * sin + diff.y * remaining * cos) * 0.5,
      };

      const branchPoints = createBolt(
        branchStart.x,
        branchStart.y,
        branchEnd.x,
        branchEnd.y,
      );

      drawBolt(g, branchPoints, 1.5, 0x8888ff, 0.6);
      drawBolt(g, branchPoints, 0.5, 0xffffff, 0.8);

      for (let j = 0; j < branchPoints.length; j++) {
        if (j % 5 !== 0) continue;
        const p = branchPoints[j];

        const bSpark = scene.add.particles(p.x, p.y, "particle_circle", {
          tint: [0x8888ff, 0xaaaaff, 0xffffff],
          alpha: { start: 0.5, end: 0 },
          scale: { start: 0.06, end: 0.01 },
          speed: { min: 1, max: 4 },
          lifespan: 2000,
          quantity: 3,
          frequency: -1,
          blendMode: "ADD",
        });
        bSpark.setDepth(2500);
        bSpark.explode();

        scene.time.delayedCall(2000, () => bSpark.destroy());
      }
    }

    const flash = scene.add.circle(dest.x, dest.y, 6, 0xccccff, 0.9);
    flash.setDepth(2501);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 4,
      scaleY: 4,
      duration: 300,
      onComplete: () => flash.destroy(),
    });

    scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 600,
      delay: 80,
      onComplete: () => g.destroy(),
    });

    const sparks = scene.add.particles(dest.x, dest.y, "particle_circle", {
      tint: [0xaaaaff, 0xccccff, 0xffffff, 0x6666ff],
      alpha: { start: 1, end: 0 },
      scale: { start: 0.15, end: 0.02 },
      speed: { min: 20, max: 60 },
      lifespan: 800,
      quantity: 40,
      frequency: -1,
      blendMode: "ADD",
    });
    sparks.setDepth(2500);
    sparks.explode();

    scene.time.delayedCall(800, () => sparks.destroy());

    const embers = scene.add.particles(dest.x, dest.y, "particle_circle", {
      tint: [0x6666ff, 0x8888ff, 0xaaaaff, 0xffffff],
      alpha: { start: 0.6, end: 0 },
      scale: { start: 0.08, end: 0.01 },
      speed: { min: 1, max: 6 },
      lifespan: 3000,
      quantity: 30,
      frequency: -1,
      blendMode: "ADD",
    });
    embers.setDepth(2501);
    embers.explode();

    scene.time.delayedCall(3000, () => embers.destroy());
  },

  grasp: (
    scene: Scene,
    origin: { x: number; y: number },
    target: { x: number; y: number },
    onGrasp?: () => void,
  ) => {
    const hand: { x: number; y: number }[] = [];

    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const facing = Math.atan2(dy, dx);
    const cos = Math.cos(facing + Math.PI / 2);
    const sin = Math.sin(facing + Math.PI / 2);
    const mirror = dx >= 0 ? -1 : 1;

    const rotate = (lx: number, ly: number) => ({
      x: lx * mirror * cos - ly * sin,
      y: lx * mirror * sin + ly * cos,
    });

    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const rx = 5 + Math.random() * 2;
      const ry = 7 + Math.random() * 2;
      hand.push(rotate(Math.cos(angle) * rx, Math.sin(angle) * ry + 6));
    }

    const fingers = [
      {
        root: { x: -6, y: 2 },
        phalanges: [
          { length: 5, angle: -0.3, width: 1.2 },
          { length: 4, angle: -0.9, width: 1.0 },
          { length: 3.5, angle: -0.7, width: 0.8 },
        ],
      },
      {
        root: { x: -3, y: 0 },
        phalanges: [
          { length: 6.5, angle: -0.15, width: 1.3 },
          { length: 5, angle: -0.6, width: 1.1 },
          { length: 4, angle: -0.5, width: 0.9 },
        ],
      },
      {
        root: { x: 0, y: -1 },
        phalanges: [
          { length: 7, angle: 0.05, width: 1.4 },
          { length: 5.5, angle: -0.4, width: 1.2 },
          { length: 4.5, angle: -0.6, width: 0.9 },
        ],
      },
      {
        root: { x: 3, y: 0 },
        phalanges: [
          { length: 6, angle: 0.2, width: 1.3 },
          { length: 5, angle: -0.3, width: 1.1 },
          { length: 4, angle: -0.8, width: 0.9 },
        ],
      },
      {
        root: { x: 6, y: 5 },
        phalanges: [
          { length: 4, angle: 0.6, width: 1.5 },
          { length: 3.5, angle: -0.4, width: 1.2 },
          { length: 3, angle: -0.5, width: 1.0 },
        ],
      },
    ];

    for (const finger of fingers) {
      let dir = -Math.PI / 2 + (Math.random() - 0.5) * 0.15;
      let px = finger.root.x;
      let py = finger.root.y;

      for (let p = 0; p < finger.phalanges.length; p++) {
        const ph = finger.phalanges[p];
        const jointAngle = ph.angle + (Math.random() - 0.5) * 0.25;
        dir += jointAngle;

        const segPoints = 5 + Math.floor(Math.random() * 3);
        for (let s = 0; s <= segPoints; s++) {
          const t = s / segPoints;
          const boneX = px + Math.cos(dir) * ph.length * t;
          const boneY = py + Math.sin(dir) * ph.length * t;
          const perp = dir + Math.PI / 2;
          const scatter = (Math.random() - 0.5) * ph.width;
          hand.push(
            rotate(
              boneX + Math.cos(perp) * scatter,
              boneY + Math.sin(perp) * scatter,
            ),
          );
        }

        const nextX = px + Math.cos(dir) * ph.length;
        const nextY = py + Math.sin(dir) * ph.length;
        const knuckleSize = ph.width * 1.4;
        for (let k = 0; k < 4; k++) {
          const ka = (k / 4) * Math.PI * 2;
          hand.push(
            rotate(
              nextX + Math.cos(ka) * knuckleSize * (0.5 + Math.random() * 0.5),
              nextY + Math.sin(ka) * knuckleSize * (0.5 + Math.random() * 0.5),
            ),
          );
        }

        px = nextX;
        py = nextY;
      }

      const tipLen = 2 + Math.random() * 1.5;
      hand.push(
        rotate(px + Math.cos(dir) * tipLen, py + Math.sin(dir) * tipLen),
      );
      hand.push(
        rotate(
          px + Math.cos(dir) * tipLen * 0.7 + (Math.random() - 0.5) * 0.5,
          py + Math.sin(dir) * tipLen * 0.7 + (Math.random() - 0.5) * 0.5,
        ),
      );
    }

    const tints = [0x1a0a2a, 0x2a1a3a, 0x3d1a4a, 0x110011, 0x220033];
    const glowTints = [0x6633aa, 0x8844cc, 0xaa55ee];
    const rushDuration = Math.min(400, Math.max(200, dist * 0.8));
    const particles: Phaser.GameObjects.Arc[] = [];
    const scale = 1.8;

    for (let i = 0; i < hand.length; i++) {
      const p = hand[i];
      const finalX = origin.x + p.x * scale;
      const finalY = origin.y + p.y * scale;
      const startX = finalX + Phaser.Math.Between(-8, 8);
      const startY = finalY + 20 + Phaser.Math.Between(5, 15);

      const radius = 1.2 + Math.random() * 0.8;
      const tint = tints[Math.floor(Math.random() * tints.length)];
      const circle = scene.add.circle(startX, startY, radius, tint);
      circle.setAlpha(0);
      circle.setDepth(2000);
      particles.push(circle);

      const riseDelay =
        (1 - (p.y + 16) / 32) * 200 + Phaser.Math.Between(0, 40);

      scene.tweens.add({
        targets: circle,
        x: finalX,
        y: finalY,
        alpha: 0.9,
        delay: riseDelay,
        duration: 300 + Phaser.Math.Between(-50, 50),
        ease: "Quad.easeOut",
      });
    }

    const aura = scene.add.particles(origin.x, origin.y, "particle_circle", {
      tint: glowTints,
      alpha: { start: 0.5, end: 0 },
      scale: { start: 0.15, end: 0.03 },
      speed: { min: 3, max: 10 },
      lifespan: 400,
      frequency: 20,
      quantity: 2,
      blendMode: "ADD",
    });
    aura.setDepth(2001);

    scene.time.delayedCall(500, () => {
      aura.setPosition(target.x, target.y);

      for (let i = 0; i < particles.length; i++) {
        const p = hand[i];
        const startX = particles[i].x;
        const startY = particles[i].y;
        const destX = target.x + p.x * scale + Phaser.Math.Between(-2, 2);
        const destY = target.y + p.y * scale + Phaser.Math.Between(-2, 2);
        const dur = rushDuration + Phaser.Math.Between(-30, 30);

        const trailCount = 4;
        for (let t = 1; t <= trailCount; t++) {
          const frac = t / (trailCount + 1);
          const delay = frac * dur;

          scene.time.delayedCall(delay, () => {
            const ember = scene.add.circle(
              startX + (destX - startX) * frac + Phaser.Math.Between(-2, 2),
              startY + (destY - startY) * frac + Phaser.Math.Between(-2, 2),
              particles[i].radius * 0.7,
              0x3d1a4a,
            );
            ember.setAlpha(0.5);
            ember.setDepth(1999);
            ember.setBlendMode(Phaser.BlendModes.ADD);

            scene.tweens.add({
              targets: ember,
              alpha: 0,
              scale: 0.3,
              duration: 700 + Phaser.Math.Between(-100, 100),
              ease: "Quad.easeIn",
              onComplete: () => ember.destroy(),
            });
          });
        }

        scene.tweens.add({
          targets: particles[i],
          x: destX,
          y: destY,
          duration: dur,
          ease: "Quad.easeIn",
        });
      }
    });

    const graspTime = 500 + rushDuration;
    scene.time.delayedCall(graspTime, () => {
      if (onGrasp) onGrasp();

      for (let i = 0; i < particles.length; i++) {
        const p = hand[i];
        const closedX = target.x + p.x * scale * 0.3;
        const closedY = target.y + p.y * scale * 0.4 + 2;

        scene.tweens.add({
          targets: particles[i],
          x: closedX,
          y: closedY,
          duration: 180 + Phaser.Math.Between(-20, 20),
          ease: "Back.easeIn",
        });
      }
    });

    const dissolveTime = graspTime + 300;
    scene.time.delayedCall(dissolveTime, () => {
      aura.stop();

      for (const circle of particles) {
        const driftX = Phaser.Math.Between(-20, 20);
        const driftY = Phaser.Math.Between(-25, -5);

        scene.tweens.add({
          targets: circle,
          x: circle.x + driftX,
          y: circle.y + driftY,
          alpha: 0,
          duration: 500 + Phaser.Math.Between(-100, 100),
          ease: "Quad.easeIn",
          onComplete: () => circle.destroy(),
        });
      }

      const burst = scene.add.particles(target.x, target.y, "particle_circle", {
        tint: tints,
        alpha: { start: 0.7, end: 0 },
        scale: { start: 0.3, end: 0.05 },
        speed: { min: 15, max: 40 },
        lifespan: 600,
        quantity: 20,
        frequency: -1,
        blendMode: "ADD",
      });
      burst.setDepth(2000);
      burst.explode();

      scene.time.delayedCall(600, () => {
        burst.destroy();
        aura.destroy();
      });
    });

    scene.time.delayedCall(dissolveTime + 800, () => {
      particles.forEach((p) => {
        if (p.active) p.destroy();
      });
    });
  },

  absorb: (victim: Entity, caster: Entity) => {
    const scene = victim.scene;
    const { scaleX: sx, scaleY: sy, depth } = victim;

    const block = 1;
    const chunks = sprites.pixels(victim, block);
    const radius = Math.max(sx, sy) * block * 0.55;

    const embers = scene.add.particles(0, 0, "particle_circle", {
      color: [0xcc0000, 0x660000, 0x1a0000],
      colorEase: "quad.out",
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.055, end: 0.006 },
      speed: { min: 2, max: 8 },
      gravityY: -4,
      lifespan: { min: 2400, max: 4200 },
      blendMode: "ADD",
      frequency: -1,
    });
    embers.setDepth(depth + 2);

    const pieces = chunks.map((c) => {
      const circle = scene.add.circle(c.x, c.y, radius, 0x000000, c.alpha);
      circle.setDepth(depth + 1);

      return {
        circle,
        sx: c.x,
        sy: c.y,
        alpha: c.alpha,
        delay: Math.random() * 0.3,
        ember: Math.random() < 0.025,
        lastEmit: -1,
      };
    });

    const progress = { t: 0 };

    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: 650,
      ease: "Linear",
      onUpdate: () => {
        const cx = caster.body.center.x;
        const cy = caster.body.center.y;

        for (const p of pieces) {
          const local = Phaser.Math.Clamp(
            (progress.t - p.delay) / (1 - p.delay),
            0,
            1,
          );
          const e = local * local;

          p.circle.x = Phaser.Math.Linear(p.sx, cx, e);
          p.circle.y = Phaser.Math.Linear(p.sy, cy, e);
          p.circle.setScale(1 - e * 0.7);
          p.circle.setAlpha(p.alpha * (1 - e * 0.4));

          if (p.ember && e > 0) {
            if (p.lastEmit < 0) p.lastEmit = 0;

            while (e - p.lastEmit >= 0.1) {
              p.lastEmit += 0.1;
              embers.emitParticleAt(
                Phaser.Math.Linear(p.sx, cx, p.lastEmit),
                Phaser.Math.Linear(p.sy, cy, p.lastEmit),
                1,
              );
            }
          }
        }
      },
      onComplete: () => {
        pieces.forEach((p) => p.circle.destroy());
        embers.stop();
        scene.time.delayedCall(4400, () => embers.destroy());
      },
    });
  },
};
