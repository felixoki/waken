import { PipelineName } from "@server/types";
import { getVortexFrag } from "./frags/vortex";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;

export class VortexPipeline extends PostFXPipeline {
  public progress: number = 0;
  public time: number = 0;
  public centerX: number = 0.5;
  public centerY: number = 0.5;
  public radius: number = 0.15;

  constructor(game: Phaser.Game) {
    super({
      name: PipelineName.VORTEX,
      game: game,
      renderTarget: true,
      fragShader: getVortexFrag(),
    });
  }

  onPreRender() {
    this.set1f("uProgress", this.progress);
    this.set1f("uTime", this.time);
    this.set2f("uCenter", this.centerX, this.centerY);
    this.set1f("uRadius", this.radius);
    this.set2f("resolution", this.renderer.width, this.renderer.height);
  }
}
