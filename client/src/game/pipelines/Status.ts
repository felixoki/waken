import { PipelineName } from "@server/types";
import { SINK_BAND, SINK_BAND_ALPHA, STATUS_PAD } from "@server/globals";
import { getStatusFrag, getStatusVert } from "./frags/status";
import { water, type Wading } from "../handlers/water";
import Phaser from "phaser";

const SinglePipeline = Phaser.Renderer.WebGL.Pipelines.SinglePipeline;

export interface Status {
  levels: Float32Array;
  seed: number;
  trail: { x: number; y: number; motion: number };
  wading?: Wading;
}

export class StatusPipeline extends SinglePipeline {
  private sprite?: Phaser.GameObjects.Sprite;
  private zoom = 1;

  constructor(game: Phaser.Game, name: string = PipelineName.STATUS) {
    super({
      name: name,
      game: game,
      vertShader: getStatusVert(),
      fragShader: getStatusFrag(),
    });
  }

  boot() {
    super.boot();

    this.set1f("uPad", STATUS_PAD);
    this.set1f("uBand", SINK_BAND);
    this.set1f("uBandAlpha", SINK_BAND_ALPHA);
  }

  onPreRender() {
    this.set1f("uTime", this.game.loop.time / 1000);
  }

  onRender(_scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
    const { x, y } = water.origin(camera);

    this.zoom = camera.zoom;
    this.set2f("uWorldView", x, y);
    this.set1f("uZoom", camera.zoom);
  }

  onBind(gameObject?: Phaser.GameObjects.GameObject) {
    const sprite = gameObject as Phaser.GameObjects.Sprite | undefined;
    if (sprite === this.sprite) return;

    this.flush();
    this.sprite = sprite;
  }

  onBeforeFlush() {
    const sprite = this.sprite;
    const status = sprite?.getData("status") as Status | undefined;
    if (!sprite || !status) return;

    const frame = sprite.frame;
    const levels = status.levels;
    const trail = status.trail;
    const wading = status.wading;

    this.set4f("uFrame", frame.u0, frame.v0, frame.u1, frame.v1);
    this.set2f("uTexel", 1 / frame.source.width, 1 / frame.source.height);
    this.set2f("uSize", frame.width, frame.height);
    this.set2f(
      "uScale",
      sprite.scaleX * this.zoom * (sprite.flipX ? -1 : 1),
      sprite.scaleY * this.zoom * (sprite.flipY ? -1 : 1),
    );
    this.set1f("uSeed", status.seed);
    this.set4f("uA", levels[0], levels[1], levels[2], levels[3]);
    this.set4f("uB", levels[4], levels[5], levels[6], levels[7]);
    this.set1f("uWarm", levels[8]);
    this.set3f("uTrail", trail.x, trail.y, trail.motion);
    this.set1f("uClip", wading ? 1 : 0);
    this.set1f("uDepth", wading?.depth ?? 0);
    if (!wading) return;

    this.set2f("uCenter", wading.x, wading.y);
    this.set2f("uRadius", wading.rx, wading.ry);
  }
}
