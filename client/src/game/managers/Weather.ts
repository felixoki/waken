import {
  AmbienceLayer,
  AmbienceDomain,
  AmbienceName,
  MapName,
  PipelineName,
  WeatherName,
} from "@server/types";
import { MainScene } from "../scenes/Main";
import { configs } from "@server/configs";
import { AmbienceModifier, AmbiencePipeline } from "../pipelines/Ambience";
import { PHASE_TRANSITION_DURATION } from "@server/globals";

const WEATHER_TRANSITION_DURATION = PHASE_TRANSITION_DURATION * 3;

const CLEAR: Required<AmbienceModifier> = {
  brightness: 1.0,
  saturation: 1.0,
  contrast: 1.0,
  coolness: 0.0,
  vignette: 0.0,
  fog: 0.0,
  rain: 0.0,
};

const RAIN: Required<AmbienceModifier> = {
  brightness: 0.8,
  saturation: 0.8,
  contrast: 0.95,
  coolness: 0.18,
  vignette: 0.08,
  fog: 0.05,
  rain: 1.0,
};

export class WeatherManager {
  private scene: MainScene;
  private current: WeatherName = WeatherName.CLEAR;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  get weather(): WeatherName {
    return this.current;
  }

  setWeather(name: WeatherName, animate: boolean) {
    this.current = name;
    const target = name === WeatherName.RAIN ? RAIN : CLEAR;

    const map = this.scene.managers.players.player?.map;
    if (map) this.syncAmbience(map);

    for (const pipeline of this._getPipelines()) {
      const mod = pipeline.layer(AmbienceLayer.WEATHER);

      if (animate) {
        for (const key of Object.keys(target) as (keyof AmbienceModifier)[])
          if (mod[key] == null) mod[key] = CLEAR[key];

        this.scene.tweens.add({
          targets: mod,
          ...target,
          duration: WEATHER_TRANSITION_DURATION,
          ease: "Sine.easeInOut",
        });
      } else Object.assign(mod, target);
    }
  }

  syncAmbience(map: MapName): void {
    const indoor = !!configs.maps[map]?.isIndoor;
    const shouldPlay = this.current === WeatherName.RAIN && !indoor;
    const playing = this.scene.managers.sound.hasAmbience(AmbienceName.RAIN);

    if (shouldPlay && !playing)
      this.scene.managers.sound.play.ambience(
        AmbienceName.RAIN,
        AmbienceDomain.WEATHER,
      );
    else if (!shouldPlay && playing)
      this.scene.managers.sound.stop.ambience(AmbienceName.RAIN);
  }

  private _getOutdoorScenes(): Phaser.Scene[] {
    return this.scene.scene.manager
      .getScenes(false)
      .filter((s) => !configs.maps[s.scene.key as MapName]?.isIndoor);
  }

  private _getPipelines(): AmbiencePipeline[] {
    return this._getOutdoorScenes()
      .filter((s) => s.cameras.main)
      .map(
        (s) =>
          s.cameras.main.getPostPipeline(
            PipelineName.AMBIENCE,
          ) as AmbiencePipeline,
      )
      .flat()
      .filter(Boolean) as AmbiencePipeline[];
  }
}
