import { AmbienceLayer, PipelineName } from "@server/types";
import { getAmbienceFrag } from "./frags/ambience";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;

export interface AmbienceState {
  brightness: number;
  coolness: number;
  saturation: number;
  contrast: number;
  vignette: { radius: number; strength: number };
  fog: { color: [number, number, number]; strength: number; speed: number; scale: number };
  eclipse: { radius: number; softness: number; strength: number };
}

export interface AmbienceModifier {
  brightness?: number;
  saturation?: number;
  contrast?: number;
  coolness?: number;
  vignette?: number;
  fog?: number;
}

export class AmbiencePipeline extends PostFXPipeline {
  private base: AmbienceState;
  private layers: Map<AmbienceLayer, AmbienceModifier>;
  private camera: { x: number; y: number; zoom: number };

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
      eclipse: { radius: 1.0, softness: 0.5, strength: 0.0 },
    };
    this.layers = new Map();
    this.camera = { x: 0, y: 0, zoom: 1 };
  }

  setBase(config: Partial<AmbienceState>) {
    if (config.brightness != null) this.base.brightness = config.brightness;
    if (config.coolness != null) this.base.coolness = config.coolness;
    if (config.saturation != null) this.base.saturation = config.saturation;
    if (config.contrast != null) this.base.contrast = config.contrast;
    if (config.vignette) this.base.vignette = { ...config.vignette };
    if (config.fog) this.base.fog = { ...config.fog, color: [...config.fog.color] };
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

  onPreRender() {
    let brightness = this.base.brightness;
    let saturation = this.base.saturation;
    let contrast = this.base.contrast;
    let coolness = this.base.coolness;
    let vignette = this.base.vignette.strength;
    let fog = this.base.fog.strength;

    for (const mod of this.layers.values()) {
      if (mod.brightness != null) brightness *= mod.brightness;
      if (mod.saturation != null) saturation *= mod.saturation;
      if (mod.contrast != null) contrast *= mod.contrast;
      if (mod.coolness != null) coolness += mod.coolness;
      if (mod.vignette != null) vignette += mod.vignette;
      if (mod.fog != null) fog += mod.fog;
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
    this.set2f("cameraScroll", this.camera.x, this.camera.y);
    this.set1f("cameraZoom", this.camera.zoom);
    this.set1f("eclipseRadius", this.base.eclipse.radius);
    this.set1f("eclipseSoftness", this.base.eclipse.softness);
    this.set1f("eclipseStrength", this.base.eclipse.strength);
    this.set2f("resolution", this.renderer.width, this.renderer.height);
  }
}
