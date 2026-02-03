import Phaser from "phaser";

const MultiPipeline = Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

export class BouncePipeline extends MultiPipeline {
  private startTime: number = -999999;
  private amplitude: number = 0.1;
  private speed: number = 1.5;
  private damping: number = 2.5;
  private frequency: number = 10.0;
  private phase: number = 0;

  constructor(game: Phaser.Game, name: string = "bounce") {
    super({
      name: name,
      game: game,
      vertShader: `
        #define SHADER_NAME BOUNCE_VERT
        
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        
        uniform mat4 uProjectionMatrix;
        
        uniform float bounce_start_time;
        uniform float bounce_amplitude;
        uniform float bounce_speed;
        uniform float bounce_damping;
        uniform float bounce_frequency;
        uniform float bounce_phase;
        uniform float current_time;
        
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
          
          // Calculate bounce effect using global time
          float elapsed = current_time - bounce_start_time;
          
          if (elapsed > 0.0 && elapsed < 2000.0) {
            // Apply bounce based on vertex Y position (top vertices move more)
            float normalizedY = inTexCoord.y; // 0 at top, 1 at bottom
            float vertexFactor = 1.0 - normalizedY; // Top vertices = 1, bottom = 0
            
            // Damped oscillation
            float decay = exp(-bounce_damping * elapsed / 1000.0);
            float wave = sin(elapsed * bounce_speed * bounce_frequency / 1000.0 + bounce_phase);
            float displacement = bounce_amplitude * wave * decay * vertexFactor;
            
            // Apply horizontal displacement (sway effect)
            position.x += displacement * 100.0; // Scale for visible effect
          }
          
          gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);
          
          outTexCoord = inTexCoord;
          outTexId = inTexId;
          outTint = inTint;
          outTintEffect = inTintEffect;
        }
      `,
      // Don't specify fragShader - use default MultiPipeline fragment shader
    });
  }

  onPreRender() {
    super.onPreRender();

    this.set1f("bounce_start_time", this.startTime);
    this.set1f("bounce_amplitude", this.amplitude);
    this.set1f("bounce_speed", this.speed);
    this.set1f("bounce_damping", this.damping);
    this.set1f("bounce_frequency", this.frequency);
    this.set1f("bounce_phase", this.phase);
    this.set1f("current_time", this.game.loop.time);
  }

  trigger(
    amplitude: number = 0.1,
    speed: number = 1.5,
    damping: number = 2.5,
    frequency: number = 10.0,
  ) {
    this.startTime = this.game.loop.time;
    this.amplitude = amplitude;
    this.speed = speed;
    this.damping = damping;
    this.frequency = frequency;
    this.phase = Math.random() * Math.PI * 2;
  }
}
