import { configs } from "@server/configs";
import {
  ComponentName,
  EntityName,
  Item,
  MapName,
  Spritesheet,
} from "@server/types";

export const robe = {
  is: (name: EntityName): boolean =>
    !!configs.entities[name]?.components.some(
      (component) => component.name === ComponentName.ROBE,
    ),

  sheet: (item: Item | null): string | null => {
    if (!item) return null;

    for (const component of configs.entities[item.name]?.components ?? [])
      if (component.name === ComponentName.ROBE) return component.config.sheet;

    return null;
  },

  base: (entity: EntityName, sheet: string): string => `${entity}-${sheet}`,

  sheets: (sheet: string): Spritesheet[] =>
    configs.maps[MapName.VILLAGE].spritesheets
      .filter((entry) => entry.file.startsWith("player_"))
      .map((entry) => ({
        ...entry,
        key: entry.key.replace(
          EntityName.PLAYER,
          robe.base(EntityName.PLAYER, sheet),
        ),
        file: `robes/${sheet}/${entry.file}`,
      })),

  load: (scene: Phaser.Scene, sheet: string, done: () => void): void => {
    const missing = robe
      .sheets(sheet)
      .filter((entry) => !scene.textures.exists(entry.key));

    if (!missing.length) return done();

    for (const entry of missing)
      scene.load.spritesheet(entry.key, `assets/sprites/${entry.file}`, {
        frameWidth: entry.frameWidth || 64,
        frameHeight: entry.frameHeight || 64,
      });

    scene.load.once(Phaser.Loader.Events.COMPLETE, done);
    scene.load.start();
  },
};
