import { Scene } from "../scenes/Scene";
import { Entity } from "../Entity";
import { getWaveFrag } from "../pipelines/frags/wave";
import { getTideFrag } from "../pipelines/frags/tide";
import { getWardFrag } from "../pipelines/frags/ward";
import { getWellspringFrag } from "../pipelines/frags/wellspring";
import { getNovaFrag } from "../pipelines/frags/nova";
import { getSunderFrag } from "../pipelines/frags/sunder";
import { getBombFrag } from "../pipelines/frags/bomb";
import { getStormFrag } from "../pipelines/frags/storm";
import { getSwellFrag } from "../pipelines/frags/swell";
import { getScorchFrag } from "../pipelines/frags/scorch";
import { getMeteorFrag } from "../pipelines/frags/meteor";
import { getCraterFrag } from "../pipelines/frags/crater";
import { getPlumeFrag } from "../pipelines/frags/plume";
import { getBreathFrag } from "../pipelines/frags/breath";
import { getSpikesFrag } from "../pipelines/frags/spikes";
import { SPIKE_FRAMES } from "./spikeFrames";

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

const WARD: QuadDefinition = {
  key: "quad_ward",
  width: 64,
  height: 64,
  frag: getWardFrag,
  uniforms: ["uTime", "uSeed", "uRadius", "uAppear", "uBreak"],
};

const WARD_RADIUS = 20;
const WARD_DELAY = 220;
const WARD_APPEAR = 480;
const WARD_BREAK = 320;

const WELLSPRING: QuadDefinition = {
  key: "quad_wellspring",
  width: 300,
  height: 200,
  frag: getWellspringFrag,
  uniforms: ["uTime", "uSeed", "uRadius", "uSpread", "uFlash", "uFade"],
};

const SWELL: QuadDefinition = {
  key: "quad_swell",
  width: 380,
  height: 320,
  frag: getSwellFrag,
  uniforms: [
    "uTime",
    "uSeed",
    "uGround",
    "uLayer",
    "uRadius",
    "uCharge",
    "uBurst",
    "uDome",
    "uFlash",
    "uSpread",
    "uHollow",
    "uFade",
    "uSoak",
  ],
};

const SWELL_GROUND = 130;
const SWELL_REACH = 80;
const SWELL_CHARGE = 260;
const SWELL_SETTLE = 1300;
const SWELL_SOAK = 4400;
const SWELL_START = 0.24;
const SWELL_DRIFT = 1.06;

const WELLSPRING_RISE = 480;
const WELLSPRING_HIT = 180;
const WELLSPRING_HOLD = 1500;
const WELLSPRING_FADE = 1100;

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

const SCORCH: QuadDefinition = {
  key: "quad_scorch",
  width: 300,
  height: 200,
  frag: getScorchFrag,
  uniforms: ["uTime", "uSeed", "uRadius", "uAppear", "uFade"],
};

const METEOR: QuadDefinition = {
  key: "quad_meteor",
  width: 240,
  height: 80,
  frag: getMeteorFrag,
  uniforms: ["uTime", "uSeed", "uSize", "uHeat", "uTravel", "uFade", "uGone"],
};

const SPIKES: QuadDefinition = {
  key: "quad_spikes",
  width: 220,
  height: 150,
  frag: getSpikesFrag,
  uniforms: ["uTime", "uSeed", "uGround", "uRadius", "uLead", "uAge"],
};

const SPIKES_GROUND = 65;
const SPIKES_AFTER = 1800;
const SPIKE_SIZE = { width: 33, height: 32 };
const SPIKE_TIMING = [70, 70, 90, 260, 110, 110];
const SPIKE_HOT: Record<string, string> = {
  "#": "#5c1408",
  b: "#e0501a",
  w: "#ffd36a",
};

const SPIKE_COOL: Record<string, string> = {
  "#": "#3a0c08",
  b: "#9a2414",
  w: "#f08a2c",
};

const SPIKE_GLOW_COLOR = 0xff8a2a;
const SPIKE_COOL_AT = 420;
const SPIKE_SPREAD = 130;
const SPIKE_LAYOUT: [number, number, 3 | 4][] = [
  [-0.75, 0.05, 3],
  [-0.35, -0.5, 3],
  [-0.3, 0.45, 3],
  [0, 0, 4],
  [0.35, -0.45, 4],
  [0.4, 0.5, 3],
  [0.75, 0.05, 4],
  [0.7, -0.75, 3],
  [0.8, 0.75, 3],
];

const spikeSheet = (scene: Scene, tier: 3 | 4): string => {
  const key = `spikes_fire_${tier}`;
  if (scene.textures.exists(key)) return key;

  const frames = SPIKE_FRAMES[tier];
  const { width, height } = SPIKE_SIZE;
  const canvas = scene.textures.createCanvas(key, width * frames.length, height);
  if (!canvas) return key;
  const ctx = canvas.getContext();

  frames.forEach((rows, f) => {
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const ch = rows[y][x];
        if (ch === ".") continue;
        ctx.fillStyle = (f < frames.length - 2 ? SPIKE_HOT : SPIKE_COOL)[ch];
        ctx.fillRect(f * width + x, y, 1, 1);
      }

    canvas.add(f, 0, f * width, 0, width, height);
  });

  canvas.refresh();
  canvas.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
};

const spikeBurst = (scene: Scene, x: number, y: number, tier: 3 | 4) => {
  const key = spikeSheet(scene, tier);
  const px = Math.round(x);
  const py = Math.round(y);

  const light = scene.add.image(px, py - 6, "particle_glow");
  light.setBlendMode(Phaser.BlendModes.ADD);
  light.setTint(0xff7a24);
  light.setScale(tier === 4 ? 2.4 : 1.8, tier === 4 ? 1.5 : 1.1);
  light.setAlpha(0);
  light.setDepth(1000 + py - 1);

  const spikes = scene.add.image(px, py, key, 0);
  spikes.setOrigin(0.5, 0.75);
  spikes.setDepth(1000 + py);
  spikes.preFX?.setPadding(12);
  const glow = spikes.preFX?.addGlow(SPIKE_GLOW_COLOR, 0, 0, false, 0.1, 10);

  const shine = scene.add.image(px, py, key, 0);
  shine.setOrigin(0.5, 0.75);
  shine.setDepth(1000 + py + 0.5);
  shine.setBlendMode(Phaser.BlendModes.ADD);
  shine.setAlpha(0);

  const sparks = scene.add.particles(px, py - 10, "particle_glow", {
    tint: [0xffd27a, 0xffa040, 0xff6a1f, 0xff3a14],
    alpha: { start: 1, end: 0 },
    scale: { start: 0.10, end: 0.02 },
    x: { min: -14, max: 14 },
    y: { min: -10, max: 8 },
    speedY: { min: -32, max: -10 },
    speedX: { min: -10, max: 10 },
    accelerationX: { min: -12, max: 12 },
    lifespan: { min: 500, max: 1200 },
    frequency: tier === 4 ? 28 : 45,
    blendMode: "ADD",
  });
  sparks.setDepth(1000 + py + 1);

  const heat = { t: 0 };
  const total = SPIKE_TIMING.reduce((sum, ms) => sum + ms, 0);
  const tween = scene.tweens.add({
    targets: heat,
    t: 1,
    duration: total,
    ease: "Linear",
    onUpdate: () => {
      const ms = heat.t * total;
      const rise = clamp(ms / 120);
      const cool = clamp((ms - SPIKE_COOL_AT) / (total - SPIKE_COOL_AT));
      const flicker = 0.85 + 0.15 * Math.sin(ms * 0.045 + px) * Math.sin(ms * 0.031 + py);
      const power = rise * (1 - cool * 0.85) * flicker;

      if (glow) {
        glow.outerStrength = 6 * power;
        glow.innerStrength = 2.5 * power;
      }
      shine.setAlpha(0.45 * power);
      light.setAlpha(0.30 * power);
    },
  });

  let at = 0;
  SPIKE_TIMING.forEach((ms, f) => {
    scene.time.delayedCall(at, () => {
      if (!spikes.scene) return;
      spikes.setFrame(f);
      shine.setFrame(f);
      if (f === SPIKE_TIMING.length - 2) sparks.stop();
    });
    at += ms;
  });

  scene.time.delayedCall(at, () => {
    tween.stop();
    light.destroy();
    spikes.destroy();
    shine.destroy();
    scene.time.delayedCall(1300, () => sparks.destroy());
  });
};

const BREATH: QuadDefinition = {
  key: "quad_breath",
  width: 190,
  height: 120,
  frag: getBreathFrag,
  uniforms: [
    "uTime",
    "uSeed",
    "uLayer",
    "uLength",
    "uOn",
    "uReach",
    "uBurnt",
    "uAfter",
  ],
};

const BREATH_MARGIN = 16;
const BREATH_RISE = 80;
const BREATH_TRAVEL = 380;
const BREATH_OFF = 380;
const BREATH_AFTER = 2400;

const PLUME: QuadDefinition = {
  key: "quad_plume",
  width: 320,
  height: 150,
  frag: getPlumeFrag,
  uniforms: ["uTime", "uSeed", "uLength", "uFall", "uNow", "uLife", "uSize"],
};

const PLUME_MARGIN = 30;
const PLUME_LIFE = 900;

const CRATER: QuadDefinition = {
  key: "quad_crater",
  width: 180,
  height: 140,
  frag: getCraterFrag,
  uniforms: [
    "uTime",
    "uSeed",
    "uGround",
    "uLayer",
    "uRadius",
    "uCharge",
    "uFlash",
    "uBurn",
    "uDust",
    "uCool",
    "uDrift",
    "uAge",
    "uFade",
  ],
};

const CRATER_GROUND = 55;
const CRATER_RADIUS = 27;
const CRATER_AFTER = 3300;

const SCORCH_REACH = 2.2;
const METEOR_REACH = 1.85;
const SCORCH_APPEAR = 600;
const SCORCH_FADE = 900;
const METEOR_NOSE = 30;
const METEOR_SIZE = 16;
const METEOR_SCALE = 0.55;
const METEOR_LEAD = 550;
const METEOR_SPREAD = 1200;
const METEOR_FALL = 700;
const METEOR_FADE = 150;
const METEOR_FROM = { x: 160, y: -200 };

const STORM_UNIFORMS = [
  "uTime",
  "uSeed",
  "uGround",
  "uLayer",
  "uRadius",
  "uLean",
  "uGale",
  "uWind",
  "uLift",
  "uLeader",
  "uDrop",
  "uBolt",
  "uFlash",
  "uDisc",
  "uCrown",
  "uSpread",
  "uScar",
  "uGlow",
  "uFade",
  "uAx",
  "uAy",
  "uBx",
  "uBy",
];

const STORM: QuadDefinition = {
  key: "quad_storm",
  width: 300,
  height: 330,
  frag: getStormFrag,
  uniforms: STORM_UNIFORMS,
};

const ARC: QuadDefinition = {
  key: "quad_arc",
  width: 320,
  height: 320,
  frag: getStormFrag,
  uniforms: STORM_UNIFORMS,
};

const GALE: QuadDefinition = {
  key: "quad_gale",
  width: 440,
  height: 260,
  frag: getStormFrag,
  uniforms: STORM_UNIFORMS,
};

const GALE_GROUND = 105;
const STORM_GROUND = 100;
const STORM_AFTER = 2600;
const ARC_LIFE = 240;
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

  put("uTime", 0);
  update(0, put);

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
        quad.setScale(1);
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

type Piece = {
  at: number;
  kind: number;
  gx: number;
  gy: number;
  vx: number;
  vy: number;
  h: number;
  vz: number;
  life: number;
  age: number;
  bounced: boolean;
};

const FLING_TIME = 2400;
const SPARK_COLORS = [0xfff1c8, 0xffd27a, 0xffa040, 0xff6a1f, 0xc23a12];

const fling = (scene: Scene, x: number, y: number, radius: number) => {
  const pieces: Piece[] = [];
  const add = (kind: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = Math.sqrt(Math.random()) * radius * 0.35;
      const b = Math.random() * Math.PI * 2;
      const reach = [12 + 85 * Math.pow(Math.random(), 2.2), 14 + 40 * Math.pow(Math.random(), 1.5), 2 + 10 * Math.random()][kind];
      pieces.push({
        at: kind === 2 ? 60 + Math.random() * 500 : Math.pow(Math.random(), 2) * 200,
        kind,
        gx: x + Math.cos(a) * rr,
        gy: y + Math.sin(a) * rr * 0.6,
        vx: Math.cos(b) * reach,
        vy: Math.sin(b) * reach * 0.6,
        h: 2 + Math.random() * 4,
        vz: [35 + 115 * Math.random(), 25 + 70 * Math.random(), 10 + 25 * Math.random()][kind],
        life: [0.35 + 0.65 * Math.random(), 1.2 + 0.8 * Math.random(), 1.0 + 1.0 * Math.random()][kind],
        age: 0,
        bounced: false,
      });
    }
  };

  add(1, 6);
  add(2, 8);

  const glow = scene.add.graphics();
  glow.setDepth(2401);
  glow.setBlendMode(Phaser.BlendModes.ADD);

  const dirt = scene.add.graphics();
  dirt.setDepth(1000 + y - 0.5);

  const progress = { t: 0 };
  let last = 0;

  scene.tweens.add({
    targets: progress,
    t: 1,
    duration: FLING_TIME,
    ease: "Linear",
    onUpdate: () => {
      const ms = progress.t * FLING_TIME;
      const dt = Math.min((ms - last) * 0.001, 0.05);
      last = ms;

      glow.clear();
      dirt.clear();

      for (const p of pieces) {
        if (ms < p.at || p.age >= p.life) continue;

        p.age += dt;
        const gravity = [330, 430, -12][p.kind];
        p.vz -= gravity * dt;
        p.gx += p.vx * dt;
        p.gy += p.vy * dt;
        p.h += p.vz * dt;

        if (p.kind === 2) {
          p.vx += (Math.random() - 0.5) * 30 * dt;
          p.vy *= 0.98;
        }

        if (p.h < 0 && p.kind !== 2) {
          p.h = 0;
          if (p.bounced || p.kind === 0 && Math.random() < 0.5) {
            p.vx *= p.kind === 1 ? 0 : 0.3;
            p.vy *= p.kind === 1 ? 0 : 0.3;
            p.vz = 0;
            if (p.kind === 0) p.age = Math.max(p.age, p.life - 0.12);
          } else {
            p.bounced = true;
            p.vz = -p.vz * 0.3;
            p.vx *= 0.5;
            p.vy *= 0.5;
          }
        }

        const k = clamp(p.age / p.life);
        const sx = p.gx;
        const sy = p.gy - p.h;

        if (p.kind === 0) {
          const ux = p.vx;
          const uy = p.vy - p.vz;
          const len = Math.min(Math.hypot(ux, uy) * 0.04, 7);
          const n = Math.hypot(ux, uy) || 1;
          const color = SPARK_COLORS[Math.min(SPARK_COLORS.length - 1, Math.floor(k * SPARK_COLORS.length))];
          glow.lineStyle(0.8, color, 1 - k * k);
          glow.lineBetween(sx - (ux / n) * len, sy - (uy / n) * len, sx, sy);
        } else if (p.kind === 2) {
          const flicker = 0.6 + 0.4 * Math.sin(ms * 0.02 + p.at);
          glow.fillStyle(k < 0.5 ? 0xffb050 : 0xff6a1f, (1 - k) * flicker);
          glow.fillCircle(sx, sy, 0.7);
        } else {
          dirt.fillStyle(0x3a2a20, 1 - Math.max(0, k - 0.7) / 0.3);
          dirt.fillCircle(sx, sy, 0.75);
        }
      }
    },
    onComplete: () => {
      glow.destroy();
      dirt.destroy();
    },
  });
};

export const quads = {
  spikes: (
    scene: Scene,
    x: number,
    y: number,
    direction: { x: number; y: number },
    radius: number,
    lead: number,
  ) => {
    const ground = acquire(scene, SPIKES, x, y);
    ground.setOrigin(0.5, 1 - SPIKES_GROUND / SPIKES.height);
    ground.setDepth(999);
    set(ground, "uSeed", Math.random() * 10);
    set(ground, "uGround", SPIKES_GROUND);
    set(ground, "uRadius", radius);
    set(ground, "uLead", lead * 0.001);

    const dl = Math.hypot(direction.x, direction.y) || 1;
    const ux = direction.x / dl;
    const uy = direction.y / dl;

    const embers = scene.add.particles(x, y, "particle_square", {
      tint: [0xffc070, 0xff8a2a, 0xff5a1f],
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.125, end: 0.0625 },
      x: { min: -radius * 0.8, max: radius * 0.8 },
      y: { min: -radius * 0.4, max: radius * 0.3 },
      speedY: { min: -26, max: -6 },
      speedX: { min: -8, max: 8 },
      lifespan: { min: 700, max: 1500 },
      frequency: 35,
      emitting: false,
    });
    embers.setDepth(1002 + y);
    const burst = once(() => {
      embers.explode(18);
      embers.start();
      for (const [u, v, tier] of SPIKE_LAYOUT)
        scene.time.delayedCall((u + 1) * SPIKE_SPREAD, () =>
          spikeBurst(
            scene,
            x + (ux * u - uy * v) * radius,
            y + (uy * u + ux * v) * radius * 0.6,
            tier,
          ),
        );
    });
    const settle = once(() => embers.stop());

    play(scene, SPIKES, [ground], lead + SPIKES_AFTER, (ms, put) => {
      const rel = ms - lead;

      put("uAge", rel * 0.001);

      if (rel >= 0) burst();
      if (rel >= 700) settle();
    });

    scene.time.delayedCall(lead + SPIKES_AFTER + 200, () => embers.destroy());
  },

  breath: (
    scene: Scene,
    x: number,
    y: number,
    direction: { x: number; y: number },
    length: number,
    duration: number,
    depth: number,
    onReach?: (reach: number, done: boolean) => void,
  ) => {
    const angle = Math.atan2(direction.y, direction.x);
    const seed = Math.random() * 10;
    const layers = [999, depth + 1].map((d, layer) => {
      const quad = acquire(scene, BREATH, x, y);
      quad.setOrigin(BREATH_MARGIN / BREATH.width, 0.5);
      quad.setRotation(angle);
      quad.setDepth(d);
      set(quad, "uSeed", seed);
      set(quad, "uLayer", layer);
      set(quad, "uLength", length);
      return quad;
    });

    play(scene, BREATH, layers, duration + BREATH_AFTER, (ms, put) => {
      const reach = cubic(ms / BREATH_TRAVEL);
      put("uOn", clamp(ms / BREATH_RISE) * (1 - clamp((ms - duration) / BREATH_OFF)));
      put("uReach", reach * 1.08);
      put("uBurnt", reach * 1.08);
      put("uAfter", Math.max(0, ms - duration) * 0.001);
      onReach?.(reach * 1.08 * length, ms >= duration + BREATH_OFF);
    });
  },

  meteors: (
    scene: Scene,
    target: { x: number; y: number },
    radius: number,
    count: number,
    onFall?: (impact: { x: number; y: number }) => void,
    onImpact?: (impact: { x: number; y: number }) => void,
  ) => {
    const ring = acquire(scene, SCORCH, target.x, target.y);
    ring.setDepth(999);
    set(ring, "uSeed", Math.random() * 10);
    set(ring, "uRadius", radius * SCORCH_REACH);

    const falls = Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius * METEOR_REACH;
      return {
        at: METEOR_LEAD + Math.random() * METEOR_SPREAD,
        x: target.x + Math.cos(a) * r,
        y: target.y + Math.sin(a) * r * 0.6,
      };
    });

    const last = Math.max(...falls.map((f) => f.at)) + METEOR_FALL;

    play(scene, SCORCH, [ring], last + 600 + SCORCH_FADE, (ms, put) => {
      put("uAppear", cubic(ms / SCORCH_APPEAR));
      put("uFade", clamp((ms - last - 600) / SCORCH_FADE));
    });

    for (const fall of falls) {
      scene.time.delayedCall(fall.at, () => {
        const impact = { x: fall.x, y: fall.y };
        onFall?.(impact);
        quads.meteor(scene, impact, onImpact);
      });
    }
  },

  crater: (scene: Scene, x: number, y: number, lead: number) => {
    const layers = stack(scene, CRATER, x, y, CRATER_GROUND, [999, 1000 + y]);
    const r = CRATER_RADIUS;

    const burst = once(() => fling(scene, x, y, r));

    play(scene, CRATER, layers, lead + CRATER_AFTER, (ms, put) => {
      const rel = ms - lead;

      put("uRadius", r);
      put("uCharge", rel < 0 ? cubic(ms / lead) : 1 - clamp(rel / 120));
      put("uFlash", rel < 0 ? 0 : clamp(rel / 40) * (1 - clamp((rel - 40) / 260)));
      put("uBurn", rel < 0 ? 0 : cubic(rel / 120) * (1 - clamp((rel - 450) / 700)));
      put("uDust", rel < 0 ? 0 : cubic(rel / 300));
      put("uCool", clamp((rel - 250) / 1300));
      put("uDrift", clamp((rel - 250) / 2700));
      put("uAge", Math.max(rel, 0) * 0.001);
      put("uFade", clamp((rel - 2300) / 900));

      if (rel >= 0) burst();
    });

  },

  meteor: (
    scene: Scene,
    impact: { x: number; y: number },
    onImpact?: (impact: { x: number; y: number }) => void,
  ) => {
    const from = { x: impact.x + METEOR_FROM.x, y: impact.y + METEOR_FROM.y };
    const dx = impact.x - from.x;
    const dy = impact.y - from.y;
    const length = Math.hypot(dx, dy);
    const ux = dx / length;
    const uy = dy / length;
    const hit = once(() => onImpact?.(impact));

    quads.crater(scene, impact.x, impact.y, METEOR_FALL);

    const plume = acquire(scene, PLUME, from.x, from.y);
    plume.setOrigin(PLUME_MARGIN / PLUME.width, 0.5);
    plume.setRotation(Math.atan2(dy, dx));
    plume.setDepth(2399);
    set(plume, "uSeed", Math.random() * 10);
    set(plume, "uLength", length);
    set(plume, "uFall", METEOR_FALL * 0.001);
    set(plume, "uLife", PLUME_LIFE * 0.001);
    set(plume, "uSize", METEOR_SIZE * METEOR_SCALE);

    play(scene, PLUME, [plume], METEOR_FALL + PLUME_LIFE + 100, (ms, put) => {
      put("uNow", ms * 0.001);
    });

    const quad = acquire(scene, METEOR, from.x, from.y);
    quad.setOrigin((METEOR.width - METEOR_NOSE) / METEOR.width, 0.5);
    quad.setRotation(Math.atan2(dy, dx));
    quad.setScale(METEOR_SCALE);
    quad.setDepth(2400);
    set(quad, "uSeed", Math.random() * 10);
    set(quad, "uSize", METEOR_SIZE);

    const shadow = scene.add.ellipse(impact.x, impact.y, 6, 3, 0x000000, 0.3);
    shadow.setDepth(999);

    const embers = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xffb050, 0xff7a20, 0xffd890],
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.045, end: 0.01 },
      speed: { min: 4, max: 18 },
      lifespan: { min: 250, max: 600 },
      blendMode: "ADD",
      emitting: false,
    });
    embers.setDepth(2401);

    const ash = scene.add.particles(0, 0, "particle_square", {
      tint: [0x1a1210, 0x2a1d18, 0x3a2a22],
      alpha: { start: 0.85, end: 0 },
      scale: { start: 0.05, end: 0.02 },
      rotate: { min: 0, max: 360 },
      speed: { min: 5, max: 20 },
      gravityY: 20,
      lifespan: { min: 500, max: 900 },
      emitting: false,
    });
    ash.setDepth(2399);

    play(scene, METEOR, [quad], METEOR_FALL + METEOR_FADE, (ms, put) => {
      const t = clamp(ms / METEOR_FALL);
      const e = t * t;
      const x = from.x + dx * e;
      const y = from.y + dy * e;

      quad.setPosition(x, y);
      put("uTravel", length * e);
      put("uHeat", cubic(t / 0.6));
      put("uGone", t >= 1 ? 1 : 0);
      put("uFade", clamp((ms - METEOR_FALL) / METEOR_FADE));

      if (shadow.scene) {
        shadow.setScale(1 + 1.5 * e);
        shadow.setAlpha(0.3 + 0.2 * e);
      }

      if (t >= 1) {
        hit();
        if (shadow.scene) shadow.destroy();
        return;
      }

      const tail = METEOR_SIZE * METEOR_SCALE;
      if (Math.random() < 0.7)
        embers.emitParticleAt(x - ux * tail * 1.5, y - uy * tail * 1.5, 1);
      if (t > 0.3 && Math.random() < 0.5)
        ash.emitParticleAt(x - ux * tail * 4, y - uy * tail * 4, 1);
    });

    scene.time.delayedCall(METEOR_FALL + 1000, () => {
      embers.destroy();
      ash.destroy();
    });
  },

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

  storm: (
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    lift: number,
    onImpact?: () => void,
  ) => {
    const layers = stack(scene, STORM, x, y, STORM_GROUND, [999, 2400]);
    const impact = once(onImpact);
    const lean = (Math.random() * 2 - 1) * radius;
    const total = lift + STORM_AFTER;

    const dust = scene.add.particles(x, y, "particle_square", {
      tint: [0x2d3644, 0x1a212d, 0x494570],
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.09, end: 0.03 },
      rotate: { min: 0, max: 360 },
      x: { min: -radius * 1.4, max: radius * 1.4 },
      y: { min: -radius * 0.7, max: radius * 0.7 },
      speedY: { min: -70, max: -25 },
      speedX: { min: -8, max: 8 },
      lifespan: { min: 300, max: 650 },
      frequency: 45,
    });
    dust.setDepth(2401);

    const debris = scene.add.particles(x, y, "particle_square", {
      tint: [0x0f1317, 0x201a43, 0x584d8d, 0x13171c, 0xcec1f4],
      alpha: { start: 1, end: 0.2 },
      scale: { start: 0.14, end: 0.03 },
      rotate: { min: 0, max: 360 },
      speed: { min: 50, max: 170 },
      angle: { min: 205, max: 335 },
      gravityY: 340,
      lifespan: { min: 300, max: 700 },
      emitting: false,
    });
    debris.setDepth(2401);

    const motes = scene.add.particles(x, y, "particle_circle", {
      tint: [0xada5f9, 0x5954d5, 0xf3d7fe],
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.05, end: 0.01 },
      x: { min: -radius * 1.6, max: radius * 1.6 },
      y: { min: -radius, max: radius * 0.8 },
      speedY: { min: -14, max: -3 },
      speedX: { min: -5, max: 5 },
      lifespan: { min: 600, max: 1400 },
      frequency: 140,
      emitting: false,
      blendMode: "ADD",
    });
    motes.setDepth(2401);

    let burst = false;

    play(scene, STORM, layers, total, (ms, put) => {
      const rel = ms - lift;

      put("uRadius", radius);
      put("uLean", lean);
      put("uLift", rel < 0 ? cubic(ms / (lift * 0.85)) : 1 - clamp(rel / 480));
      put("uLeader", rel < 0 ? clamp((ms - lift * 0.4) / (lift * 0.55)) : 1 - clamp(rel / 60));
      put("uDrop", clamp(rel / 35));
      put("uBolt", rel < 0 ? 0 : clamp(rel / 32) * (1 - clamp((rel - 120) / 220)));
      put("uFlash", rel < 24 ? 0 : clamp((rel - 24) / 36) * (1 - clamp((rel - 170) / 380)));
      put("uDisc", cubic((rel - 24) / 230));
      put("uSpread", cubic((rel - 20) / 110));
      put("uCrown", rel < 20 ? 0 : clamp((rel - 20) / 25) * (1 - clamp((rel - 110) / 190)));
      put("uScar", clamp((rel - 60) / 200));
      put("uGlow", rel < 0 ? 0 : 1 - clamp((rel - 700) / 1500));
      put("uFade", clamp((ms - total + 500) / 500));

      if (rel < 32) return;

      impact();

      if (!burst) {
        burst = true;
        dust.stop();
        debris.explode(Math.round(6 + radius * 0.3));
        motes.start();
      }

      if (rel > 1500) motes.stop();
    });

    scene.time.delayedCall(total + 1500, () => {
      dust.destroy();
      debris.destroy();
      motes.destroy();
    });
  },

  gale: (scene: Scene, x: number, y: number, radius: number, duration: number) => {
    const layers = stack(scene, GALE, x, y, GALE_GROUND, [999, 2400]);
    const total = duration + 500;

    play(scene, GALE, layers, total, (ms, put) => {
      put("uRadius", radius * (0.35 + 0.65 * cubic(ms / 320)));
      put("uWind", 1.5 * (1 - Math.exp(-ms / 520)) + ms * 0.0003);
      put("uGale", cubic(ms / 160) * (1 - clamp((ms - duration) / 500)));
    });
  },

  arc: (
    scene: Scene,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    const x = (from.x + to.x) * 0.5;
    const y = (from.y + to.y) * 0.5;

    const quad = acquire(scene, ARC, x, y);
    quad.setDepth(2400);
    set(quad, "uSeed", Math.random() * 10);
    set(quad, "uLayer", 2);
    set(quad, "uAx", from.x - quad.x);
    set(quad, "uAy", quad.y - from.y);
    set(quad, "uBx", to.x - quad.x);
    set(quad, "uBy", quad.y - to.y);

    play(scene, ARC, [quad], ARC_LIFE, (ms, put) => {
      put("uBolt", clamp(ms / 30) * (1 - clamp((ms - 90) / (ARC_LIFE - 90))));
    });
  },

  wellspring: (
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    onSurge?: () => void,
  ) => {
    const total = WELLSPRING_HOLD + WELLSPRING_FADE;
    const scale = (radius * 2.6) / WELLSPRING.width;

    const quad = acquire(scene, WELLSPRING, x, y);
    quad.setDepth(999);
    quad.setScale(Math.max(1, scale));
    set(quad, "uSeed", Math.random() * 10);
    set(quad, "uRadius", radius / Math.max(1, scale));

    const surge = once(onSurge);

    const glints = scene.add.particles(x, y, "particle_circle", {
      tint: [0x8fe6f2, 0xdcf7ff, 0x4fc3dc],
      blendMode: "ADD",
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.05, end: 0.01 },
      speedY: { min: -26, max: -8 },
      lifespan: { min: 350, max: 800 },
      emitting: false,
    });
    glints.setDepth(1000 + y + radius);

    play(scene, WELLSPRING, [quad], total, (ms, put) => {
      const spread = cubic(ms / WELLSPRING_RISE);

      put("uSpread", 0.12 + 0.88 * spread);
      put("uFlash", 1 - clamp((ms - 120) / 700));
      put("uFade", clamp((ms - WELLSPRING_HOLD) / WELLSPRING_FADE));

      if (ms >= WELLSPRING_HIT) surge();

      if (ms < WELLSPRING_HOLD && Math.random() < 0.35) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * radius * spread * 0.85;
        glints.emitParticleAt(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, 1);
      }
    });

    scene.time.delayedCall(total + 900, () => glints.destroy());
  },

  swell: (
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    duration: number,
    onFront?: (front: number, inner: number, done: boolean) => void,
  ): ((tx: number, ty: number) => void) => {
    const total = SWELL_CHARGE + duration + SWELL_SOAK;
    const scale = Math.max(1, radius / SWELL_REACH);
    const layers = stack(scene, SWELL, x, y, SWELL_GROUND, [999, 2400]);
    for (const quad of layers) quad.setScale(scale);

    const drops = scene.add.particles(x, y, "particle_circle", {
      tint: [0xdcf7ff, 0x8fdcf5, 0x4fa8ea],
      blendMode: "ADD",
      alpha: { start: 0.85, end: 0 },
      scale: { start: 0.07, end: 0.02 },
      x: { min: -radius * 0.25, max: radius * 0.25 },
      y: { min: -radius * 0.15, max: radius * 0.15 },
      speed: { min: 40, max: 150 },
      angle: { min: 200, max: 340 },
      gravityY: 300,
      lifespan: { min: 320, max: 700 },
      emitting: false,
    });
    drops.setDepth(2401);

    const spray = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xdcf7ff, 0x8fdcf5, 0x4fa8ea],
      blendMode: "ADD",
      alpha: { start: 0.75, end: 0 },
      scale: { start: 0.06, end: 0.02 },
      gravityY: 260,
      lifespan: { min: 240, max: 480 },
      emitting: false,
    });
    spray.setDepth(2401);

    const foam = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xffffff, 0xdcf7ff, 0xb4e6f7],
      blendMode: "ADD",
      alpha: { start: 0.75, end: 0 },
      scale: { start: 0.11, end: 0.03 },
      lifespan: { min: 700, max: 1700 },
      emitting: false,
    });
    foam.setDepth(999.5);

    const motes = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xdcf7ff, 0x8fdcf5, 0x4fa8ea],
      blendMode: "ADD",
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.08, end: 0.02 },
      speedY: { min: -16, max: -4 },
      speedX: { min: -5, max: 5 },
      lifespan: { min: 800, max: 1700 },
      emitting: false,
    });
    motes.setDepth(2401);

    const splashes = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xffffff, 0xdcf7ff, 0x8fdcf5],
      blendMode: "ADD",
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.14, end: 0.04 },
      gravityY: 320,
      lifespan: { min: 300, max: 620 },
      emitting: false,
    });
    splashes.setDepth(2401);

    const ripples = scene.add.particles(0, 0, "particle_ring", {
      tint: [0xdcf7ff, 0x8fdcf5],
      blendMode: "ADD",
      alpha: { start: 0.5, end: 0 },
      scale: { start: 0.15, end: 0.7 },
      lifespan: 420,
      emitting: false,
    });
    ripples.setDepth(999.5);

    const glide = duration + SWELL_SETTLE;
    const span = SWELL_DRIFT - SWELL_START;
    const slowing =
      Math.log(1 - (1 - SWELL_START) / span) / Math.log(1 - duration / glide);

    let burst = false;

    play(scene, SWELL, layers, total, (ms, put) => {
      const rel = ms - SWELL_CHARGE;
      const spread =
        rel < 0 ? 0 : SWELL_START + span * (1 - Math.pow(1 - clamp(rel / glide), slowing));
      const hollow = clamp((rel - 120) / 260);
      const fade = clamp((rel - duration * 0.55) / (glide - duration * 0.55));

      put("uRadius", radius / scale);
      put("uCharge", rel < 0 ? cubic(ms / SWELL_CHARGE) : 1 - clamp(rel / 120));
      put("uBurst", cubic(rel / 260));
      put("uDome", rel < 0 ? 0 : 1 - clamp((rel - 110) / 300));
      put("uFlash", rel < 0 ? 0 : clamp(rel / 40) * (1 - clamp((rel - 60) / 420)));
      put("uSpread", spread);
      put("uHollow", hollow * hollow * (3 - 2 * hollow));
      put("uFade", fade);
      put("uSoak", clamp((rel - glide * 0.8) / (SWELL_SOAK - glide * 0.8)));

      if (rel < 0) return;

      const front = radius * spread;
      onFront?.(front, Math.max(0, front - radius * 0.58) * hollow, rel >= duration);

      if (!burst) {
        burst = true;
        drops.explode(Math.round(8 + radius * 0.08));
      }

      if (hollow > 0.3 && fade < 0.6 && Math.random() < 0.55) {
        const a = Math.random() * Math.PI * 2;
        const p = spray.emitParticleAt(
          x + Math.cos(a) * front * 0.9,
          y + Math.sin(a) * front * 0.54,
          1,
        );

        if (p) {
          p.velocityX = Math.cos(a) * 55;
          p.velocityY = Math.sin(a) * 33 - 50 - Math.random() * 50;
        }
      }

      if (hollow > 0.3 && fade < 0.85 && Math.random() < 0.9 - fade * 0.6) {
        const a = Math.random() * Math.PI * 2;
        const d = front * (0.62 + Math.random() * 0.34);
        const p = foam.emitParticleAt(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, 1);

        if (p) {
          const drift = 8 + Math.random() * 16;
          p.velocityX = Math.cos(a) * drift;
          p.velocityY = Math.sin(a) * drift * 0.6;
        }
      }

      if (fade > 0.25 && rel < glide + 900 && Math.random() < 0.22) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * front * 0.95;
        motes.emitParticleAt(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, 1);
      }
    });

    scene.time.delayedCall(total + 900, () => {
      drops.destroy();
      spray.destroy();
      foam.destroy();
      motes.destroy();
      ripples.destroy();
      splashes.destroy();
    });

    return (tx: number, ty: number) => {
      if (!splashes.scene) return;

      const dx = tx - x;
      const dy = ty - y;
      const length = Math.hypot(dx, dy) || 1;

      ripples.emitParticleAt(tx, ty + 6, 1);

      for (let i = 0; i < 12; i++) {
        const p = splashes.emitParticleAt(
          tx + (Math.random() - 0.5) * 12,
          ty + (Math.random() - 0.5) * 6,
          1,
        );
        if (!p) continue;

        const push = 20 + Math.random() * 60;
        p.velocityX = (dx / length) * push + (Math.random() - 0.5) * 70;
        p.velocityY = (dy / length) * push * 0.6 - 70 - Math.random() * 90;
      }

      for (let i = 0; i < 4; i++) {
        const p = foam.emitParticleAt(
          tx + (Math.random() - 0.5) * 22,
          ty + 4 + (Math.random() - 0.5) * 10,
          1,
        );
        if (!p) continue;

        p.velocityX = (dx / length) * 14 + (Math.random() - 0.5) * 16;
        p.velocityY = (dy / length) * 8 + (Math.random() - 0.5) * 8;
      }
    };
  },

  tide: (
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    duration: number,
    follow?: Entity,
  ) => {
    const total = duration + 320;
    const offset = follow ? y - follow.y : 0;

    const track = () => {
      if (!quad.scene || !follow?.active) return;
      quad.setPosition(follow.x, follow.y + offset);
      quad.setDepth(follow.depth + offset + 20);
    };

    const quad = acquire(scene, TIDE, x, y);
    quad.setOrigin(0.5, 1 - TIDE_GROUND / TIDE.height);
    quad.setDepth(1000 + y + 20);
    set(quad, "uSeed", Math.random() * 10);
    set(quad, "uGround", TIDE_GROUND);
    if (follow) scene.events.on("postupdate", track);

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
      },
      onComplete: () => {
        scene.events.off("postupdate", track);
        quad.setOrigin(0.5, 0.5);
        release(scene, TIDE, quad);
      },
    });
  },

  ward: (entity: Entity): (() => void) => {
    const scene = entity.scene;
    const scale = entity.displayHeight / 32;
    const quad = acquire(scene, WARD, entity.x, entity.y);
    quad.setScale(scale);
    set(quad, "uSeed", Math.random() * 10);
    set(quad, "uRadius", WARD_RADIUS);

    const start = scene.time.now;
    let broke = -1;

    const follow = () => {
      if (!quad.scene) return scene.events.off("postupdate", follow);

      const ms = scene.time.now - start;
      quad.setPosition(entity.x, entity.y - 2 * scale);
      quad.setDepth(entity.depth + 1);
      set(quad, "uTime", ms * 0.001);
      set(quad, "uAppear", cubic((ms - WARD_DELAY) / WARD_APPEAR));

      if (broke < 0) return;

      const t = (ms - broke) / WARD_BREAK;
      set(quad, "uBreak", clamp(t));
      if (t >= 1) done();
    };

    const done = () => {
      scene.events.off("postupdate", follow);
      quad.setScale(1);
      release(scene, WARD, quad);
    };

    scene.events.on("postupdate", follow);
    follow();

    return () => {
      if (broke >= 0) return;
      if (!entity.active || !scene.sys.isActive()) return done();
      broke = scene.time.now - start;
    };
  },
};
