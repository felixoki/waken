import {
  Direction,
  SpellConfig,
  SpellName,
  SoundName,
  EffectName,
} from "@server/types";
import { Entity } from "../Entity";
import type { Player } from "../Player";
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

const burst = (entity: Entity, config: SpellConfig, x: number, y: number) => {
  const scene = entity.scene;
  if (!scene.sys) return;

  const radius = config.radius!;
  const hitbox = new Hitbox(
    scene,
    x,
    y,
    radius * 2,
    radius * 2,
    entity.id,
    { ...config, duration: 150 },
  );
  hitbox.body.setCircle(radius);

  if ((entity as Player).isControllable) scene.managers.camera.shake(160, 0.0016);
};

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

  [SpellName.CATCH_SOUL]: (
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

    const { main, embers } = vfx.emitters.leaf(
      entity.scene,
      projectile.x,
      projectile.y,
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
    const flurry = config.flurry;

    if (step === 3 && flurry) {
      const scene = entity.scene;

      for (let i = 0; i < flurry.hits; i++)
        scene.time.delayedCall(i * flurry.interval, () => {
          if (!entity.scene) return;

          new Hitbox(
            scene,
            entity.x + direction.x * flurry.offset,
            entity.y + direction.y * flurry.offset,
            config.hitbox!.width,
            config.hitbox!.height,
            entity.id,
            config,
          );

          scene.managers.sound.play.sfx(SoundName.SLASH, {
            position: { x: entity.x, y: entity.y },
            rate: 1.5 + i * 0.06,
            volume: 0.5,
          });

          vfx.emitters.flurry(scene, entity, direction, i);
        });

      return;
    }

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

  [SpellName.REVIVE]: (
    entity: Entity,
    _config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    vfx.emitters.puff(entity.scene, target.x, target.y);
  },

  [SpellName.ILLUMINATE]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    vfx.shaders.illuminate(entity.scene, config.duration!);
  },

  [SpellName.GAIN_MOMENTUM]: (entity: Entity) => {
    vfx.emitters.puff(entity.scene, entity.x, entity.y);
  },

  [SpellName.REFLECT_DAMAGE]: (entity: Entity) => {
    vfx.emitters.puff(entity.scene, entity.x, entity.y);
  },

  [SpellName.HEAL_PARTY]: (entity: Entity) => {
    vfx.emitters.hearts(entity.scene, entity.x, entity.y);
  },

  [SpellName.SHIELD]: (entity: Entity) => {
    vfx.emitters.puff(entity.scene, entity.x, entity.y);
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

  [SpellName.GREASE]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
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

    vfx.emitters.puff(entity.scene, target.x, target.y);
  },

  [SpellName.BLINK]: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
    _direction: { x: number; y: number },
  ) => {
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;

    const dist = Math.min(Math.hypot(dx, dy), config.range!);
    const angle = Math.atan2(dy, dx);

    const x = entity.x + Math.cos(angle) * dist;
    const y = entity.y + Math.sin(angle) * dist;

    vfx.emitters.puff(entity.scene, entity.x, entity.y);

    if ((entity as Player).isControllable) {
      entity.setPosition(x, y);
      entity.scene.managers.camera.dash();
    }

    vfx.emitters.puff(entity.scene, x, y);
  },

  [SpellName.HYPERBEAM]: (entity: Entity) => {
    vfx.emitters.puff(entity.scene, entity.x, entity.y);
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
        entity.scene.managers.sound.play.sfx(SoundName.METEOR, {
          position: impact,
          seek: 1.5,
        });

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

  [SpellName.DARK_WAVE]: (
    entity: Entity,
    config: SpellConfig,
    _target: { x: number; y: number },
    direction: { x: number; y: number },
  ) => {
    const scene = entity.scene;
    const range = config.range!;
    const origin = {
      x: entity.x + direction.x * 10,
      y: entity.y + direction.y * 10,
    };

    let hitbox: Hitbox | null = null;

    vfx.quads.wave(scene, origin, direction, range, (front, done) => {
      if (!scene.sys) return;

      if (!hitbox) {
        hitbox = new Hitbox(
          scene,
          origin.x,
          origin.y,
          range,
          range,
          entity.id,
          config,
        );

        if ((entity as Player).isControllable)
          scene.managers.camera.shake(90, 0.0006);
      }

      if (!hitbox.active) return;

      if (done) {
        hitbox.destroy();
        return;
      }

      const r = Math.min(range / 2, Math.max(14, front * 0.55));

      hitbox.setPosition(
        origin.x + direction.x * front * 0.72,
        origin.y + direction.y * front * 0.72,
      );
      hitbox.body.setCircle(r, range / 2 - r, range / 2 - r);
    });
  },

  [SpellName.HYPNIC_JERK]: (entity: Entity, config: SpellConfig) => {
    const { x, y } = entity.body.center;

    vfx.quads.nova(entity.scene, x, y, config.radius!, () =>
      burst(entity, config, x, y),
    );
  },

  [SpellName.SUNDER]: (entity: Entity, config: SpellConfig) => {
    const { x, y } = entity.body.center;

    vfx.quads.sunder(entity.scene, x, y, config.radius!, () =>
      burst(entity, config, x, y),
    );
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
