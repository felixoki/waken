export const getBeamFrag = (): string => `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform vec2 uStart;
uniform vec2 uEnd;
uniform float uThickness;
uniform float uTime;
uniform vec3 uCore;
uniform vec3 uEdge;
uniform float uSeed;

varying vec2 outTexCoord;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main(void) {
  vec4 src = texture2D(uMainSampler, outTexCoord);

  /** fragment position in screen pixels, top-left origin */
  vec2 frag = vec2(outTexCoord.x, 1.0 - outTexCoord.y) * uResolution;

  vec2 axis = uEnd - uStart;
  float len = max(length(axis), 0.0001);
  vec2 adir = axis / len;
  vec2 nrm = vec2(-adir.y, adir.x);

  vec2 rel = frag - uStart;
  float u = dot(rel, adir) / len;
  float v = dot(rel, nrm) / (uThickness * 0.5);

  /** drop fragments outside the beam segment */
  if (u < 0.0 || u > 1.0 || abs(v) > 1.0) {
    gl_FragColor = src * 0.0;
    return;
  }

  vec2 uv = vec2(u, v * 0.5 + 0.5);

  /** distance from the centreline across the thickness */
  float d = abs(uv.y - 0.5) * 2.0;

  /** white-hot centreline, soft body, and a wide glow for pseudo-bloom */
  float core = pow(max(0.0, 1.0 - d), 2.5);
  float body = smoothstep(1.0, 0.0, d);
  float glow = smoothstep(1.0, 0.0, d) * 0.35;

  /** two layers of flowing noise streaming down the length */
  float flow = noise(vec2(uv.x * 10.0 - uTime * 4.0 + uSeed, uv.y * 3.0));
  flow += noise(vec2(uv.x * 22.0 + uTime * 7.0, uv.y * 5.0)) * 0.5;
  flow = 0.6 + flow * 0.55;

  /** soft fade at the muzzle and a longer taper at the tip */
  float ends = smoothstep(0.0, 0.05, uv.x) * smoothstep(1.0, 0.8, uv.x);

  vec3 col = mix(uEdge, uCore, min(1.0, core + flow * 0.2));
  float a = (body * flow + glow) * ends;

  gl_FragColor = vec4(col * a, a) + src * 0.0;
}
`;
