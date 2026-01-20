import { ComponentName } from "@server/types";
import { CollectorComponent } from "../components/Collector";
import { Entity } from "../Entity";
import EventBus from "../EventBus";
import { InventoryComponent } from "../components/Inventory";

export const interaction = {
  start(entity: Entity) {
    const collector = entity.getComponent<CollectorComponent>(
      ComponentName.COLLECTOR,
    );
    const inventory =
      entity.scene.playerManager.player?.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
    const items = inventory
      ?.get()
      .filter((item) => item && collector?.config.accepts.includes(item.name));

    EventBus.emit("interaction:start", {
      id: entity.id,
      ...(collector && {
        collects: items,
      }),
    });
  },
};
