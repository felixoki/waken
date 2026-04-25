import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";

export const emitters = {
  burning: (entity: Entity): () => void => {
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

  cold: (entity: Entity): () => void => {
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

  poisoned: (entity: Entity): () => void => {
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
    const {
      frame,
      scaleX: sx,
      scaleY: sy,
      depth,
      x: worldX,
      y: worldY,
      originX,
      originY,
    } = entity;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = frame.cutWidth;
    canvas.height = frame.cutHeight;

    ctx.drawImage(
      frame.source.image as HTMLImageElement,
      frame.cutX,
      frame.cutY,
      frame.cutWidth,
      frame.cutHeight,
      0,
      0,
      frame.cutWidth,
      frame.cutHeight,
    );

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels: { x: number; y: number }[] = [];

    for (let py = 0; py < canvas.height; py++)
      for (let px = 0; px < canvas.width; px++)
        if (data[(py * canvas.width + px) * 4 + 3] > 0)
          pixels.push({ x: px, y: py });

    const windAngle = -Math.PI / 6;
    const cosW = Math.cos(windAngle);
    const sinW = Math.sin(windAngle);

    let minDot = Infinity;
    let maxDot = -Infinity;

    for (const p of pixels) {
      const dot = p.x * cosW + p.y * sinW;
      if (dot < minDot) minDot = dot;
      if (dot > maxDot) maxDot = dot;
    }

    const dotRange = maxDot - minDot || 1;
    const stagger = 400;
    const duration = 600;
    const radius = Math.max(sx, sy) * 0.6;

    entity.setVisible(false);

    const particles: Phaser.GameObjects.Arc[] = [];

    for (const p of pixels) {
      const px = worldX + (p.x - frame.cutWidth * originX) * sx;
      const py = worldY + (p.y - frame.cutHeight * originY) * sy;

      const circle = scene.add.circle(px, py, radius, 0x111111);
      circle.setDepth(depth);
      particles.push(circle);

      const dot = p.x * cosW + p.y * sinW;
      const delay = ((dot - minDot) / dotRange) * stagger;

      const driftX =
        cosW * Phaser.Math.Between(10, 30) + Phaser.Math.Between(-6, 6);
      const driftY =
        sinW * Phaser.Math.Between(10, 30) + Phaser.Math.Between(-6, 6);

      scene.tweens.add({
        targets: circle,
        x: px + driftX,
        y: py + driftY,
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
};
