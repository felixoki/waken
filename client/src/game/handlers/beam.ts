import { SpellConfig } from "@server/types";
import { Event } from "@server/types";
import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";
import { BeamPipeline } from "../pipelines/Beam";
import { handlers } from ".";

const IGNITION_MS = 130;
const THICKNESS = 26;

interface BeamState {
  config: SpellConfig;
  entity: Entity;
  beam: Phaser.GameObjects.Rectangle;
  pipeline: BeamPipeline;
  ember: Phaser.GameObjects.Particles.ParticleEmitter;
  spark: Phaser.GameObjects.Particles.ParticleEmitter;
  updateListener: () => void;
  startTime: number;
  lastTick: number;
  tipX: number;
  tipY: number;
}

const beams = new Map<string, BeamState>();

function updateBeam(state: BeamState): void {
  const { entity, config, beam, pipeline, ember, spark } = state;
  const channel = config.channel!;
  const scene = entity.scene;
  const now = scene.time.now;

  const target = entity.target || { x: entity.x + 1, y: entity.y };
  const dir = handlers.direction.getDirectionToPoint(entity, target);
  const angle = Math.atan2(dir.y, dir.x);

  const ignite = Math.min((now - state.startTime) / IGNITION_MS, 1);
  const ease = 1 - Math.pow(1 - ignite, 3);
  const len = channel.range * ease;

  beam.setPosition(entity.x, entity.y);
  beam.setRotation(angle);
  beam.scaleX = ease;
  pipeline.uTime = now * 0.001;

  const tx = entity.x + dir.x * len;
  const ty = entity.y + dir.y * len;

  const cam = scene.cameras.main;
  const zoom = cam.zoom;

  pipeline.startX = (entity.x - cam.worldView.x) * zoom;
  pipeline.startY = (entity.y - cam.worldView.y) * zoom;
  pipeline.endX = (tx - cam.worldView.x) * zoom;
  pipeline.endY = (ty - cam.worldView.y) * zoom;
  pipeline.thickness = THICKNESS * zoom;

  state.tipX = tx;
  state.tipY = ty;

  if (ease > 0.4) {
    /** sparse embers drifting off the beam body */
    if (Math.random() < 0.4) {
      const t = Math.random() * len;
      const perp = (Math.random() - 0.5) * THICKNESS;
      ember.emitParticleAt(
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

  if (now - state.lastTick < channel.tick) return;

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

    const rect = scene.add.rectangle(
      entity.x,
      entity.y,
      channel.range,
      THICKNESS,
      0xffffff,
    );
    rect.setOrigin(0, 0.5);
    rect.setDepth(2500);
    rect.setPostPipeline(BeamPipeline);
    rect.postFX.addBloom(0xffffff, 1, 1, 1, 1.5, 6);

    let pipeline = rect.getPostPipeline(BeamPipeline) as
      | BeamPipeline
      | BeamPipeline[];
    if (Array.isArray(pipeline)) pipeline = pipeline[0];
    pipeline.seed = Math.random() * 10;

    const ember = scene.add.particles(0, 0, "particle_square", {
      tint: [0xffe08a, 0xff9a3c, 0xff5a2a],
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.1, end: 0.01 },
      speed: { min: 1, max: 6 },
      gravityY: -22,
      lifespan: { min: 1800, max: 3400 },
      blendMode: "ADD",
      emitting: false,
    });
    ember.setDepth(2504);

    const spark = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xffffff, 0xffd090],
      alpha: { start: 0.9, end: 0 },
      scale: { start: 0.14, end: 0.02 },
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
      beam: rect,
      pipeline,
      ember,
      spark,
      updateListener,
      startTime: scene.time.now,
      lastTick: 0,
      tipX: entity.x,
      tipY: entity.y,
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

    const { beam: rect, ember, spark } = state;

    spark.emitParticleAt(state.tipX, state.tipY, 14);
    ember.emitParticleAt(state.tipX, state.tipY, 6);
    ember.stop();
    spark.stop();

    scene.tweens.add({
      targets: [rect],
      alpha: 0,
      duration: 120,
      ease: "Quad.easeOut",
      onComplete: () => {
        rect.destroy();
      },
    });

    scene.time.delayedCall(1000, () => {
      ember.destroy();
      spark.destroy();
    });
  },
};
