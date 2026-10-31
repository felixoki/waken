import { PipelineName } from "@server/types";
import {
  SINK_BAND,
  SINK_BAND_ALPHA,
  SINK_TINT,
  WATER_GRADIENT,
} from "@server/globals";
import { getWadeFrag, getWadeVert } from "./frags/wade";
import { water, type Wading } from "../handlers/water";
import Phaser from "phaser";

const SinglePipeline = Phaser.Renderer.WebGL.Pipelines.SinglePipeline;

export class WadePipeline extends SinglePipeline {
  private wading?: Wading;

  constructor(game: Phaser.Game, name: string = PipelineName.WADE) {
    super({
      name: name,
      game: game,
      vertShader: getWadeVert(),
      fragShader: getWadeFrag(),
    });
  }

  boot() {
    super.boot();

    const color = WATER_GRADIENT[1].color;

    this.set1f("uBand", SINK_BAND);
    this.set1f("uBandAlpha", SINK_BAND_ALPHA);
    this.set1f("uTint", SINK_TINT);
    this.set3f(
      "uWater",
      ((color >> 16) & 0xff) / 255,
      ((color >> 8) & 0xff) / 255,
      (color & 0xff) / 255,
    );
  }

  onRender(_scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
    const { x, y } = water.origin(camera);

    this.set2f("uWorldView", x, y);
    this.set1f("uZoom", camera.zoom);
  }

  onBind(gameObject?: Phaser.GameObjects.GameObject) {
    const wading = gameObject?.getData("wading") as Wading | undefined;
    if (!wading || wading === this.wading) return;

    this.flush();
    this.wading = wading;
  }

  onBeforeFlush() {
    const wading = this.wading;
    if (!wading) return;

    this.set1f("uDepth", wading.depth);
    this.set2f("uCenter", wading.x, wading.y);
    this.set2f("uRadius", wading.rx, wading.ry);
  }
}
