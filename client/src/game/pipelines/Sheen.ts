import { PipelineName } from "@server/types";
import { getSheenFrag, getSheenVert } from "./frags/sheen";
import { water, type Wading } from "../handlers/water";
import {
  SINK_BAND,
  SINK_BAND_ALPHA,
  SHEEN_CREST,
  SHEEN_FACING,
  SHEEN_FADE,
  SHEEN_GAMMA,
  SHEEN_RELIEF,
  SHEEN_SATURATE,
  SHEEN_SCALE,
  SHEEN_SPEED,
  SHEEN_STEPS,
  SHEEN_STRENGTH,
} from "@server/globals";
import Phaser from "phaser";

const SinglePipeline = Phaser.Renderer.WebGL.Pipelines.SinglePipeline;

export interface SheenState {
  flash: number;
  sky: { r: number; g: number; b: number };
}

export interface Soak {
  wet: number;
  rise: number;
  seed: number;
  wading?: Wading;
}

export class SheenPipeline extends SinglePipeline {
  private sprite?: Phaser.GameObjects.Sprite;

  public readonly state: SheenState = {
    flash: 0,
    sky: { r: 1, g: 1, b: 1 },
  };

  constructor(game: Phaser.Game, name: string = PipelineName.SHEEN) {
    super({
      name: name,
      game: game,
      vertShader: getSheenVert(),
      fragShader: getSheenFrag(),
    });
  }

  boot() {
    super.boot();

    this.set1f("uBand", SINK_BAND);
    this.set1f("uBandAlpha", SINK_BAND_ALPHA);
    this.set1f("uGamma", SHEEN_GAMMA);
    this.set1f("uSaturate", SHEEN_SATURATE);
    this.set1f("uStrength", SHEEN_STRENGTH);
    this.set1f("uScale", SHEEN_SCALE);
    this.set1f("uSpeed", SHEEN_SPEED);
    this.set1f("uSteps", SHEEN_STEPS);
    this.set1f("uFade", SHEEN_FADE);
    this.set1f("uFloor", SHEEN_FACING);
    this.set1f("uRelief", SHEEN_RELIEF);
    this.set1f("uCrest", SHEEN_CREST);
  }

  onPreRender() {
    this.set1f("uTime", this.game.loop.time / 1000);
    this.set1f("uFlash", this.state.flash);
    this.set3f("uSky", this.state.sky.r, this.state.sky.g, this.state.sky.b);
  }

  onRender(_scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
    const { x, y } = water.origin(camera);

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
    const soak = sprite?.getData("soak") as Soak | undefined;
    if (!sprite || !soak) return;

    const frame = sprite.frame;
    const wading = soak.wading;

    this.set4f("uFrame", frame.u0, frame.v0, frame.u1, frame.v1);
    this.set2f("uTexel", 1 / frame.source.width, 1 / frame.source.height);
    this.set1f("uWet", soak.wet);
    this.set1f("uRise", soak.rise);
    this.set1f("uSeed", soak.seed);
    this.set1f("uClip", wading ? 1 : 0);
    this.set1f("uDepth", wading?.depth ?? 0);
    if (!wading) return;

    this.set2f("uCenter", wading.x, wading.y);
    this.set2f("uRadius", wading.rx, wading.ry);
  }
}
