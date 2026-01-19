import { getRendFrag } from "./rend-frag";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;

export class RendPipeline extends PostFXPipeline {
  constructor(game: Phaser.Game) {
    super({
      name: "rend",
      game: game,
      renderTarget: true,
      fragShader: getRendFrag(),
    });
  }

  onPreRender() {}
}
