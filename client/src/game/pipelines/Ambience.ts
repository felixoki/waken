import { AmbienceLayer, PipelineName } from "@server/types";
import { getAmbienceFrag } from "./frags/ambience";
import {
  RAIN_DENSITY,
  RAIN_RUSH,
  STRIKE_FLASH_COLOR,
  CLOUD_ANGLE,
  CLOUD_COLOR,
  CLOUD_COVERAGE,
  CLOUD_SCALE,
  CLOUD_SOFTNESS,
  CLOUD_SPEED,
  RAY_ANGLE,
  RAY_CORE,
  RAY_GAP,
  RAY_COVERAGE,
  RAY_HAZE,
  RAY_LENGTH,
  RAY_RUN,
  RAY_SCALE,
  RAY_SOFTNESS,
  RAY_SPEED,
} from "@server/globals";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;

export interface AmbienceState {
  brightness: number;
  coolness: number;
  saturation: number;
  contrast: number;
  vignette: { radius: number; strength: number };
  fog: { color: [number, number, number]; strength: number; speed: number; scale: number };
  rain: {
    strength: number;
    speed: number;
    scale: number;
    density: number;
    rush: number;
  };
  clouds: {
    color: [number, number, number];
    strength: number;
    scale: number;
    speed: number;
    angle: number;
    coverage: number;
    softness: number;
  };
  rays: {
    strength: number;
    scale: number;
    length: number;
    run: number;
    speed: number;
    angle: number;
    coverage: number;
    softness: number;
    core: number;
    haze: number;
    gap: number;
  };
  flash: { color: [number, number, number] };
  eclipse: { radius: number; softness: number; strength: number };
}

export interface AmbienceSun {
  r: number;
  g: number;
  b: number;
  intensity: number;
}

export interface AmbienceModifier {
  brightness?: number;
  saturation?: number;
  contrast?: number;
  coolness?: number;
  vignette?: number;
  fog?: number;
  rain?: number;
  clouds?: number;
  rays?: number;
  flash?: number;
  wetness?: number;
}

export class AmbiencePipeline extends PostFXPipeline {
  private base: AmbienceState;
  private layers: Map<AmbienceLayer, AmbienceModifier>;
  private camera: { x: number; y: number; zoom: number };
  private sunlight: AmbienceSun;

  constructor(game: Phaser.Game) {
    super({
      name: PipelineName.AMBIENCE,
      game: game,
      renderTarget: true,
      fragShader: getAmbienceFrag(),
    });

    this.base = {
      brightness: 1.0,
      coolness: 0.0,
      saturation: 1.0,
      contrast: 1.0,
      vignette: { radius: 0.5, strength: 0.0 },
      fog: { color: [0.6, 0.65, 0.75], strength: 0.0, speed: 0.02, scale: 3.0 },
      rain: {
        strength: 0.0,
        speed: 1.0,
        scale: 1.0,
        density: RAIN_DENSITY,
        rush: RAIN_RUSH,
      },
      clouds: {
        color: [...CLOUD_COLOR],
        strength: 0.0,
        scale: CLOUD_SCALE,
        speed: CLOUD_SPEED,
        angle: CLOUD_ANGLE,
        coverage: CLOUD_COVERAGE,
        softness: CLOUD_SOFTNESS,
      },
      rays: {
        strength: 0.0,
        scale: RAY_SCALE,
        length: RAY_LENGTH,
        run: RAY_RUN,
        speed: RAY_SPEED,
        angle: RAY_ANGLE,
        coverage: RAY_COVERAGE,
        softness: RAY_SOFTNESS,
        core: RAY_CORE,
        haze: RAY_HAZE,
        gap: RAY_GAP,
      },
      flash: { color: [...STRIKE_FLASH_COLOR] },
      eclipse: { radius: 1.0, softness: 0.5, strength: 0.0 },
    };
    this.layers = new Map();
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.sunlight = { r: 1, g: 1, b: 1, intensity: 1 };
  }

  get sun(): AmbienceSun {
    return this.sunlight;
  }

  setBase(config: Partial<AmbienceState>) {
    if (config.brightness != null) this.base.brightness = config.brightness;
    if (config.coolness != null) this.base.coolness = config.coolness;
    if (config.saturation != null) this.base.saturation = config.saturation;
    if (config.contrast != null) this.base.contrast = config.contrast;
    if (config.vignette) this.base.vignette = { ...config.vignette };
    if (config.fog) this.base.fog = { ...config.fog, color: [...config.fog.color] };
    if (config.rain) this.base.rain = { ...config.rain };
    if (config.clouds)
      this.base.clouds = { ...config.clouds, color: [...config.clouds.color] };
    if (config.rays) this.base.rays = { ...config.rays };
    if (config.flash) this.base.flash = { color: [...config.flash.color] };
    if (config.eclipse) this.base.eclipse = { ...config.eclipse };
  }

  layer(name: AmbienceLayer): AmbienceModifier {
    let layer = this.layers.get(name);
    if (!layer) {
      layer = {};
      this.layers.set(name, layer);
    }
    return layer;
  }

  clearLayer(name: AmbienceLayer) {
    this.layers.delete(name);
  }

  setCamera(x: number, y: number, zoom: number) {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.zoom = zoom;
  }

  private _setDirection(name: string, angle: number) {
    const radians = Phaser.Math.DegToRad(angle);
    this.set2f(name, Math.cos(radians), Math.sin(radians));
  }

  onPreRender() {
    let brightness = this.base.brightness;
    let saturation = this.base.saturation;
    let contrast = this.base.contrast;
    let coolness = this.base.coolness;
    let vignette = this.base.vignette.strength;
    let fog = this.base.fog.strength;
    let rain = this.base.rain.strength;
    let clouds = this.base.clouds.strength;
    let rays = this.base.rays.strength;
    let flash = 0;
    let wetness = 0;

    for (const mod of this.layers.values()) {
      if (mod.brightness != null) brightness *= mod.brightness;
      if (mod.saturation != null) saturation *= mod.saturation;
      if (mod.contrast != null) contrast *= mod.contrast;
      if (mod.coolness != null) coolness += mod.coolness;
      if (mod.vignette != null) vignette += mod.vignette;
      if (mod.fog != null) fog += mod.fog;
      if (mod.rain != null) rain += mod.rain;
      if (mod.clouds != null) clouds += mod.clouds;
      if (mod.rays != null) rays += mod.rays;
      if (mod.flash != null) flash += mod.flash;
      if (mod.wetness != null) wetness += mod.wetness;
    }

    this.set1f("coolness", coolness);
    this.set1f("saturation", saturation);
    this.set1f("contrast", contrast);
    this.set1f("brightness", brightness);
    this.set1f("vignetteRadius", this.base.vignette.radius);
    this.set1f("vignetteStrength", vignette);
    this.set1f("time", this.game.loop.time / 1000);
    this.set3f("fogColor", this.base.fog.color[0], this.base.fog.color[1], this.base.fog.color[2]);
    this.set1f("fogStrength", fog);
    this.set1f("fogSpeed", this.base.fog.speed);
    this.set1f("fogScale", this.base.fog.scale);
    this.set1f("wetness", Math.min(Math.max(wetness, 0), 1));
    this.set1f("rainStrength", rain);
    this.set1f("rainSpeed", this.base.rain.speed);
    this.set1f("rainScale", this.base.rain.scale);
    this.set1f("rainDensity", this.base.rain.density);
    this.set1f("rainRush", this.base.rain.rush);
    this.set3f(
      "cloudColor",
      this.base.clouds.color[0],
      this.base.clouds.color[1],
      this.base.clouds.color[2],
    );
    this.set1f("cloudStrength", Math.max(clouds, 0));
    this.set1f("cloudScale", this.base.clouds.scale);
    this.set1f("cloudSpeed", this.base.clouds.speed);
    this._setDirection("cloudDirection", this.base.clouds.angle);
    this.set1f("cloudCoverage", this.base.clouds.coverage);
    this.set1f("cloudSoftness", this.base.clouds.softness);
    this.set3f("rayColor", this.sunlight.r, this.sunlight.g, this.sunlight.b);
    this.set1f(
      "rayStrength",
      Math.max(rays, 0) * Math.max(this.sunlight.intensity, 0),
    );
    this.set1f("rayScale", this.base.rays.scale);
    this.set1f("rayLength", this.base.rays.length);
    this.set1f("rayRun", this.base.rays.run);
    this.set1f("raySpeed", this.base.rays.speed);
    this._setDirection("rayDirection", this.base.rays.angle);
    this.set1f("rayCoverage", this.base.rays.coverage);
    this.set1f("raySoftness", this.base.rays.softness);
    this.set1f("rayCore", this.base.rays.core);
    this.set1f("rayHaze", this.base.rays.haze);
    this.set1f("rayGap", this.base.rays.gap);
    this.set2f("cameraScroll", this.camera.x, this.camera.y);
    this.set1f("cameraZoom", this.camera.zoom);
    this.set3f(
      "flashColor",
      this.base.flash.color[0],
      this.base.flash.color[1],
      this.base.flash.color[2],
    );
    this.set1f("flashStrength", Math.min(Math.max(flash, 0), 1));
    this.set1f("eclipseRadius", this.base.eclipse.radius);
    this.set1f("eclipseSoftness", this.base.eclipse.softness);
    this.set1f("eclipseStrength", this.base.eclipse.strength);
    this.set2f("resolution", this.renderer.width, this.renderer.height);
  }
}
