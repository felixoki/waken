import { PipelineName } from "@server/types";
import { getSheenFrag } from "./frags/sheen";
import {
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

export class SheenPipeline extends MultiPipeline {
  public readonly state: SheenState = {
    flash: 0,
    sky: { r: 1, g: 1, b: 1 },
  };

  constructor(game: Phaser.Game, name: string = PipelineName.SHEEN) {
    super({
      name: name,
      game: game,
      fragShader: getSheenFrag(),
    });
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
