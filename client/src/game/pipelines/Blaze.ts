import { PipelineName } from "@server/types";
import {
  BLAZE_BODY,
  BLAZE_COLORS,
  BLAZE_GLOW,
  BLAZE_INTENSITY,
  BLAZE_PAD,
  BLAZE_SIDE,
  BLAZE_SOLID,
  BLAZE_SCALE,
  BLAZE_SPEED,
  BLAZE_STRETCH,
  BLAZE_THRESHOLDS,
  SINK_BAND,
  SINK_BAND_ALPHA,
} from "@server/globals";
import { getBlazeFrag, getBlazeVert } from "./frags/blaze";
import { water, type Wading } from "../handlers/water";
import Phaser from "phaser";

const SinglePipeline = Phaser.Renderer.WebGL.Pipelines.SinglePipeline;

export interface Flame {
  heat: number;
  seed: number;
  wading?: Wading;
}

export class BlazePipeline extends SinglePipeline {
  private sprite?: Phaser.GameObjects.Sprite;
  private zoom = 1;

  constructor(game: Phaser.Game, name: string = PipelineName.BLAZE) {
    super({
      name: name,
      game: game,
      vertShader: getBlazeVert(),
      fragShader: getBlazeFrag(),
    });
  }

  boot() {
    super.boot();

    const [ember, flame, bright, core] = BLAZE_COLORS;
    const [t0, t1, t2, t3] = BLAZE_THRESHOLDS;

    this.set1f("uPad", BLAZE_PAD);
    this.set1f("uSpeed", BLAZE_SPEED);
    this.set1f("uNoiseScale", BLAZE_SCALE);
    this.set1f("uStretch", BLAZE_STRETCH);
    this.set4f("uThresholds", t0, t1, t2, t3);
    this.set1f("uBody", BLAZE_BODY);
    this.set1f("uGlow", BLAZE_GLOW);
    this.set1f("uSolid", BLAZE_SOLID);
    this.set1f("uSide", BLAZE_SIDE);
    this.set1f("uIntensity", BLAZE_INTENSITY);
    this.color("uEmber", ember);
    this.color("uFlame", flame);
    this.color("uBright", bright);
    this.color("uCore", core);
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
    const flame = sprite?.getData("flame") as Flame | undefined;
    if (!sprite || !flame) return;

    const frame = sprite.frame;
    const wading = flame.wading;

    this.set4f("uFrame", frame.u0, frame.v0, frame.u1, frame.v1);
    this.set2f("uTexel", 1 / frame.source.width, 1 / frame.source.height);
    this.set2f(
      "uScale",
      sprite.scaleX * this.zoom * (sprite.flipX ? -1 : 1),
      sprite.scaleY * this.zoom * (sprite.flipY ? -1 : 1),
    );
    this.set1f("uHeat", flame.heat);
    this.set1f("uSeed", flame.seed);
    this.set1f("uClip", wading ? 1 : 0);
    this.set1f("uDepth", wading?.depth ?? 0);
    if (!wading) return;

    this.set2f("uCenter", wading.x, wading.y);
    this.set2f("uRadius", wading.rx, wading.ry);
  }

  private color(name: string, color: number) {
    this.set3f(
      name,
      ((color >> 16) & 0xff) / 255,
      ((color >> 8) & 0xff) / 255,
      (color & 0xff) / 255,
    );
  }
}
