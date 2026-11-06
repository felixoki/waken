import { PipelineName } from "@server/types";
import {
  GLOW_BREATH,
  GLOW_BREATH_PERIOD,
  GLOW_DRIFT,
  GLOW_DRIFT_SCALE,
  GLOW_DRIFT_SPEED,
} from "@server/globals";
import { getGlowFrag } from "./frags/glow";
import Phaser from "phaser";

const SinglePipeline = Phaser.Renderer.WebGL.Pipelines.SinglePipeline;

export class GlowPipeline extends SinglePipeline {
  private image?: Phaser.GameObjects.Image;

  constructor(game: Phaser.Game, name: string = PipelineName.GLOW) {
    super({ name, game, fragShader: getGlowFrag() });
  }

  boot() {
    super.boot();

    this.set1f("uDrift", GLOW_DRIFT);
    this.set1f("uScale", GLOW_DRIFT_SCALE);
    this.set1f("uSpeed", GLOW_DRIFT_SPEED);
    this.set1f("uBreath", GLOW_BREATH);
    this.set1f("uPeriod", GLOW_BREATH_PERIOD);
  }

  onPreRender() {
    this.set1f("uTime", this.game.loop.time / 1000);
  }

  onBind(gameObject?: Phaser.GameObjects.GameObject) {
    const image = gameObject as Phaser.GameObjects.Image | undefined;
    if (image === this.image) return;

    this.flush();
    this.image = image;
  }

  onBeforeFlush() {
    const image = this.image;
    if (!image) return;

    this.set2f("uOrigin", image.x, image.y);
    this.set2f("uSize", image.width, image.height);
  }
}
