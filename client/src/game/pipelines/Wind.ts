import { PipelineName } from "@server/types";
import { WIND_AMPLITUDE, WIND_SPEED } from "@server/globals";
import Phaser from "phaser";

const MultiPipeline = Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

export class WindPipeline extends MultiPipeline {
  public readonly wind = { amplitude: WIND_AMPLITUDE, speed: WIND_SPEED };
  private clock = 0;

  constructor(game: Phaser.Game, name: string = PipelineName.WIND) {
    super({
      name: name,
      game: game,
      vertShader: `
        #define SHADER_NAME WIND_VERT

        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif

        uniform mat4 uProjectionMatrix;

        uniform float wind_clock;
        uniform float wind_amplitude;

        attribute vec2 inPosition;
        attribute vec2 inTexCoord;
        attribute float inTexId;
        attribute float inTintEffect;
        attribute vec4 inTint;

        varying vec2 outTexCoord;
        varying float outTexId;
        varying float outTintEffect;
        varying vec4 outTint;

        void main() {
          vec2 position = inPosition;

          float vertexFactor = 1.0 - inTexCoord.y;
          float phase = inPosition.x * 0.03;
          float sway = sin(wind_clock + phase)
                     + 0.3 * sin(wind_clock * 2.3 + phase);

          position.x += sway * wind_amplitude * vertexFactor * vertexFactor;

          gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);

          outTexCoord = inTexCoord;
          outTexId = inTexId;
          outTint = inTint;
          outTintEffect = inTintEffect;
        }
      `,
    });
  }

  onPreRender() {
    super.onPreRender();

    this.clock =
      (this.clock + this.game.loop.delta * this.wind.speed) % (Math.PI * 20);

    this.set1f("wind_clock", this.clock);
    this.set1f("wind_amplitude", this.wind.amplitude);
  }
}
