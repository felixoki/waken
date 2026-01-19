import { ComponentName } from "@server/types";
import { DamageableComponent } from "../components/Damageable";
import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";

export const physics = {
  overlap: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const hitbox = obj2 as Hitbox;

    /**
     * We will only ever fire off hit events from the host player's client
     */
    const isHost = entity.scene.playerManager.player?.isHost;

    if (hitbox.ownerId === entity.id || hitbox.hits.has(entity.id) || !isHost)
      return;

    const damageable = entity.getComponent<DamageableComponent>(
      ComponentName.DAMAGEABLE
    );
    if (!damageable) return;

    hitbox.hits.add(entity.id);

    entity.scene.game.events.emit("hit", {
      config: hitbox.config,
      attackerId: hitbox.ownerId,
      targetId: entity.id,
    });
  },
};
