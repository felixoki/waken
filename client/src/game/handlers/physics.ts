import { EntityName } from "@server/types";
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

    hitbox.hits.add(entity.id);

    const event =
      entity.name === EntityName.PLAYER ? "player:hit" : "entity:hit";

    entity.scene.game.events.emit(event, {
      attackerId: hitbox.ownerId,
      targetId: entity.id,
    });
  },
};
