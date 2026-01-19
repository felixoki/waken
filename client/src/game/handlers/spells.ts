import { SpellConfig } from "@server/types";
import { Entity } from "../Entity";
import { Projectile } from "../Projectile";
import { Hitbox } from "../Hitbox";

export const spells = {
  projectile: (
    entity: Entity,
    config: SpellConfig,
    direction: { x: number; y: number },
  ) => {
    new Projectile(
      entity.scene,
      entity.x + direction.x * 16,
      entity.y + direction.y * 16,
      entity.id,
      direction,
      config,
    );
  },
  melee: (
    entity: Entity,
    config: SpellConfig,
    direction: { x: number; y: number },
  ) => {
    new Hitbox(
      entity.scene,
      entity.x + direction.x * 32,
      entity.y + direction.y * 32,
      config.hitbox!.width,
      config.hitbox!.height,
      entity.id,
      config,
    );
  },
  area: (
    entity: Entity,
    config: SpellConfig,
    target: { x: number; y: number },
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
  },
  scene: (entity: Entity, config: SpellConfig) => {
    if (!config.shader) return;

    const camera = entity.scene.cameras.main;
    camera.setPostPipeline(config.shader.pipeline);

    entity.scene.time.delayedCall(1000, () => {
      camera.resetPostPipeline();
    });
  },
};
