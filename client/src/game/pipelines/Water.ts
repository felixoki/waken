import { PipelineName } from "@server/types";
import {
  BEACH_BAND_ALPHAS,
  BEACH_BAND_NOISE,
  BEACH_BANDS,
  BEACH_EDGE,
  BEACH_FOAM,
  BEACH_FOAM_ALPHA,
  BEACH_FOAM_BREAK,
  BEACH_FOAM_COLOR,
  BEACH_FOAM_SCALE,
  BEACH_NOISE,
  BEACH_NOISE_SCALE,
  BEACH_PERIOD,
  BEACH_RUN,
  BEACH_SHALLOW_COLOR,
  BEACH_WET_ALPHA,
  BEACH_WET_COLOR,
  WATER_CAUSTIC_FADER_MULTIPLIER,
  WATER_CAUSTIC_FADER_SCALE,
  WATER_CAUSTIC_MOVEMENT_AMOUNT,
  WATER_CAUSTIC_MOVEMENT_SCALE,
  WATER_CAUSTIC_SCALE,
  WATER_CAUSTIC_SPEED,
  WATER_CAUSTIC_SQUASH,
  WATER_CAUSTIC_TEXTURE,
  WATER_FOAM_SCALE,
  WATER_PALETTES,
  WATER_PIXELIZATION,
  WATER_SPECULAR_SCALE,
  WATER_SPECULAR_SCALE2,
  WATER_SPECULAR_SPEED,
  WATER_SPECULAR_THRESHOLD,
  WAKE_ALPHA,
  WAKE_COLOR,
  WAKE_CUTOFF,
  WAKE_FILL,
  WAKE_LEVELS,
  WAKE_PHASE,
  WAKE_RIPPLE,
  WAKE_SKEW,
  WAKE_SPEED,
  WAKE_TAIL,
} from "@server/globals";
import { getWaterFrag, getWaterVert } from "./frags/water";
import { water, type Water } from "../handlers/water";
import Phaser from "phaser";

const SinglePipeline = Phaser.Renderer.WebGL.Pipelines.SinglePipeline;

const DEPTH_UNIT = 1;
const CAUSTICS_UNIT = 2;
const WAKE_UNIT = 3;
const SHORE_UNIT = 4;

const rgb = (color: number): [number, number, number] => [
  ((color >> 16) & 0xff) / 255,
  ((color >> 8) & 0xff) / 255,
  (color & 0xff) / 255,
];

export class WaterPipeline extends SinglePipeline {
  private water?: Water;

  constructor(game: Phaser.Game, name: string = PipelineName.WATER) {
    super({
      name: name,
      game: game,
      vertShader: getWaterVert(),
      fragShader: getWaterFrag(),
    });
  }

  boot() {
    super.boot();

    this.set1i("uDepth", DEPTH_UNIT);
    this.set1i("uCaustics", CAUSTICS_UNIT);
    this.set1i("uWake", WAKE_UNIT);
    this.set1i("uShore", SHORE_UNIT);
    this.set1f("uPixelization", WATER_PIXELIZATION);
    this.set1f("uCausticScale", WATER_CAUSTIC_SCALE);
    this.set1f("uMovementScale", WATER_CAUSTIC_MOVEMENT_SCALE);
    this.set1f("uMovementAmount", WATER_CAUSTIC_MOVEMENT_AMOUNT);
    this.set1f("uCausticSpeed", WATER_CAUSTIC_SPEED);
    this.set1f("uSquash", WATER_CAUSTIC_SQUASH);
    this.set1f("uFaderMultiplier", WATER_CAUSTIC_FADER_MULTIPLIER);
    this.set1f("uFaderScale", WATER_CAUSTIC_FADER_SCALE);
    this.set1f("uSpecularThreshold", WATER_SPECULAR_THRESHOLD);
    this.set1f("uSpecularSpeed", WATER_SPECULAR_SPEED);
    this.set1f("uSpecularScale", WATER_SPECULAR_SCALE);
    this.set1f("uSpecularScale2", WATER_SPECULAR_SCALE2);
    this.set1f("uFoamScale", WATER_FOAM_SCALE);
    this.set1f("uBeachEdge", BEACH_EDGE);
    this.set2f("uBeachBands", BEACH_BANDS[0], BEACH_BANDS[1]);
    this.set2f("uBeachBandAlphas", BEACH_BAND_ALPHAS[0], BEACH_BAND_ALPHAS[1]);
    this.set1f("uBeachBandNoise", BEACH_BAND_NOISE);
    this.set3f("uBeachShallowColor", ...rgb(BEACH_SHALLOW_COLOR));
    this.set1f("uBeachNoise", BEACH_NOISE);
    this.set1f("uBeachNoiseScale", BEACH_NOISE_SCALE);
    this.set1f("uBeachPeriod", BEACH_PERIOD);
    this.set1f("uBeachRun", BEACH_RUN);
    this.set1f("uBeachFoam", BEACH_FOAM);
    this.set1f("uBeachFoamBreak", BEACH_FOAM_BREAK);
    this.set1f("uBeachFoamScale", BEACH_FOAM_SCALE);
    this.set4f("uBeachFoamColor", ...rgb(BEACH_FOAM_COLOR), BEACH_FOAM_ALPHA);
    this.set4f("uBeachWetColor", ...rgb(BEACH_WET_COLOR), BEACH_WET_ALPHA);
    this.set1f("uWakePhase", WAKE_PHASE);
    this.set1f("uWakeSkew", WAKE_SKEW);
    this.set1f("uWakeSpeed", WAKE_SPEED);
    this.set1f("uWakeAlpha", WAKE_ALPHA);
    this.set1f("uWakeFill", WAKE_FILL);
    this.set1f("uWakeRipple", WAKE_RIPPLE);
    this.set1f("uWakeLevels", WAKE_LEVELS);
    this.set1f("uWakeCutoff", WAKE_CUTOFF);
    this.set1f("uWakeTail", WAKE_TAIL);
    this.set3f("uWakeColor", ...rgb(WAKE_COLOR));
  }

  onPreRender() {
    super.onPreRender();

    this.set1f("uTime", this.game.loop.time / 1000);
  }

  onRender(_scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
    const { x, y } = water.origin(camera);

    this.set2f("uWorldView", x, y);
    this.set1f("uZoom", camera.zoom);
  }

  onBind(gameObject?: Phaser.GameObjects.GameObject) {
    const state = gameObject?.getData("water") as Water | undefined;
    if (!state || state === this.water) return;

    this.flush();
    this.water = state;
  }

  onBeforeFlush() {
    const state = this.water;
    const caustics = this.game.textures.get(WATER_CAUSTIC_TEXTURE).source[0].glTexture;
    const depth = state?.depth.source[0].glTexture;
    const wake = state?.wake.getWebGLTexture();
    const shore = state?.shore.source[0].glTexture;
    if (!state || !caustics || !depth || !wake || !shore) return;

    const palette = WATER_PALETTES[state.palette];
    const [g0, g1, g2] = palette.gradient;

    this.set3f("uGradient0", ...rgb(g0.color));
    this.set3f("uGradient1", ...rgb(g1.color));
    this.set3f("uGradient2", ...rgb(g2.color));
    this.set3f("uGradientAt", g0.at, g1.at, g2.at);
    this.set4f("uCausticColor", ...rgb(palette.caustic[0]), palette.caustic[1]);
    this.set4f("uHighlightColor", ...rgb(palette.highlight[0]), palette.highlight[1]);
    this.set4f("uSpecularColor", ...rgb(palette.specular[0]), palette.specular[1]);
    this.set4f("uFoamColor", ...rgb(palette.foam[0]), palette.foam[1]);
    this.set2f("uMapSize", state.width, state.height);
    this.set2f("uWakeOrigin", state.x, state.y);
    this.set2f("uWakeSize", state.wake.width, state.wake.height);

    this.bindTexture(depth, DEPTH_UNIT);
    this.bindTexture(caustics, CAUSTICS_UNIT);
    this.bindTexture(wake, WAKE_UNIT);
    this.bindTexture(shore, SHORE_UNIT);
    this.gl.activeTexture(this.gl.TEXTURE0);
  }
}
