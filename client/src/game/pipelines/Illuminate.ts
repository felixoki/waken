import { getIlluminateFrag } from "./illuminate-frag";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;
const Color = Phaser.Display.Color;

export class IlluminatePipeline extends PostFXPipeline {
  private color: Phaser.Display.Color;

  constructor(game: Phaser.Game) {
    super({
      name: "illuminate",
      game: game,
      renderTarget: true,
      fragShader: getIlluminateFrag(),
    });

    this.color = new Color(255, 255, 255);
  }

  onPreRender() {
    this.set3f(
      "lightColor",
      this.color.redGL,
      this.color.greenGL,
      this.color.blueGL,
    );
  }
}
