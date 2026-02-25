import { ComponentName, MapName, PlayerConfig } from "@server/types";
import { InventoryComponent } from "../components/Inventory";
import { HotbarComponent } from "../components/Hotbar";
import type { MainScene } from "../scenes/Main";

export const player = {
  transition: (data: PlayerConfig, main: MainScene): void => {
    const current = main.playerManager.player;
    if (!current) return;

    const prev = {
      inventory: current
        .getComponent<InventoryComponent>(ComponentName.INVENTORY)
        ?.get(),
      hotbar: current
        .getComponent<HotbarComponent>(ComponentName.HOTBAR)
        ?.get(),
      map: current.map,
      scene: current.scene,
    };

    main.playerManager.remove(current.id);
    main.playerManager.add(data, true);

    const updated = main.playerManager.player!;

    updated.isLocked = false;
    updated
      .getComponent<InventoryComponent>(ComponentName.INVENTORY)
      ?.set(prev.inventory!);
    updated
      .getComponent<HotbarComponent>(ComponentName.HOTBAR)
      ?.set(prev.hotbar);

    const scene = main.scene.get(data.map);

    prev.scene.scene.setVisible(false);
    scene.scene.setVisible(true);

    if (prev.map === MapName.REALM && data.map !== MapName.REALM) {
      main.entityManager.removeByMap(MapName.REALM);
      main.scene.stop(MapName.REALM);
      main.cache.tilemap.remove(MapName.REALM);
    }

    main.game.events.emit("camera:follow", {
      key: data.map,
      player: updated,
    });
  },
};
