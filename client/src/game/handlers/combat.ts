import { ComponentName } from "@server/types";
import { DamageableComponent } from "../components/Damageable";
import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";

export const combat = {
  hit: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const hitbox = obj2 as Hitbox;

    const isAuthority = entity.scene.managers.players?.player?.isAuthority;

    if (
      hitbox.ownerId === entity.id ||
      hitbox.hits.has(entity.id) ||
      !isAuthority
    )
      return;

    const damageable = entity.getComponent<DamageableComponent>(
      ComponentName.DAMAGEABLE,
    );
    if (!damageable) return;

    hitbox.hits.add(entity.id);

    entity.scene.game.events.emit("hit", {
      config: hitbox.config,
      attackerId: hitbox.ownerId,
      targetId: entity.id,
    });
  },

  hurt: (entity: Entity, health: number) => {
    entity.health = health;

    entity.scene.tweens.killTweensOf(entity);
    entity.setAlpha(1);

    entity.scene.tweens.add({
      targets: entity,
      alpha: 0.1,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  },

  knockback: (entity: Entity, knockback: { x: number; y: number }) => {
    if (entity.body.immovable) return;

    const body = entity.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(
      body.velocity.x + knockback.x,
      body.velocity.y + knockback.y,
    );

    body.setDrag(800);
    entity.scene.time.delayedCall(300, () => body.setDrag(0));
  },
};
