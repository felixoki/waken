import { PipelineName } from "@server/types";
import Phaser from "phaser";

const MultiPipeline = Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

export class WindPipeline extends MultiPipeline {
  private amplitude: number = 1.2;
  private speed: number = 0.0015;

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

        uniform float current_time;
        uniform float wind_amplitude;
        uniform float wind_speed;

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
          float sway = sin(current_time * wind_speed + phase)
                     + 0.3 * sin(current_time * wind_speed * 2.3 + phase);

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

    this.set1f("current_time", this.game.loop.time);
    this.set1f("wind_amplitude", this.amplitude);
    this.set1f("wind_speed", this.speed);
  }
}
