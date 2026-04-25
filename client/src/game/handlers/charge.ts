import { SpellConfig } from "@server/types";
import { Entity } from "../Entity";
import { handlers } from ".";

interface ChargeState {
  startTime: number;
  config: SpellConfig;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  emberEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  spawnZone: Phaser.Geom.Circle;
  direction: { x: number; y: number };
  entity: Entity;
  active: boolean;
  updateListener: () => void;
}

const charges = new Map<string, ChargeState>();

function getChargePercent(state: ChargeState): number {
  const elapsed = state.entity.scene.time.now - state.startTime;
  const { min, max, duration } = state.config.charge!;
  const t = Math.min(elapsed / duration, 1);

  return min + t * (max - min);
}

function getScaledConfig(config: SpellConfig, percent: number): SpellConfig {
  return {
    ...config,
    chargePercent: percent,
    damage: {
      ...config.damage,
      amount: Math.round(config.damage.amount * percent),
    },
    knockback: Math.round(config.knockback * percent),
    speed: config.speed
      ? Math.max(
          Math.round(config.speed * 0.5),
          Math.round(config.speed * percent),
        )
      : config.speed,
    range: config.range ? Math.round(config.range * percent) : config.range,
    hitbox: config.hitbox
      ? {
          width: Math.round(config.hitbox.width * (0.6 + percent * 0.4)),
          height: Math.round(config.hitbox.height * (0.6 + percent * 0.4)),
        }
      : config.hitbox,
  };
}

function updateCharge(state: ChargeState): void {
  const { entity, emitter, emberEmitter, spawnZone } = state;
  const target = entity.target || { x: entity.x + 1, y: entity.y };

  state.direction = handlers.direction.getDirectionToPoint(entity, target);

  const percent = getChargePercent(state);
  const angle = Math.atan2(state.direction.y, state.direction.x);
  const tipDistance = 14 + percent * 8;

  const tipX = entity.x + Math.cos(angle) * tipDistance;
  const tipY = entity.y + Math.sin(angle) * tipDistance;

  emitter.setPosition(tipX, tipY);
  emberEmitter.setPosition(tipX, tipY);
  spawnZone.setTo(0, 0, 4 + 46 * (1 - percent));
  emitter.quantity = Math.round(3 + percent * 6);
}

export const charge = {
  start: (entity: Entity, config: SpellConfig): void => {
    const tipX = entity.x + 14;
    const tipY = entity.y;
    const spawnZone = new Phaser.Geom.Circle(0, 0, 50);

    const emitter = entity.scene.add.particles(tipX, tipY, "particle_circle", {
      tint: [0x00ccff, 0x44ddff, 0xaaffff],
      alpha: { start: 0.4, end: 0.9 },
      scale: { start: 0.28, end: 0.09 },
      lifespan: 300,
      frequency: 40,
      quantity: 3,
      blendMode: "ADD",
      moveToX: 0,
      moveToY: 0,
    });

    emitter.addEmitZone({
      type: "random",
      source: spawnZone,
    } as Phaser.Types.GameObjects.Particles.ParticleEmitterRandomZoneConfig);

    emitter.setDepth(2000);

    const emberEmitter = entity.scene.add.particles(
      tipX,
      tipY,
      "particle_circle",
      {
        tint: [0x00ccff, 0x88ddff, 0xaaffff],
        alpha: { start: 0.6, end: 0 },
        scale: { start: 0.1, end: 0.02 },
        speed: { min: 1, max: 6 },
        lifespan: 900,
        frequency: 40,
        quantity: 2,
        blendMode: "ADD",
      },
    );

    emberEmitter.addEmitZone({
      type: "random",
      source: spawnZone,
    } as Phaser.Types.GameObjects.Particles.ParticleEmitterRandomZoneConfig);

    emberEmitter.setDepth(2001);

    const updateListener = () => {
      const s = charges.get(entity.id);
      if (s?.active) updateCharge(s);
    };

    const state: ChargeState = {
      startTime: entity.scene.time.now,
      config,
      emitter,
      emberEmitter,
      spawnZone,
      direction: { x: 1, y: 0 },
      entity,
      active: true,
      updateListener,
    };

    charges.set(entity.id, state);
    entity.scene.events.on("update", updateListener);
  },

  release: (entity: Entity): SpellConfig | null => {
    const state = charges.get(entity.id);
    if (!state) return null;

    const percent = getChargePercent(state);
    const scaled = getScaledConfig(state.config, percent);

    charge.cleanup(entity);

    return scaled;
  },

  cleanup: (entity: Entity): void => {
    const state = charges.get(entity.id);
    if (!state) return;

    state.active = false;
    entity.scene.events.off("update", state.updateListener);
    state.emitter.stop();
    state.emberEmitter.stop();
    entity.scene.time.delayedCall(400, () => {
      state.emitter.destroy();
      state.emberEmitter.destroy();
    });

    charges.delete(entity.id);
  },

  isCharging: (entityId: string): boolean => {
    return charges.has(entityId);
  },
};
