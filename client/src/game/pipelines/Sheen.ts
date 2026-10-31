import { PipelineName } from "@server/types";
import { getSheenFrag, getSheenVert } from "./frags/sheen";
import { water, type Wading } from "../handlers/water";
import {
  SINK_BAND,
  SINK_BAND_ALPHA,
  SHEEN_DARKEN,
  SHEEN_DEEPEN,
  SHEEN_FACING,
  SHEEN_FACING_HIGH,
  SHEEN_FACING_LOW,
  SHEEN_FADE,
  SHEEN_SCALE,
  SHEEN_SPEED,
  SHEEN_STEPS,
  SHEEN_STRENGTH,
} from "@server/globals";
import Phaser from "phaser";

const MultiPipeline = Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

export interface SheenState {
  flash: number;
  sky: { r: number; g: number; b: number };
}

export interface Soak {
  rise: number;
  wading?: Wading;
}

export class SheenPipeline extends MultiPipeline {
  private soak?: Soak;

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
  }

  onRender(_scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
    const { x, y } = water.origin(camera);

    this.set2f("uWorldView", x, y);
    this.set1f("uZoom", camera.zoom);
  }

  onBind(gameObject?: Phaser.GameObjects.GameObject) {
    const soak = gameObject?.getData("soak") as Soak | undefined;
    if (soak === this.soak) return;

    this.flush();
    this.soak = soak;
  }

  onBeforeFlush() {
    const wading = this.soak?.wading;

    this.set1f("uRise", this.soak?.rise ?? 0);
    this.set1f("uClip", wading ? 1 : 0);
    this.set1f("uDepth", wading?.depth ?? 0);
    if (!wading) return;

    this.set2f("uCenter", wading.x, wading.y);
    this.set2f("uRadius", wading.rx, wading.ry);
  }

  onPreRender() {
    super.onPreRender();

    this.set1f("time", this.game.loop.time / 1000);
    this.set1f("darken", SHEEN_DARKEN);
    this.set1f("deepen", SHEEN_DEEPEN);
    this.set1f("strength", SHEEN_STRENGTH);
    this.set1f("scale", SHEEN_SCALE);
    this.set1f("speed", SHEEN_SPEED);
    this.set1f("steps", SHEEN_STEPS);
    this.set1f("fade", SHEEN_FADE);
    this.set1f("facingFloor", SHEEN_FACING);
    this.set1f("facingLow", SHEEN_FACING_LOW);
    this.set1f("facingHigh", SHEEN_FACING_HIGH);
    this.set1f("flash", this.state.flash);
    this.set3f("skyColor", this.state.sky.r, this.state.sky.g, this.state.sky.b);
  }
}
