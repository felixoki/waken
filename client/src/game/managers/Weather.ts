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
  WETNESS_DRY_DURATION,
  WETNESS_RAIN,
  WETNESS_SOAK_DURATION,
  WETNESS_STORM,
  SKY_TINT,
  SKY_TINT_BLEND,
  SKY_TINT_FLOOR,
  SPLASH_DEPTH,
  SPLASH_FLOOR,
  SPLASH_MAX,
  SPLASH_RATE,
} from "@server/globals";
import { WindPipeline } from "../pipelines/Wind";
import { SheenPipeline } from "../pipelines/Sheen";
import { emitters, RainSplashes } from "../vfx/emitters";
import type { Scene } from "../scenes/Scene";

const WEATHER_TRANSITION_DURATION = PHASE_TRANSITION_DURATION * 3;

type WeatherModifier = Required<Omit<AmbienceModifier, "flash" | "wetness">>;

const CLEAR: WeatherModifier = {
  brightness: 1.05,
  saturation: 1.07,
  contrast: 1.02,
  coolness: -0.07,
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

const WETNESS: Record<WeatherName, number> = {
  [WeatherName.CLEAR]: 0,
  [WeatherName.CLOUDY]: 0,
  [WeatherName.RAIN]: WETNESS_RAIN,
  [WeatherName.STORM]: WETNESS_STORM,
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

  private soaked = 0;
  private lit = 0;
  private tone: [number, number, number] = [1, 1, 1];

  private splashes?: { key: string; handle: RainSplashes };
  private pending = 0;
  private sheen?: SheenPipeline;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  get weather(): WeatherName {
    return this.current;
  }

  get wetness(): number {
    return this.soaked;
  }

  get flash(): number {
    return this.lit;
  }

  get sky(): [number, number, number] {
    return this.tone;
  }

  get raining(): boolean {
    return (
      this.current === WeatherName.RAIN || this.current === WeatherName.STORM
    );
  }

  update(delta: number): void {
    this._soak(delta);
    this._sky();
    this._splash(delta);
  }

  private _soak(delta: number): void {
    const target = WETNESS[this.current] ?? 0;

    if (this.soaked < target)
      this.soaked = Math.min(
        target,
        this.soaked + delta / WETNESS_SOAK_DURATION,
      );
    else if (this.soaked > target)
      this.soaked = Math.max(target, this.soaked - delta / WETNESS_DRY_DURATION);
  }

  private _sky(): void {
    const pipeline = this._current();
    const sun = pipeline?.sun;

    this.lit = Math.min(
      Math.max(pipeline?.layer(AmbienceLayer.LIGHTNING).flash ?? 0, 0),
      1,
    );

    const level = Math.max(sun?.intensity ?? 1, SKY_TINT_FLOOR);
    const source = [sun?.r ?? 1, sun?.g ?? 1, sun?.b ?? 1];

    for (let i = 0; i < 3; i++) {
      const blended =
        Phaser.Math.Linear(source[i], SKY_TINT[i], SKY_TINT_BLEND) * level;

      this.tone[i] = Phaser.Math.Linear(blended, 1, this.lit);
    }

    const sheen = this._sheen();

    if (!sheen) return;

    sheen.state.flash = this.lit;
    sheen.state.sky.r = this.tone[0];
    sheen.state.sky.g = this.tone[1];
    sheen.state.sky.b = this.tone[2];
  }

  private _splash(delta: number): void {
    const scene = this._outdoor();

    if (
      !scene ||
      !this.raining ||
      this.soaked <= SPLASH_FLOOR ||
      !scene.scene.isVisible()
    ) {
      this._clearSplashes();
      return;
    }

    if (
      this.splashes?.key !== scene.scene.key ||
      !this.splashes.handle.ring.scene
    ) {
      this._clearSplashes();

      this.splashes = {
        key: scene.scene.key,
        handle: emitters.rain(scene, SPLASH_DEPTH),
      };
    }

    const intensity = this.current === WeatherName.STORM ? 1 : 0.6;
    this.pending += SPLASH_RATE * intensity * this.soaked * (delta / 1000);

    let budget = Math.floor(this.pending);
    this.pending -= budget;

    if (budget > SPLASH_MAX) budget = SPLASH_MAX;

    const view = scene.cameras.main.worldView;

    while (budget-- > 0)
      this.splashes.handle.splash(
        view.x + Math.random() * view.width,
        view.y + Math.random() * view.height,
      );
  }

  private _clearSplashes(): void {
    if (!this.splashes) return;

    if (this.splashes.handle.ring.scene) this.splashes.handle.destroy();

    this.splashes = undefined;
    this.pending = 0;
  }

  private _sheen(): SheenPipeline | undefined {
    if (this.sheen) return this.sheen;

    const renderer = this.scene.game
      .renderer as Phaser.Renderer.WebGL.WebGLRenderer;

    this.sheen = renderer.pipelines?.get(PipelineName.SHEEN) as
      | SheenPipeline
      | undefined;

    return this.sheen;
  }

  private _outdoor(): Scene | undefined {
    const map = this.scene.managers.players.player?.map;

    if (!map || configs.maps[map]?.isIndoor) return undefined;

    return this.scene.scene.get(map) as Scene | undefined;
  }

  private _current(): AmbiencePipeline | undefined {
    const scene = this._outdoor();

    if (!scene?.cameras?.main) return undefined;

    const found = scene.cameras.main.getPostPipeline(PipelineName.AMBIENCE);
    const pipeline = Array.isArray(found) ? found[0] : found;

    return (pipeline as AmbiencePipeline) ?? undefined;
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
    const map = this.scene.managers.players.player?.map;
    if (!map || configs.maps[map]?.isIndoor) return;

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
