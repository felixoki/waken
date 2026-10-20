import { LIGHT_ANGLES } from "@server/globals";
import { getShadowmapFrag, getShadowmapVert } from "./frags/shadowmap";

export class Shadowmap {
  public texture: WebGLTexture;

  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private framebuffer: WebGLFramebuffer;
  private buffer: WebGLBuffer;
  private locations: {
    occluder: WebGLUniformLocation | null;
    world: WebGLUniformLocation | null;
    origins: WebGLUniformLocation | null;
    reach: WebGLUniformLocation | null;
  };

  constructor(gl: WebGLRenderingContext, lights: number) {
    this.gl = gl;
    this.program = this._program(getShadowmapVert(), getShadowmapFrag(lights));

    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      LIGHT_ANGLES,
      lights,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    this.locations = {
      occluder: gl.getUniformLocation(this.program, "uOccluder"),
      world: gl.getUniformLocation(this.program, "uWorld"),
      origins: gl.getUniformLocation(this.program, "uOrigins"),
      reach: gl.getUniformLocation(this.program, "uReach"),
    };
  }

  render(
    unit: number,
    width: number,
    height: number,
    origins: Float32Array,
    reach: Float32Array,
    count: number,
  ): void {
    const { gl, locations } = this;
    const viewport = gl.getParameter(gl.VIEWPORT) as Int32Array;
    const blend = gl.isEnabled(gl.BLEND);
    const scissor = gl.isEnabled(gl.SCISSOR_TEST);
    const framebuffer = gl.getParameter(
      gl.FRAMEBUFFER_BINDING,
    ) as WebGLFramebuffer | null;

    if (blend) gl.disable(gl.BLEND);
    if (scissor) gl.disable(gl.SCISSOR_TEST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, LIGHT_ANGLES, count);
    gl.useProgram(this.program);
    gl.uniform1i(locations.occluder, unit);
    gl.uniform2f(locations.world, width, height);
    gl.uniform2fv(locations.origins, origins);
    gl.uniform1fv(locations.reach, reach);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
    if (blend) gl.enable(gl.BLEND);
    if (scissor) gl.enable(gl.SCISSOR_TEST);
  }

  destroy(): void {
    const { gl } = this;

    gl.deleteProgram(this.program);
    gl.deleteFramebuffer(this.framebuffer);
    gl.deleteTexture(this.texture);
    gl.deleteBuffer(this.buffer);
  }

  private _program(vertex: string, fragment: string): WebGLProgram {
    const { gl } = this;
    const compile = (type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) ?? "shadowmap shader");

      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) ?? "shadowmap program");

    return program;
  }
}
