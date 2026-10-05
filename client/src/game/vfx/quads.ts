import { Scene } from "../scenes/Scene";
import { getWaveFrag } from "../pipelines/frags/wave";
import { getTideFrag } from "../pipelines/frags/tide";
import { getNovaFrag } from "../pipelines/frags/nova";
import { getSunderFrag } from "../pipelines/frags/sunder";
import { getBombFrag } from "../pipelines/frags/bomb";

type Quad = Phaser.GameObjects.Shader;
type Uniforms = Record<string, { type: string; value: number }>;

interface QuadDefinition {
  key: string;
  width: number;
  height: number;
  frag: () => string;
  uniforms: string[];
}

const WAVE: QuadDefinition = {
  key: "quad_wave",
  width: 300,
  height: 300,
  frag: getWaveFrag,
  uniforms: [
    "uTime",
    "uSeed",
    "uFacing",
    "uSpread",
    "uFront",
    "uThick",
    "uSweep",
    "uErode",
  ],
};

const TIDE: QuadDefinition = {
  key: "quad_tide",
  width: 300,
  height: 240,
  frag: getTideFrag,
  uniforms: ["uTime", "uSeed", "uGround", "uRadius", "uErode"],
};

const TIDE_GROUND = 84;

const NOVA: QuadDefinition = {
  key: "quad_nova",
  width: 540,
  height: 330,
  frag: getNovaFrag,
  uniforms: [
    "uTime",
    "uSeed",
    "uRadius",
    "uCharge",
    "uBurst",
    "uFlash",
    "uFade",
  ],
};

const SUNDER: QuadDefinition = {
  key: "quad_sunder",
  width: 720,
  height: 500,
  frag: getSunderFrag,
  uniforms: [
    "uTime",
    "uSeed",
    "uGround",
    "uLayer",
    "uRadius",
    "uSmoke",
    "uBeam",
    "uCrack",
    "uGlow",
    "uWave",
    "uShaft",
    "uFade",
  ],
};

const BOMB: QuadDefinition = {
  key: "quad_bomb",
  width: 460,
  height: 400,
  frag: getBombFrag,
  uniforms: [
    "uTime",
    "uSeed",
    "uGround",
    "uLayer",
    "uRadius",
    "uCharge",
    "uBlast",
    "uGrow",
    "uRise",
    "uScorch",
    "uFade",
  ],
};

const BOMB_GROUND = 170;
const SUNDER_GROUND = 220;

const WAVE_TRAVEL = 420;
const WAVE_SWEEP = 90;
const WAVE_ERODE_START = 260;
const WAVE_ERODE = 380;
const WAVE_SPREAD = 1.95;
const WAVE_THICK = 26;
const WAVE_START = 8;

const bases = new Map<string, Phaser.Display.BaseShader>();
const pools = new WeakMap<Scene, Map<string, Quad[]>>();

const clamp = (t: number) => Math.min(1, Math.max(0, t));
const cubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

const base = (definition: QuadDefinition): Phaser.Display.BaseShader => {
  let shader = bases.get(definition.key);

  if (!shader) {
    const uniforms: Uniforms = {};
    for (const name of definition.uniforms)
      uniforms[name] = { type: "1f", value: 0 };

    shader = new Phaser.Display.BaseShader(
      definition.key,
      definition.frag(),
      undefined,
      uniforms,
    );
    bases.set(definition.key, shader);
  }

  return shader;
};

const acquire = (
  scene: Scene,
  definition: QuadDefinition,
  x: number,
  y: number,
): Quad => {
  let pool = pools.get(scene);

  if (!pool) {
    pool = new Map();
    pools.set(scene, pool);
  }

  let free = pool.get(definition.key);

  if (!free) {
    free = [];
    pool.set(definition.key, free);
  }

  let quad = free.pop();
  while (quad && !quad.scene) quad = free.pop();

  if (!quad) {
    quad = scene.add.shader(
      base(definition),
      x,
      y,
      definition.width,
      definition.height,
    );
    (quad as Quad & { blendMode: number }).blendMode =
      Phaser.BlendModes.NORMAL;
  }

  const uniforms = quad.uniforms as Uniforms;
  for (const name of definition.uniforms) uniforms[name].value = 0;

  quad.setPosition(Math.round(x), Math.round(y));
  quad.setVisible(true);
  quad.setActive(true);

  return quad;
};

const release = (scene: Scene, definition: QuadDefinition, quad: Quad) => {
  if (!quad.scene) return;

  quad.setVisible(false);
  quad.setActive(false);
  pools.get(scene)?.get(definition.key)?.push(quad);
};

const set = (quad: Quad, name: string, value: number) => {
  (quad.uniforms as Uniforms)[name].value = value;
};

const stack = (
  scene: Scene,
  definition: QuadDefinition,
  x: number,
  y: number,
  ground: number,
  depths: number[],
): Quad[] => {
  const seed = Math.random() * 10;

  return depths.map((depth, layer) => {
    const quad = acquire(scene, definition, x, y);
    quad.setOrigin(0.5, 1 - ground / definition.height);
    quad.setDepth(depth);
    set(quad, "uSeed", seed);
    set(quad, "uGround", ground);
    set(quad, "uLayer", layer);
    return quad;
  });
};

const play = (
  scene: Scene,
  definition: QuadDefinition,
  layers: Quad[],
  total: number,
  update: (ms: number, put: (name: string, value: number) => void) => void,
) => {
  const progress = { t: 0 };

  const put = (name: string, value: number) => {
    for (const quad of layers) if (quad.scene) set(quad, name, value);
  };

  scene.tweens.add({
    targets: progress,
    t: 1,
    duration: total,
    ease: "Linear",
    onUpdate: () => {
      const ms = progress.t * total;
      put("uTime", ms * 0.001);
      update(ms, put);
    },
    onComplete: () => {
      for (const quad of layers) {
        quad.setRotation(0);
        quad.setOrigin(0.5, 0.5);
        release(scene, definition, quad);
      }
    },
  });
};

const once = (fn?: () => void) => {
  let fired = false;

  return () => {
    if (fired) return;
    fired = true;
    fn?.();
  };
};

export const quads = {
  wave: (
    scene: Scene,
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    range: number,
    onFront?: (front: number, done: boolean) => void,
  ) => {
    const facing = Math.atan2(direction.y, direction.x);
    const seed = Math.random() * 10;
    const total = WAVE_ERODE_START + WAVE_ERODE;

    const quad = acquire(scene, WAVE, origin.x, origin.y);
    quad.setDepth(2400);
    set(quad, "uSeed", seed);
    set(quad, "uFacing", facing);
    set(quad, "uSpread", WAVE_SPREAD);
    set(quad, "uThick", WAVE_THICK);

    const embers = scene.add.particles(0, 0, "particle_circle", {
      tint: [0x1f96b8, 0x8fdbf2, 0x0a4085],
      alpha: { start: 0.85, end: 0 },
      scale: { start: 0.07, end: 0.01 },
      speed: { min: 4, max: 22 },
      gravityY: -10,
      lifespan: { min: 300, max: 700 },
      emitting: false,
    });
    embers.setDepth(2402);

    const progress = { t: 0 };

    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: total,
      ease: "Linear",
      onUpdate: () => {
        if (!quad.scene) return;

        const rel = progress.t * total;

        set(quad, "uTime", rel * 0.001);

        const front = WAVE_START + (range - WAVE_START) * cubic(rel / WAVE_TRAVEL);
        const erode = clamp((rel - WAVE_ERODE_START) / WAVE_ERODE);

        set(quad, "uSweep", clamp(rel / WAVE_SWEEP));
        set(quad, "uFront", front);
        set(quad, "uErode", erode);

        onFront?.(front, rel >= WAVE_TRAVEL);

        if (erode < 0.85) {
          if (Math.random() < 0.6) {
            const u = Math.random() * 2 - 1;
            const a = facing + u * WAVE_SPREAD * 0.95;

            embers.emitParticleAt(
              origin.x + Math.cos(a) * (front + 1),
              origin.y + Math.sin(a) * (front + 1),
              1,
            );
          }
        }
      },
      onComplete: () => {
        release(scene, WAVE, quad);

        scene.time.delayedCall(800, () => {
          embers.destroy();
        });
      },
    });
  },

  nova: (
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    onBurst?: () => void,
  ) => {
    const quad = acquire(scene, NOVA, x, y);
    quad.setDepth(999);
    set(quad, "uSeed", Math.random() * 10);
    set(quad, "uRadius", radius);

    const burst = once(onBurst);

    const sparks = scene.add.particles(x, y - 12, "particle_circle", {
      tint: [0xe070ff, 0x8f8cff, 0xa8c4ff],
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.06, end: 0.01 },
      x: { min: -22, max: 22 },
      y: { min: -14, max: 14 },
      speedY: { min: -70, max: -20 },
      lifespan: { min: 250, max: 500 },
      frequency: 22,
      blendMode: "ADD",
    });
    sparks.setDepth(2401);

    const shards = scene.add.particles(x, y, "particle_diamond", {
      tint: [0xe24dff, 0xff7ae6, 0xb46bff],
      alpha: { start: 1, end: 0 },
      scale: { start: 0.2, end: 0.05 },
      rotate: { min: 0, max: 360 },
      lifespan: { min: 500, max: 1300 },
      emitting: false,
    });
    shards.setDepth(2401);

    play(scene, NOVA, [quad], 2400, (ms, put) => {
      const rel = ms - 320;

      put("uCharge", rel < 0 ? cubic(ms / 320) : 1 - clamp(rel / 90));
      put("uBurst", rel < 0 ? 0 : 0.16 + 0.84 * cubic(rel / 230));
      put("uFlash", rel < 0 ? 0 : 1 - clamp((rel - 80) / 420));
      put("uFade", clamp((rel - 520) / 1500));

      if (rel < 0) return;

      sparks.stop();
      burst();

      if (rel > 230) return;

      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = radius * (0.3 + Math.random() * 0.6) * cubic(rel / 230);
        const p = shards.emitParticleAt(
          x + Math.cos(a) * r,
          y + Math.sin(a) * r * 0.6,
          1,
        );
        if (!p) continue;

        const speed = 40 + Math.random() * 120;
        p.velocityX = Math.cos(a) * speed;
        p.velocityY = Math.sin(a) * speed * 0.6 - 30;
      }
    });

    scene.time.delayedCall(3600, () => {
      sparks.destroy();
      shards.destroy();
    });
  },

  bomb: (
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    onBlast?: () => void,
  ) => {
    const layers = stack(scene, BOMB, x, y, BOMB_GROUND, [999, 2400]);
    const blast = once(onBlast);

    const embers = scene.add.particles(x, y, "particle_circle", {
      tint: [0xffb43c, 0xff7a1f, 0xffe08a],
      alpha: { start: 1, end: 0 },
      scale: { start: 0.07, end: 0.01 },
      x: { min: -radius * 0.8, max: radius * 0.8 },
      y: { min: -radius * 0.45, max: radius * 0.45 },
      speedY: { min: -60, max: -15 },
      speedX: { min: -20, max: 20 },
      lifespan: { min: 300, max: 800 },
      frequency: 40,
      blendMode: "ADD",
    });
    embers.setDepth(2401);

    const sparks = scene.add.particles(x, y, "particle_circle", {
      tint: [0xffd27a, 0xff8a2a],
      alpha: { start: 1, end: 0 },
      scale: { start: 0.05, end: 0.01 },
      x: { min: -radius, max: radius },
      y: { min: -radius * 0.55, max: radius * 0.55 },
      speed: { min: 25, max: 90 },
      angle: { min: 180, max: 360 },
      gravityY: 60,
      lifespan: { min: 180, max: 420 },
      frequency: 55,
      blendMode: "ADD",
    });
    sparks.setDepth(2401);

    const debris = scene.add.particles(x, y, "particle_square", {
      tint: [0xf2c9a0, 0xff9a4d, 0x4d2a1a],
      alpha: { start: 1, end: 0.3 },
      scale: { start: 0.16, end: 0.05 },
      rotate: { min: 0, max: 360 },
      speed: { min: 90, max: 260 },
      angle: { min: 200, max: 340 },
      gravityY: 380,
      lifespan: { min: 400, max: 900 },
      emitting: false,
    });
    debris.setDepth(2401);

    play(scene, BOMB, layers, 2600, (ms, put) => {
      const rel = ms - 520;

      put("uRadius", radius);
      put("uCharge", rel < 0 ? cubic(ms / 420) : 1 - clamp(rel / 90));
      put("uBlast", rel < 0 ? 0 : clamp(rel / 50) * (1 - clamp((rel - 180) / 380)));
      put("uGrow", cubic(rel / 260));
      put("uRise", cubic(rel / 320));
      put("uScorch", clamp((rel - 160) / 260));
      put("uFade", clamp((ms - 1700) / 900));

      if (rel < 0) return;

      blast();
      if (rel < 60) debris.explode(14);
      if (rel > 500) embers.stop();
      if (rel > 300) sparks.stop();
    });

    scene.time.delayedCall(3600, () => {
      embers.destroy();
      sparks.destroy();
      debris.destroy();
    });
  },

  sunder: (
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    onImpact?: () => void,
  ) => {
    const layers = stack(scene, SUNDER, x, y, SUNDER_GROUND, [999, 2400]);
    const impact = once(onImpact);

    play(scene, SUNDER, layers, 1700, (ms, put) => {
      const rel = ms - 400;

      put("uRadius", radius * 0.42);
      put("uShaft", 0);
      put("uSmoke", cubic(ms / 420) * (1 - clamp((ms - 520) / 600)));
      put("uBeam", rel < 0 ? 0 : clamp(rel / 70) * (1 - clamp((rel - 380) / 380)));
      put("uCrack", cubic(rel / 420));
      put("uGlow", rel < 0 ? 0 : 1 - clamp((rel - 260) / 640));
      put("uWave", rel < 0 ? 0 : clamp(rel / 480));
      put("uFade", clamp((rel - 600) / 650));

      if (rel >= 0) impact();
    });
  },

  tide: (scene: Scene, x: number, y: number, radius: number, duration: number) => {
    const total = duration + 320;

    const quad = acquire(scene, TIDE, x, y);
    quad.setOrigin(0.5, 1 - TIDE_GROUND / TIDE.height);
    quad.setDepth(1000 + y + 20);
    set(quad, "uSeed", Math.random() * 10);
    set(quad, "uGround", TIDE_GROUND);

    const drops = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xffffff, 0xdcefff, 0xfff8e6],
      blendMode: "ADD",
      alpha: { start: 0.6, end: 0 },
      scale: { start: 0.11, end: 0.03 },
      gravityY: 260,
      lifespan: { min: 260, max: 520 },
      emitting: false,
    });
    drops.setDepth(1000 + y + 21);

    const progress = { t: 0 };

    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: total,
      ease: "Linear",
      onUpdate: () => {
        if (!quad.scene) return;

        const ms = progress.t * total;
        const r = 10 + (radius - 10) * cubic(ms / duration);

        set(quad, "uTime", ms * 0.001);
        set(quad, "uRadius", r);
        set(quad, "uErode", clamp((ms - duration * 0.6) / (total - duration * 0.6)));

        if (ms < duration && Math.random() < 0.7) {
          const a = Math.random() * Math.PI * 2;
          const p = drops.emitParticleAt(
            x + Math.cos(a) * r,
            y - Math.sin(a) * r * 0.5 - r * 0.3,
            1,
          );
          if (!p) return;

          p.velocityX = Math.cos(a) * 50;
          p.velocityY = -60 - Math.random() * 70;
        }
      },
      onComplete: () => {
        quad.setOrigin(0.5, 0.5);
        release(scene, TIDE, quad);
        scene.time.delayedCall(600, () => drops.destroy());
      },
    });
  },

};
