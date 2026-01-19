import Phaser from "phaser";
import { getOutlineFrag } from "./outline-frag";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;
const Color = Phaser.Display.Color;

const DEFAULT_QUALITY = 0.1;

export class OutlinePipeline extends PostFXPipeline {
  private color: Phaser.Display.Color;

  public thickness: number;

  constructor(game: Phaser.Game) {
    super({
      name: "outline",
      game: game,
      renderTarget: true,
      fragShader: getOutlineFrag(DEFAULT_QUALITY),
    });

    this.thickness = 0;
    this.color = new Color(255, 255, 255);
  }

  onPreRender() {
    this.set1f("thickness", this.thickness);
    this.set3f(
      "outlineColor",
      this.color.redGL,
      this.color.greenGL,
      this.color.blueGL
    );
    this.set2f("texSize", this.renderer.width, this.renderer.height);
  }
}
