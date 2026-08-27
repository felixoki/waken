import {
  AmbienceLayer,
  AmbienceDomain,
  AmbienceName,
  MapName,
  PipelineName,
  SoundName,
  WeatherName,
} from "@server/types";
import { MainScene } from "../scenes/Main";
import { configs } from "@server/configs";
import { AmbienceModifier, AmbiencePipeline } from "../pipelines/Ambience";
import {
  CLOUD_STRENGTH,
  PHASE_TRANSITION_DURATION,
  RAY_STRENGTH,
  STRIKE_FLASH_IN,
  STRIKE_FLASH_OUT,
  STRIKE_FLASH_STRENGTH,
  STRIKE_FLICKER_CHANCE,
  STRIKE_SHAKE_DURATION,
  STRIKE_SHAKE_INTENSITY,
  STRIKE_SHAKE_RANGE,
  STRIKE_THUNDER_DELAY,
  STRIKE_THUNDER_RATE_FAR,
  STRIKE_THUNDER_RATE_NEAR,
  STRIKE_THUNDER_VOLUME,
  WIND_AMPLITUDE,
  WIND_CLOUDY,
  WIND_GUST,
  WIND_RAIN,
  WIND_SPEED,
  WIND_STORM,
} from "@server/globals";
import { WindPipeline } from "../pipelines/Wind";
import type { Scene } from "../scenes/Scene";

const WEATHER_TRANSITION_DURATION = PHASE_TRANSITION_DURATION * 3;

type WeatherModifier = Required<Omit<AmbienceModifier, "flash">>;

const CLEAR: WeatherModifier = {
  brightness: 1.0,
  saturation: 1.0,
  contrast: 1.0,
  coolness: 0.0,
  vignette: 0.0,
  fog: 0.0,
  rain: 0.0,
  clouds: 0.0,
  rays: 0.0,
};

const CLOUDY: WeatherModifier = {
  brightness: 0.96,
  saturation: 0.96,
  contrast: 0.99,
  coolness: 0.05,
  vignette: 0.02,
  fog: 0.0,
  rain: 0.0,
  clouds: CLOUD_STRENGTH,
  rays: RAY_STRENGTH,
};

const RAIN: WeatherModifier = {
  brightness: 0.8,
  saturation: 0.8,
  contrast: 0.95,
  coolness: 0.18,
  vignette: 0.08,
  fog: 0.05,
  rain: 1.0,
  clouds: 0.0,
  rays: 0.0,
};

const STORM: WeatherModifier = {
  brightness: 0.62,
  saturation: 0.66,
  contrast: 1.08,
  coolness: 0.3,
  vignette: 0.22,
  fog: 0.12,
  rain: 3.2,
  clouds: 0.0,
  rays: 0.0,
};

const WEATHERS: Record<WeatherName, WeatherModifier> = {
  [WeatherName.CLEAR]: CLEAR,
  [WeatherName.CLOUDY]: CLOUDY,
  [WeatherName.RAIN]: RAIN,
  [WeatherName.STORM]: STORM,
};

const AMBIENCES: Partial<Record<WeatherName, AmbienceName>> = {
  [WeatherName.RAIN]: AmbienceName.RAIN,
  [WeatherName.STORM]: AmbienceName.STORM,
};

const WINDS: Record<WeatherName, number> = {
  [WeatherName.CLEAR]: 1,
  [WeatherName.CLOUDY]: WIND_CLOUDY,
  [WeatherName.RAIN]: WIND_RAIN,
  [WeatherName.STORM]: WIND_STORM,
};

export class WeatherManager {
  private scene: MainScene;
  private current: WeatherName = WeatherName.CLOUDY;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  get weather(): WeatherName {
    return this.current;
  }

  setWeather(name: WeatherName, animate: boolean) {
    this.current = name;
    const target = WEATHERS[name] ?? CLEAR;

    const map = this.scene.managers.players.player?.map;
    if (map) this.syncAmbience(map);

    for (const pipeline of this._getPipelines()) {
      const mod = pipeline.layer(AmbienceLayer.WEATHER);

      if (animate) {
        for (const key of Object.keys(target) as (keyof WeatherModifier)[])
          if (mod[key] == null) mod[key] = CLEAR[key];

        this.scene.tweens.add({
          targets: mod,
          ...target,
          duration: WEATHER_TRANSITION_DURATION,
          ease: "Sine.easeInOut",
        });
      } else Object.assign(mod, target);
    }

    this._blow(name, animate);
  }

  private _blow(name: WeatherName, animate: boolean): void {
    const renderer = this.scene.game
      .renderer as Phaser.Renderer.WebGL.WebGLRenderer;

    const pipeline = renderer.pipelines?.get(PipelineName.WIND) as
      | WindPipeline
      | undefined;

    if (!pipeline) return;

    const scale = WINDS[name] ?? 1;
    const target = {
      amplitude: WIND_AMPLITUDE * scale,
      speed: WIND_SPEED * (1 + (scale - 1) * WIND_GUST),
    };

    this.scene.tweens.killTweensOf(pipeline.wind);

    if (animate)
      this.scene.tweens.add({
        targets: pipeline.wind,
        ...target,
        duration: WEATHER_TRANSITION_DURATION,
        ease: "Sine.easeInOut",
      });
    else Object.assign(pipeline.wind, target);
  }

  syncAmbience(map: MapName): void {
    const indoor = !!configs.maps[map]?.isIndoor;
    const wanted = indoor ? null : (AMBIENCES[this.current] ?? null);

    for (const name of [AmbienceName.RAIN, AmbienceName.STORM]) {
      const playing = this.scene.managers.sound.hasAmbience(name);

      if (name === wanted && !playing)
        this.scene.managers.sound.play.ambience(name, AmbienceDomain.WEATHER);
      else if (name !== wanted && playing)
        this.scene.managers.sound.stop.ambience(name);
    }
  }

  strike(distance: number): void {
    const closeness = 1 - Phaser.Math.Clamp(distance, 0, 1);

    this._flash(closeness);
    this._thunder(distance, closeness);
  }

  private _flash(closeness: number): void {
    const peak = STRIKE_FLASH_STRENGTH * (0.2 + closeness * 0.8);
    const flicker = Math.random() < STRIKE_FLICKER_CHANCE;

    for (const pipeline of this._getPipelines()) {
      const mod = pipeline.layer(AmbienceLayer.LIGHTNING);

      this.scene.tweens.killTweensOf(mod);
      mod.flash = 0;

      this.scene.tweens.chain({
        targets: mod,
        tweens: [
          { flash: peak, duration: STRIKE_FLASH_IN, ease: "Quad.easeOut" },
          ...(flicker
            ? [
                {
                  flash: peak * 0.3,
                  duration: STRIKE_FLASH_OUT * 0.3,
                  ease: "Quad.easeIn",
                },
                {
                  flash: peak * 0.75,
                  duration: STRIKE_FLASH_IN,
                  ease: "Quad.easeOut",
                },
              ]
            : []),
          { flash: 0, duration: STRIKE_FLASH_OUT, ease: "Quad.easeIn" },
        ],
      });
    }
  }

  private _thunder(distance: number, closeness: number): void {
    this.scene.time.delayedCall(distance * STRIKE_THUNDER_DELAY, () => {
      this.scene.managers.sound.play.sfx(SoundName.LIGHTNING_STRIKE, {
        volume: STRIKE_THUNDER_VOLUME * (0.25 + closeness * 0.75),
        rate:
          STRIKE_THUNDER_RATE_FAR +
          closeness * (STRIKE_THUNDER_RATE_NEAR - STRIKE_THUNDER_RATE_FAR),
      });

      if (closeness >= 1 - STRIKE_SHAKE_RANGE) this._shake(closeness);
    });
  }

  private _shake(closeness: number): void {
    const map = this.scene.managers.players.player?.map;
    if (!map) return;

    const scene = this.scene.scene.get(map) as Scene;

    scene?.managers?.camera?.shake(
      STRIKE_SHAKE_DURATION,
      STRIKE_SHAKE_INTENSITY * closeness,
    );
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
