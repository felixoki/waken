import { ComponentName } from "@server/types";
import { DamageableComponent } from "../components/Damageable";
import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";

export const combat = {
  hit: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const hitbox = obj2 as Hitbox;

    /**
     * We will only ever fire off hit events from the host player's client
     */
    const isHost = entity.scene.managers.players?.player?.isHost;

    if (hitbox.ownerId === entity.id || hitbox.hits.has(entity.id) || !isHost)
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

    entity.scene.tweens.add({
      targets: entity,
      alpha: 0.1,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  },

  knockback: (entity: Entity, knockback: { x: number; y: number }) => {
    if (!entity.body.immovable) return;

    entity.body.setVelocity(
      entity.body.velocity.x + knockback.x,
      entity.body.velocity.y + knockback.y,
    );

    const drag = entity.body.drag.x;
    entity.body.setDrag(800);
    entity.scene.time.delayedCall(300, () => entity.body.setDrag(drag));
  },
};
