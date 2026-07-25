import { PipelineName } from "@server/types";
import { getBeamFrag } from "./frags/beam";

const PostFXPipeline = Phaser.Renderer.WebGL.Pipelines.PostFXPipeline;

export class BeamPipeline extends PostFXPipeline {
  public uTime: number = 0;
  public seed: number = 0;
  public startX: number = 0;
  public startY: number = 0;
  public endX: number = 0;
  public endY: number = 0;
  public thickness: number = 34;
  public core: [number, number, number] = [1, 1, 1];
  public edge: [number, number, number] = [1, 0.28, 0.32];

  constructor(game: Phaser.Game) {
    super({
      name: PipelineName.BEAM,
      game: game,
      renderTarget: true,
      fragShader: getBeamFrag(),
    });
  }

  onPreRender() {
    this.set2f("uResolution", this.renderer.width, this.renderer.height);
    this.set2f("uStart", this.startX, this.startY);
    this.set2f("uEnd", this.endX, this.endY);
    this.set1f("uThickness", this.thickness);
    this.set1f("uTime", this.uTime);
    this.set1f("uSeed", this.seed);
    this.set3f("uCore", this.core[0], this.core[1], this.core[2]);
    this.set3f("uEdge", this.edge[0], this.edge[1], this.edge[2]);
  }
}
