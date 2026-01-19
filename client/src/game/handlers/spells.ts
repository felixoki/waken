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
};
