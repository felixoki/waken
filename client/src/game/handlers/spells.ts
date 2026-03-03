import { SpellConfig, SpellName } from "@server/types";
import { Entity } from "../Entity";
import { Projectile } from "../Projectile";
import { Hitbox } from "../Hitbox";
import { effects } from "../effects";

type SpellHandler = (
  entity: Entity,
  config: SpellConfig,
  target: { x: number; y: number },
  direction: { x: number; y: number },
) => void;

export const spells: Record<SpellName, SpellHandler> = {
  [SpellName.SHARD]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    direction: { x: number; y: number },
  ) => {
    const projectile = new Projectile(
      entity.scene,
      entity.x + direction.x * 16,
      entity.y + direction.y * 16,
      entity.id,
      direction,
      config,
    );

    const emitter = effects.emitters.shard(
      entity.scene,
      projectile.x,
      projectile.y,
    );
    projectile.setEmitter(emitter);
  },

  [SpellName.SLASH]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    direction: { x: number; y: number },
  ) => {
    new Hitbox(
      entity.scene,
      entity.x + direction.x * 20,
      entity.y + direction.y * 20,
      config.hitbox!.width,
      config.hitbox!.height,
      entity.id,
      config,
    );

    effects.emitters.slash(entity.scene, entity, direction);
  },

  [SpellName.ILLUMINATE]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    effects.shaders.illuminate(entity.scene, config.duration!);
  },

  [SpellName.HURT_SHADOWS]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    direction: { x: number; y: number },
  ) => {
    new Hitbox(
      entity.scene,
      target.x,
      target.y,
      config.hitbox!.width,
      config.hitbox!.height,
      entity.id,
      config,
    );

    effects.emitters.claw(
      entity.scene,
      target.x,
      target.y,
      { width: config.hitbox!.width, height: config.hitbox!.height },
      direction,
    );
  },

  [SpellName.METEOR_SHOWER]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    const count = 6;
    const radius = config.radius!;
    let isShaking = false;

    for (let i = 0; i < count; i++) {
      const delay = Phaser.Math.Between(0, 1500);
      const impact = {
        x: target.x + Phaser.Math.Between(-radius, radius),
        y: target.y + Phaser.Math.Between(-radius, radius),
      };

      entity.scene.time.delayedCall(delay, () => {
        effects.emitters.fall(entity.scene, impact, () => {
          if (!isShaking) {
            isShaking = true;
            entity.scene.cameras.main.shake(2000, 0.0004);
          }

          new Hitbox(
            entity.scene,
            impact.x,
            impact.y,
            config.hitbox!.width,
            config.hitbox!.height,
            entity.id,
            config,
          );

          effects.emitters.impact(entity.scene, impact);
        });
      });
    }
  },
};
