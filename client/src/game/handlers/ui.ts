import { Event, MapName } from "@server/types";
import EventBus from "../EventBus";
import type { MainScene } from "../scenes/Main";

export const ui = {
  backdrop: {
    show: (opts?: { tips?: boolean; map?: MapName }): void => {
      EventBus.emit(Event.LOADING_SHOW, opts);
    },

    hide: (main: MainScene, mapKey: string): void => {
      const scene = main.scene.get(mapKey);
      let resolved = false;

      const resolve = () => {
        if (resolved) return;
        resolved = true;

        scene.events.off(Phaser.Scenes.Events.POST_UPDATE, check);
        EventBus.emit(Event.LOADING_HIDE);
      };

      const check = () => {
        if (!main.managers.entities.isPending) resolve();
      };

      scene.events.on(Phaser.Scenes.Events.POST_UPDATE, check);
      setTimeout(resolve, 2000);
    },
  },
};
