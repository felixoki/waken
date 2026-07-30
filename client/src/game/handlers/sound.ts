import { AmbienceDomain, MapName } from "@server/types";
import { configs } from "@server/configs";
import type { MainScene } from "../scenes/Main";

export const sound = {
  sync: (main: MainScene, map: MapName): void => {
    const config = configs.maps[map]?.sound;

    const currentQueue = main.managers.sound.getActiveMusic();
    const targetQueue = config?.music ?? null;
    const sameQueue =
      currentQueue !== null &&
      targetQueue !== null &&
      currentQueue.length === targetQueue.length &&
      currentQueue.every((t, i) => t === targetQueue[i]);

    if (!sameQueue) {
      if (targetQueue) main.managers.sound.play.music(targetQueue);
      else main.managers.sound.stop.music();
    }

    const target = new Set(config?.ambience ?? []);
    const active = main.managers.sound.getActiveAmbience(AmbienceDomain.MAP);

    active.forEach((name) => {
      if (!target.has(name)) main.managers.sound.stop.ambience(name);
    });

    target.forEach((name) => {
      if (!main.managers.sound.hasAmbience(name))
        main.managers.sound.play.ambience(name, AmbienceDomain.MAP);
    });

    main.managers.weather.syncAmbience(map);
  },
};