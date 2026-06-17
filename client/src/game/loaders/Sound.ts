import { AmbienceName, MusicName, SfxConfig, SoundName } from "@server/types";
import { configs } from "@server/configs";

const SFX_PATH = "assets/sounds";
const MUSIC_PATH = "assets/sounds/music";
const AMBIENCE_PATH = "assets/sounds/ambience";

export class Sound {
  static load(scene: Phaser.Scene) {
    for (const [name, config] of Object.entries(configs.sounds.sfx) as [
      SoundName,
      SfxConfig,
    ][]) {
      const keys = config.variants ?? [name];
      keys.forEach((key) =>
        scene.load.audio(key, `${SFX_PATH}/${config.folder}/${key}.ogg`),
      );
    }

    for (const name of Object.keys(configs.sounds.music) as MusicName[])
      scene.load.audio(name, `${MUSIC_PATH}/${name}.ogg`);

    for (const name of Object.keys(configs.sounds.ambience) as AmbienceName[])
      scene.load.audio(name, `${AMBIENCE_PATH}/${name}.ogg`);
  }
}
