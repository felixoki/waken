import { LIGHT_OFFSET } from "@server/globals";
import { PipelineName } from "@server/types";
import { getLightFrag } from "./frags/light";
import { Shadowmap } from "./Shadowmap";
import { light as lighting } from "../handlers/light";
import type { Scene } from "../scenes/Scene";
import type { LightMask } from "../managers/Tile";

const LightPipeline = Phaser.Renderer.WebGL.Pipelines.LightPipeline;

export class OccludedLightPipeline extends LightPipeline {
  private occluder: Phaser.Renderer.WebGL.Wrappers.WebGLTextureWrapper | null =
    null;
  private mask: LightMask | null = null;
  private shadowmap: Shadowmap | null = null;
  private origins: Float32Array;
  private reach: Float32Array;
  private count = 0;
  private pending = false;
  private limit: number;

  constructor(game: Phaser.Game) {
    super({ name: PipelineName.LIGHT, game, fragShader: getLightFrag() });

    this.limit = game.config.maxLights;
    this.origins = new Float32Array(this.limit * 2);
    this.reach = new Float32Array(this.limit);
  }

  onRender(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera): void {
    super.onRender(scene, camera);

    const { lightMask, tileManager, illumination } = scene as Scene;
    this.occluder = lightMask?.source[0].glTexture ?? null;
    this.mask =
      this.occluder && tileManager ? tileManager.getLightMask() : null;

    this.set1f("uBoost", illumination?.boost ?? 1);
    this.set1f("uOcclusion", this.mask ? 1 : 0);
    if (!this.mask || !this.lightsActive) return;

    const lights = scene.lights.getLights(camera) as unknown as {
      light: Phaser.GameObjects.Light;
    }[];
    this.count = Math.min(lights.length, this.limit);

    for (let i = 0; i < this.count; i++) {
      const { x, y, radius } = lights[i].light;

      this.origins[i * 2] = x;
      const ground = lighting.ground(this.mask, x, y);
      this.origins[i * 2 + 1] = ground === y ? y : ground + LIGHT_OFFSET;
      this.reach[i] = radius;
    }

    this.pending = this.count > 0;
    this.set2f("uView", camera.worldView.x, camera.worldView.y);
    this.set1f("uViewHeight", this.renderer.height);
    this.set2f("uWorld", this.mask.width, this.mask.height);
    this.set2fv("uOrigins", this.origins);
    this.set1fv("uReach", this.reach);
  }

  onBeforeFlush(): void {
    if (!this.occluder || !this.mask) return;

    const gl = this.gl;
    this.shadowmap ??= new Shadowmap(gl, this.limit);

    this.bindTexture(this.occluder, 2);

    if (this.pending) {
      this.pending = false;
      this.shadowmap.render(
        2,
        this.mask.width,
        this.mask.height,
        this.origins,
        this.reach,
        this.count,
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.webGLBuffer);
      gl.useProgram(this.currentShader.program.webGLProgram);
      this.currentShader.setAttribPointers(true);
    }

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowmap.texture);
    gl.activeTexture(gl.TEXTURE0);
    this.activeTextures.length = 0;

    this.set1i("uOccluder", 2);
    this.set1i("uShadows", 3);
  }

  destroy(): this {
    this.shadowmap?.destroy();
    this.shadowmap = null;

    return super.destroy();
  }
}
