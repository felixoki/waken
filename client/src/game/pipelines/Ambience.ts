import { getAmbienceFrag } from "./frags/ambience";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;

export class AmbiencePipeline extends PostFXPipeline {
  private coolness: number;
  private saturation: number;
  private contrast: number;
  public vignette: { radius: number; strength: number };

  constructor(game: Phaser.Game) {
    super({
      name: "ambience",
      game: game,
      renderTarget: true,
      fragShader: getAmbienceFrag(),
    });

    this.coolness = 0.3;
    this.saturation = 1.0;
    this.contrast = 0.98;
    this.vignette = { radius: 0.5, strength: 0.15 };
  }

  setCoolness(value: number) {
    this.coolness = value;
  }

  setSaturation(value: number) {
    this.saturation = value;
  }

  setContrast(value: number) {
    this.contrast = value;
  }

  setVignette(radius: number, strength: number) {
    this.vignette.radius = radius;
    this.vignette.strength = strength;
  }

  onPreRender() {
    this.set1f("coolness", this.coolness);
    this.set1f("saturation", this.saturation);
    this.set1f("contrast", this.contrast);
    this.set1f("vignetteRadius", this.vignette.radius);
    this.set1f("vignetteStrength", this.vignette.strength);
    this.set2f("resolution", this.renderer.width, this.renderer.height);
  }
}
