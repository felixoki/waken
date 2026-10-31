import { PipelineName } from "@server/types";
import {
  MEADOW_ACCENTS,
  MEADOW_BENT,
  MEADOW_BENT_SHADE,
  MEADOW_CHARACTERS,
  MEADOW_FRAMERATE,
  MEADOW_LEAN,
  MEADOW_PALETTES,
  MEADOW_PUSH,
  MEADOW_PUSH_RADIUS,
  MEADOW_PUSH_SQUASH,
  MEADOW_SPACING,
  MEADOW_SWAY,
  MEADOW_SWAY_SPEED,
  MEADOW_WIND,
  MEADOW_WIND_SCALE,
  MEADOW_WIND_SPEED,
} from "@server/globals";
import { getMeadowFrag, getMeadowVert } from "./frags/meadow";
import { water } from "../handlers/water";
import type { Meadow } from "../handlers/meadow";
import Phaser from "phaser";

const SinglePipeline = Phaser.Renderer.WebGL.Pipelines.SinglePipeline;

const BLADES_UNIT = 1;
const MASK_UNIT = 2;
const PATTERN_UNIT = 3;
const PATTERN_SIZE = 538;
const BLADE_TEXTURE = "meadow_blades";

const rgb = (color: number): [number, number, number] => [
  ((color >> 16) & 0xff) / 255,
  ((color >> 8) & 0xff) / 255,
  (color & 0xff) / 255,
];

export class MeadowPipeline extends SinglePipeline {
  private meadow?: Meadow;

  constructor(game: Phaser.Game, name: string = PipelineName.MEADOW) {
    super({
      name: name,
      game: game,
      vertShader: getMeadowVert(),
      fragShader: getMeadowFrag(),
    });
  }

  boot() {
    super.boot();


    this.set1i("uBlades", BLADES_UNIT);
    this.set1i("uMask", MASK_UNIT);
    this.set1i("uPattern", PATTERN_UNIT);
    this.set1f("uPatternSize", PATTERN_SIZE);
    this.set1f("uSpacing", MEADOW_SPACING);
    this.set2f("uAccents", MEADOW_ACCENTS[0], MEADOW_ACCENTS[1]);
    this.set1f("uFramerate", MEADOW_FRAMERATE);
    this.set2f("uWind", MEADOW_WIND[0], MEADOW_WIND[1]);
    this.set1f("uWindScale", MEADOW_WIND_SCALE);
    this.set1f("uWindSpeed", MEADOW_WIND_SPEED);
    this.set1f("uLean", MEADOW_LEAN);
    this.set1f("uSway", MEADOW_SWAY);
    this.set1f("uSwaySpeed", MEADOW_SWAY_SPEED);
    this.set1f("uPushRadius", MEADOW_PUSH_RADIUS);
    this.set1f("uPush", MEADOW_PUSH);
    this.set1f("uPushSquash", MEADOW_PUSH_SQUASH);
    this.set1f("uBent", MEADOW_BENT);
    this.set1f("uBentShade", MEADOW_BENT_SHADE);
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
    const state = gameObject?.getData("meadow") as Meadow | undefined;
    if (!state || state === this.meadow) return;

    this.flush();
    this.meadow = state;
  }

  onBeforeFlush() {
    const state = this.meadow;
    const blades = this.game.textures.get(BLADE_TEXTURE).source[0].glTexture;
    const mask = state?.mask.source[0].glTexture;
    if (!state || !blades || !mask) return;

    if (state.baking) {
      this.set2f("uWorldView", state.x, state.y);
      this.set1f("uZoom", 1);
    }

    const palette = MEADOW_PALETTES[state.palette];
    const pattern = this.game.textures.get(palette.pattern).source[0].glTexture;
    const [accent0, accent1] = palette.accents;

    if (pattern) this.bindTexture(pattern, PATTERN_UNIT);
    this.set3f("uFill", ...rgb(palette.fill));
    this.set3f("uAccent0", ...rgb(accent0));
    this.set3f("uAccent1", ...rgb(accent1));
    this.set2f("uMapSize", state.width, state.height);
    this.set1f("uTile", state.tile);
    this.set4fv("uCharacters", state.characters);
    this.set1f("uCount", Math.min(state.count, MEADOW_CHARACTERS));

    this.bindTexture(blades, BLADES_UNIT);
    this.bindTexture(mask, MASK_UNIT);
    this.gl.activeTexture(this.gl.TEXTURE0);
  }
}
