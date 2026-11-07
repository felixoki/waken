import { RefObject, useEffect, useRef, useState } from "react";

const TEXT = "waken";

const VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uVideo;
uniform sampler2D uMask;
uniform vec4 uMap;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uTime;
uniform float uLod;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec4 slide(vec2 st, float t, float w, float seed) {
  float col = floor(st.x / w);
  float n = hash(vec2(col, seed));
  float p = t * (0.06 + 0.06 * n) + n * 7.0;
  float cycle = floor(p);
  float h = hash(vec2(col + seed, cycle));
  if (h < 0.5) return vec4(0.0);
  float f = fract(p) * 6.0;
  float y = mix(-0.2, 1.2, (floor(f) + smoothstep(0.5, 1.0, fract(f))) / 6.0);
  float r = w * (0.24 + 0.1 * hash(vec2(col, cycle + seed)));
  float base = (col + 0.3 + 0.4 * h) * w;
  float cx = base + sin(y * 17.0 + n * 6.0) * w * 0.07;
  vec2 d = st - vec2(cx, y);
  d.y *= mix(0.8, 1.15, step(0.0, d.y));
  float drop = smoothstep(r, r * 0.5, length(d));
  float above = y - st.y;
  float tx = base + sin(st.y * 17.0 + n * 6.0) * w * 0.07;
  float band = smoothstep(r * 0.75, r * 0.4, abs(st.x - tx));
  float trail = band * step(0.0, above) * smoothstep(0.6, 0.05, above);
  float gap = 0.03;
  float row = floor(st.y / gap);
  vec2 bd = vec2(st.x - tx, (fract(st.y / gap) - 0.5) * gap);
  float keep = step(0.75, hash(vec2(col * 3.1 + row, cycle + seed)));
  float bead = smoothstep(r * 0.32, r * 0.12, length(bd)) * keep * smoothstep(0.03, 0.08, above) * trail;
  return vec4(d / r * drop + bd / (r * 0.4) * bead, max(drop, bead), trail);
}

vec3 beads(vec2 st, float t) {
  float g = 0.05;
  vec2 id = floor(st / g);
  float a = hash(id);
  float b = hash(id + 17.3);
  vec2 c = (id + 0.25 + 0.5 * vec2(a, b)) * g;
  float r = g * (0.08 + 0.17 * hash(id + 5.7));
  float life = fract(t * 0.05 + b * 9.0);
  float fade = smoothstep(0.0, 0.1, life) * smoothstep(1.0, 0.6, life) * step(0.72, a);
  vec2 d = st - c;
  float m = smoothstep(r, r * 0.45, length(d)) * fade;
  return vec3(d / r * m, m);
}

vec3 video(vec2 uv, float lod) {
  return textureLod(uVideo, uv, lod).rgb;
}

void main() {
  vec4 mask = texture(uMask, vUv);
  float a = mask.r;
  if (a < 0.003) {
    outColor = vec4(0.0);
    return;
  }

  vec2 px = 2.0 / uRes;
  float hl = texture(uMask, vUv - vec2(px.x, 0.0)).g;
  float hr = texture(uMask, vUv + vec2(px.x, 0.0)).g;
  float hu = texture(uMask, vUv - vec2(0.0, px.y)).g;
  float hd = texture(uMask, vUv + vec2(0.0, px.y)).g;
  vec2 grad = vec2(hr - hl, hd - hu);
  float h = mask.g;

  float aspect = uRes.x / uRes.y;
  vec2 st = vUv * vec2(aspect, 1.0);
  vec4 s1 = slide(st, uTime, 0.075, 1.0);
  vec4 s2 = slide(st + vec2(0.031, 0.0), uTime * 0.8, 0.11, 7.0);
  vec3 b = beads(st, uTime);

  float clear = max(s1.w, s2.w);
  float bead = b.z * (1.0 - clear);
  float drop = max(max(s1.z, s2.z), bead);
  vec2 lens = s1.xy + s2.xy + b.xy * (1.0 - clear);

  vec2 o = (grad * 0.6 - lens * 0.05) / vec2(aspect, 1.0);
  vec2 uv = uMap.xy + (vUv + o) * uMap.zw;
  vec2 ca = o * 0.35 * uMap.zw;
  vec3 sharp = vec3(
    textureLod(uVideo, uv + ca, uLod).r,
    textureLod(uVideo, uv, uLod).g,
    textureLod(uVideo, uv - ca, uLod).b
  );
  vec2 k = 0.01 * uMap.zw * vec2(1.0, aspect);
  vec3 frost = 0.25 * (
    video(uv + vec2(k.x, k.y), uLod + 3.5) +
    video(uv + vec2(-k.x, k.y), uLod + 3.5) +
    video(uv + vec2(k.x, -k.y), uLod + 3.5) +
    video(uv + vec2(-k.x, -k.y), uLod + 3.5)
  );
  frost = frost * 0.88 + 0.07;

  float fog = (1.0 - clear) * (1.0 - drop);
  vec3 col = mix(sharp * 0.9, frost, fog * 0.75);
  col *= 1.0 - smoothstep(0.0, 0.25, drop) * smoothstep(0.55, 0.25, drop) * 0.15;

  vec3 nrm = normalize(vec3(-grad * 6.0 - lens * 0.6, 1.0));
  vec3 l = normalize(vec3(uLight, 0.9));
  float spec = pow(max(dot(reflect(-l, nrm), vec3(0.0, 0.0, 1.0)), 0.0), 36.0);
  float rim = 1.0 - smoothstep(0.3, 0.85, h);
  float shade = dot(nrm.xy, -uLight) * 0.5 + 0.5;

  col += rim * (0.12 + 0.18 * shade);
  col += spec * 0.6;
  col += drop * 0.03;

  outColor = vec4(col * a, a);
}`;

type Props = {
  video: RefObject<HTMLVideoElement | null>;
  active: boolean;
  className?: string;
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
};

const link = (gl: WebGL2RenderingContext) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
};

const alpha = (canvas: HTMLCanvasElement, draw: (ctx: CanvasRenderingContext2D) => void) => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  draw(ctx);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
};

export function GlassTitle({ video, active, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<() => void>(() => {});
  const activeRef = useRef(active);
  const [fallback, setFallback] = useState(false);
  activeRef.current = active;

  useEffect(() => {
    if (active) startRef.current();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false });
    const program = gl && link(gl);
    if (!gl || !program) {
      setFallback(true);
      return;
    }

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const u = {
      video: uniform("uVideo"),
      mask: uniform("uMask"),
      map: uniform("uMap"),
      res: uniform("uRes"),
      light: uniform("uLight"),
      time: uniform("uTime"),
      lod: uniform("uLod"),
    };

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const videoTex = gl.createTexture();
    const maskTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.useProgram(program);
    gl.uniform1i(u.video, 0);
    gl.uniform1i(u.mask, 1);

    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    let fontPx = 0;
    let font = "";
    const light = [-0.5, -0.8];
    const target = [-0.5, -0.8];
    const map = [0, 0, 1, 1];
    let videoSize = 0;
    let videoTime = -1;
    let hasVideo = false;
    let ready = false;
    let frame = 0;
    let last = 0;
    let disposed = false;
    const epoch = performance.now();

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      fontPx = Math.min(rootPx * 15, window.innerWidth * 0.18);
      font = `${fontPx}px Arco`;
      const measure = document.createElement("canvas").getContext("2d");
      if (!measure) return;
      measure.font = font;
      const m = measure.measureText(TEXT);
      const pad = fontPx * 0.2;
      const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight + pad * 2);
      const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + pad * 2);
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = pw;
      canvas.height = ph;

      const glyphs = document.createElement("canvas");
      glyphs.width = pw;
      glyphs.height = ph;
      const sharp = alpha(glyphs, (ctx) => {
        ctx.scale(dpr, dpr);
        ctx.font = font;
        ctx.fillStyle = "#fff";
        ctx.fillText(TEXT, pad + m.actualBoundingBoxLeft, pad + m.actualBoundingBoxAscent);
      });
      const blurred = document.createElement("canvas");
      blurred.width = pw;
      blurred.height = ph;
      const soft = alpha(blurred, (ctx) => {
        ctx.filter = `blur(${fontPx * 0.045 * dpr}px)`;
        ctx.drawImage(glyphs, 0, 0);
      });
      if (!sharp || !soft) return;

      const data = new Uint8Array(pw * ph * 4);
      for (let i = 3; i < data.length; i += 4) {
        data[i - 3] = sharp[i];
        data[i - 2] = soft[i];
        data[i] = 255;
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pw, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      gl.viewport(0, 0, pw, ph);
      gl.uniform2f(u.res, pw, ph);
      ready = true;
    };

    const upload = (v: HTMLVideoElement) => {
      if (v.readyState < 2 || v.currentTime === videoTime) return;
      videoTime = v.currentTime;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, videoTex);
      if (!videoSize) {
        videoSize = Math.floor(Math.log2(Math.max(v.videoWidth, v.videoHeight))) + 1;
        gl.texStorage2D(gl.TEXTURE_2D, videoSize, gl.RGBA8, v.videoWidth, v.videoHeight);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, v);
      gl.generateMipmap(gl.TEXTURE_2D);
      hasVideo = true;
    };

    const place = (v: HTMLVideoElement) => {
      const rect = canvas.getBoundingClientRect();
      const s = Math.max(window.innerWidth / v.videoWidth, window.innerHeight / v.videoHeight);
      const dw = v.videoWidth * s;
      const dh = v.videoHeight * s;
      map[0] = (rect.left - (window.innerWidth - dw) / 2) / dw;
      map[1] = (rect.top - (window.innerHeight - dh) / 2) / dh;
      map[2] = rect.width / dw;
      map[3] = rect.height / dh;
      const dpr = Math.min(window.devicePixelRatio, 2);
      gl.uniform4f(u.map, map[0], map[1], map[2], map[3]);
      gl.uniform1f(u.lod, Math.max(0, Math.log2(v.videoWidth / (dw * dpr))));
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed || !activeRef.current) return;
      frame = requestAnimationFrame(tick);
      const v = video.current;
      if (!ready || !v || !v.videoWidth) return;

      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const k = 1 - Math.exp(-dt * 3);
      light[0] += (target[0] - light[0]) * k;
      light[1] += (target[1] - light[1]) * k;

      upload(v);
      if (!hasVideo) return;
      place(v);
      gl.uniform2f(u.light, light[0], light[1]);
      gl.uniform1f(u.time, (now - epoch) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const start = () => {
      if (frame || disposed) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    startRef.current = start;

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      target[0] = Math.max(-1.2, Math.min(1.2, x));
      target[1] = Math.max(-1.2, Math.min(1.2, y));
    };

    const onResize = () => layout();

    window.addEventListener("pointermove", onPointer);
    window.addEventListener("resize", onResize);
    document.fonts.load(`${rootPx}px Arco`).then(() => {
      if (disposed) return;
      layout();
      start();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      startRef.current = () => {};
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      gl.deleteTexture(videoTex);
      gl.deleteTexture(maskTex);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, []);

  if (fallback)
    return (
      <h1 className={`font-arco text-white text-[15rem] leading-none ${className ?? ""}`}>
        {TEXT}
      </h1>
    );

  return <canvas ref={canvasRef} className={className} />;
}
