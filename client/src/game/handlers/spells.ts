import {
  ComponentName,
  Direction,
  SpellConfig,
  SpellName,
  SoundName,
  EffectName,
} from "@server/types";
import { Entity } from "../Entity";
import { Projectile } from "../Projectile";
import { Hitbox } from "../Hitbox";
import { vfx } from "../vfx";
import { EffectFactory } from "../factory/Effect";
import { DELAY_ATTACK } from "@server/globals";

const FIRE_BREATH_MOUTH: Record<Direction, { x: number; y: number }> = {
  [Direction.DOWN]: { x: 0, y: 20 },
  [Direction.UP]: { x: 0, y: -8 },
  [Direction.LEFT]: { x: -50, y: -12 },
  [Direction.RIGHT]: { x: 50, y: -12 },
};

type SpellHandler = (
  entity: Entity,
  config: SpellConfig,
  target: { x: number; y: number },
  direction: { x: number; y: number },
  step?: number,
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

    entity.scene.managers.sound.play.sfx(SoundName.SHARD_LAUNCH, {
      position: { x: projectile.x, y: projectile.y },
    });

    const { main, embers } = vfx.emitters.shard(
      entity.scene,
      projectile.x,
      projectile.y,
      config.chargePercent,
    );
    projectile.setEmitter(main);
    projectile.setEmitter(embers);
  },

  [SpellName.SLASH]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    direction: { x: number; y: number },
    step: number = 0,
  ) => {
    const offset =
      step > 0 && config.combo ? config.combo[step - 1].offset : 20;

    new Hitbox(
      entity.scene,
      entity.x + direction.x * offset,
      entity.y + direction.y * offset,
      config.hitbox!.width,
      config.hitbox!.height,
      entity.id,
      config,
    );

    const emitters: Record<number, () => void> = {
      0: () => vfx.emitters.slash(entity.scene, entity, direction),
      1: () => vfx.emitters.backslash(entity.scene, entity, direction),
      2: () => vfx.emitters.stab(entity.scene, entity, direction),
    };

    emitters[step]?.();
  },

  [SpellName.ILLUMINATE]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    vfx.shaders.illuminate(entity.scene, config.duration!);
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

    vfx.emitters.claw(
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
        vfx.emitters.fall(entity.scene, impact, () => {
          if (!entity.scene) return;

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

          vfx.emitters.impact(entity.scene, impact);
        });
      });
    }
  },

  [SpellName.BUTTERFLY_EFFIGY]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    const count = 12;
    const radius = config.radius! * 2;
    const scene = entity.scene;

    for (let i = 0; i < count; i++) {
      const delay = i * 80;

      scene.time.delayedCall(delay, () => {
        if (!scene.sys) return;

        const dest = {
          x: target.x + Phaser.Math.Between(-radius, radius),
          y: target.y + Phaser.Math.Between(-radius, radius),
        };

        const flightDuration = Phaser.Math.Between(800, 1200);
        const amplitude = Phaser.Math.Between(12, 28);
        const freq = Phaser.Math.Between(3, 6);
        const startX = entity.x;
        const startY = entity.y;
        const angle = Math.atan2(dest.y - startY, dest.x - startX);
        const perpAngle = angle + Math.PI / 2;

        const hitbox = new Hitbox(
          scene,
          startX,
          startY,
          config.hitbox!.width,
          config.hitbox!.height,
          entity.id,
          { ...config, duration: flightDuration + 500 },
        );

        const emitter = vfx.emitters.butterfly(scene, startX, startY);
        emitter.setPosition(0, 0);
        emitter.startFollow(hitbox);

        const progress = { value: 0 };

        scene.tweens.add({
          targets: progress,
          value: 1,
          duration: flightDuration,
          ease: "Sine.easeInOut",
          onUpdate: () => {
            const t = progress.value;
            const baseX = startX + (dest.x - startX) * t;
            const baseY = startY + (dest.y - startY) * t;
            const flutter =
              Math.sin(t * Math.PI * freq) * amplitude * (1 - t * 0.3);

            hitbox.setPosition(
              baseX + Math.cos(perpAngle) * flutter,
              baseY + Math.sin(perpAngle) * flutter,
            );
          },
          onComplete: () => {
            emitter.stop();
            scene.time.delayedCall(800, () => emitter.destroy());
          },
        });
      });
    }
  },

  [SpellName.LIGHTNING_STRIKE]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    const scene = entity.scene;
    const source = {
      x: target.x + Phaser.Math.Between(-40, 40),
      y: target.y - 350,
    };

    vfx.emitters.lightning(scene, source, target);

    scene.cameras.main.shake(200, 0.003);
    scene.cameras.main.flash(100, 200, 200, 255);

    new Hitbox(
      scene,
      target.x,
      target.y,
      config.hitbox!.width,
      config.hitbox!.height,
      entity.id,
      config,
    );
  },

  [SpellName.GRASP]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    const scene = entity.scene;

    vfx.emitters.grasp(scene, { x: entity.x, y: entity.y }, target, () => {
      new Hitbox(
        scene,
        target.x,
        target.y,
        config.hitbox!.width,
        config.hitbox!.height,
        entity.id,
        config,
      );
    });
  },

  [SpellName.ABSORB_LIFE]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    const scene = entity.scene;
    const radius = config.radius!;
    const radiusSq = radius * radius;

    new Hitbox(
      scene,
      target.x,
      target.y,
      config.hitbox!.width,
      config.hitbox!.height,
      entity.id,
      config,
    );

    const stream = (victim: Entity) => {
      if (victim.id === entity.id) return;
      if (!victim.hasComponent(ComponentName.DAMAGEABLE)) return;

      const dx = victim.x - target.x;
      const dy = victim.y - target.y;
      if (dx * dx + dy * dy > radiusSq) return;

      vfx.emitters.absorb(victim, entity);
    };

    scene.managers.entities.entities.forEach(stream);
    scene.managers.players.others.forEach(stream);
  },

  [SpellName.DRAGON_FORM]: (entity: Entity) => {
    entity.addEffect(EffectFactory.create(EffectName.DRAGON, entity));
  },

  [SpellName.FIRE_BREATH]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    direction: { x: number; y: number },
  ) => {
    const reach = config.hitbox!.width;
    const girth = config.hitbox!.height;
    const horizontal = direction.x !== 0;

    const w = horizontal ? reach : girth;
    const h = horizontal ? girth : reach;

    const startFrame = 10;
    const frameRate = config.animation?.frameRate ?? 12;
    const delay = Math.max(0, (startFrame / frameRate) * 1000 - DELAY_ATTACK);

    entity.scene.time.delayedCall(delay, () => {
      if (!entity.scene) return;

      new Hitbox(
        entity.scene,
        entity.x + direction.x * (reach / 2 + 12),
        entity.y + direction.y * (reach / 2 + 12),
        w,
        h,
        entity.id,
        config,
      );

      const mouth = FIRE_BREATH_MOUTH[entity.facing];

      const depth =
        entity.facing === Direction.DOWN ? entity.depth : entity.depth - 10;

      vfx.emitters.fireBreath(
        entity.scene,
        entity.x + mouth.x,
        entity.y + mouth.y,
        direction,
        reach,
        600,
        depth,
      );
    });
  },

  [SpellName.BITE]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    direction: { x: number; y: number },
  ) => {
    const reach = config.hitbox!.width;

    const bx = entity.x + direction.x * (reach * 0.5 + 8);
    const by = entity.y + direction.y * (reach * 0.5 + 8);

    const biteFrame = 8;
    const chompMs = 120;
    const frameRate = config.animation?.frameRate ?? 14;
    const impactMs = (biteFrame / frameRate) * 1000;
    const spawnDelay = Math.max(0, impactMs - chompMs - DELAY_ATTACK);
    const hitDelay = Math.max(0, impactMs - DELAY_ATTACK);

    const depth = entity.depth + 4;

    entity.scene.time.delayedCall(spawnDelay, () => {
      if (!entity.scene) return;
      vfx.emitters.bite(entity.scene, bx, by, reach, depth);
    });

    entity.scene.time.delayedCall(hitDelay, () => {
      if (!entity.scene) return;
      new Hitbox(
        entity.scene,
        bx,
        by,
        config.hitbox!.width,
        config.hitbox!.height,
        entity.id,
        config,
      );
    });
  },
};
