import { SpellConfig } from "@server/types";
import { Event } from "@server/types";
import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";
import { vfx } from "../vfx";
import { handlers } from ".";

const CHARGE_MS = 180;
const IGNITION_MS = 130;
const THICKNESS = 60;

interface BeamState {
  config: SpellConfig;
  entity: Entity;
  beam: ReturnType<typeof vfx.quads.hyperbeam>;
  chip: Phaser.GameObjects.Particles.ParticleEmitter;
  spark: Phaser.GameObjects.Particles.ParticleEmitter;
  updateListener: () => void;
  startTime: number;
  lastTick: number;
  tipX: number;
  tipY: number;
  fling: { x: number; y: number };
}

const beams = new Map<string, BeamState>();

function updateBeam(state: BeamState): void {
  const { entity, config, beam, chip, spark } = state;
  const channel = config.channel!;
  const scene = entity.scene;
  const now = scene.time.now;

  const target = entity.target || { x: entity.x + 1, y: entity.y };
  const dir = handlers.direction.getDirectionToPoint(entity, target);
  const angle = Math.atan2(dir.y, dir.x);

  const ignite = Math.min(Math.max(now - state.startTime - CHARGE_MS, 0) / IGNITION_MS, 1);
  const ease = 1 - Math.pow(1 - ignite, 3);
  const len = channel.range * ease;

  beam.aim(entity.x, entity.y, angle, ease);

  const tx = entity.x + dir.x * len;
  const ty = entity.y + dir.y * len;

  state.tipX = tx;
  state.tipY = ty;

  if (ignite === 0 && Math.random() < 0.5)
    spark.emitParticleAt(entity.x + dir.x * 4, entity.y + dir.y * 4, 1);

  if (ease > 0.4) {
    if (Math.random() < 0.55) {
      const t = (0.1 + Math.random() * 0.85) * len;
      const side = Math.random() < 0.5 ? -1 : 1;
      const perp = side * THICKNESS * (0.3 + Math.random() * 0.15);
      const push = 50 + Math.random() * 90;
      const out = side * (8 + Math.random() * 26);
      state.fling.x = dir.x * push - dir.y * out;
      state.fling.y = dir.y * push + dir.x * out;
      chip.emitParticleAt(
        entity.x + dir.x * t - dir.y * perp,
        entity.y + dir.y * t + dir.x * perp,
        1,
      );
    }

    if (Math.random() < 0.35) {
      const t = Math.random() * len;
      spark.emitParticleAt(entity.x + dir.x * t, entity.y + dir.y * t, 1);
    }

    if (Math.random() < 0.5) spark.emitParticleAt(tx, ty, 1);
  }

  if (ignite < 0.5 || now - state.lastTick < channel.tick) return;

  state.lastTick = now;

  const player = scene.managers.players.get(entity.id);

  if (player?.isControllable) {
    scene.game.events.emit(Event.PLAYER_CAST, { name: config.name });
    player.mana = Math.max(player.mana - config.mana, 0);
    scene.managers.camera.shake(70, 0.0003);
  }

  const seg = channel.range / channel.segments;

  for (let i = 1; i <= channel.segments; i++) {
    const d = i * seg;

    new Hitbox(
      scene,
      entity.x + dir.x * d,
      entity.y + dir.y * d,
      config.hitbox!.width,
      config.hitbox!.height,
      entity.id,
      { ...config, duration: channel.tick },
    );
  }
}

export const beam = {
  start: (entity: Entity, config: SpellConfig): void => {
    const channel = config.channel!;
    const scene = entity.scene;

    const quad = vfx.quads.hyperbeam(scene, channel.range, 2500);

    const fling = { x: 0, y: 0 };
    const chip = scene.add.particles(0, 0, "particle_square", {
      tint: [0x070d10, 0x0b171a, 0x12282b],
      alpha: { start: 0.85, end: 0 },
      scale: { start: 0.12, end: 0.04 },
      speedX: { onEmit: () => fling.x },
      speedY: { onEmit: () => fling.y },
      rotate: { min: 0, max: 360 },
      lifespan: { min: 260, max: 620 },
      emitting: false,
    });
    chip.setDepth(2504);

    const spark = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xb8fff0, 0x5fe0d0],
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.08, end: 0.01 },
      speed: { min: 10, max: 40 },
      lifespan: 200,
      blendMode: "ADD",
      emitting: false,
    });
    spark.setDepth(2504);

    const updateListener = () => {
      const state = beams.get(entity.id);
      if (state) updateBeam(state);
    };

    beams.set(entity.id, {
      config,
      entity,
      beam: quad,
      chip,
      spark,
      updateListener,
      startTime: scene.time.now,
      lastTick: 0,
      tipX: entity.x,
      tipY: entity.y,
      fling,
    });

    const player = scene.managers.players.get(entity.id);
    if (player?.isControllable) scene.managers.camera.shake(120, 0.0009);

    scene.events.on("update", updateListener);
  },

  stop: (entity: Entity): void => {
    const state = beams.get(entity.id);
    if (!state) return;

    const scene = entity.scene;
    scene.events.off("update", state.updateListener);
    beams.delete(entity.id);

    const { beam: quad, chip, spark } = state;

    spark.emitParticleAt(state.tipX, state.tipY, 14);
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      const push = 20 + Math.random() * 50;
      state.fling.x = Math.cos(a) * push;
      state.fling.y = Math.sin(a) * push;
      chip.emitParticleAt(state.tipX, state.tipY, 1);
    }
    chip.stop();
    spark.stop();

    quad.stop();

    scene.time.delayedCall(1000, () => {
      chip.destroy();
      spark.destroy();
    });
  },
};
