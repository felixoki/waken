export const getWaveFrag = (): string => `
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uFacing;
uniform float uSpread;
uniform float uFront;
uniform float uThick;
uniform float uSweep;
uniform float uErode;

varying vec2 fragCoord;

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

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = p * 2.03 + 17.1;
    amp *= 0.5;
  }
  return v;
}

const vec3 SHADE = vec3(0.018, 0.028, 0.052);
const vec3 INDIGO = vec3(0.035, 0.080, 0.230);
const vec3 BLUE = vec3(0.040, 0.250, 0.520);
const vec3 DEEP = vec3(0.020, 0.170, 0.270);
const vec3 TEAL = vec3(0.040, 0.390, 0.530);
const vec3 MOSS = vec3(0.050, 0.420, 0.440);
const vec3 LIGHT = vec3(0.120, 0.590, 0.720);
const vec3 CYAN = vec3(0.200, 0.700, 0.780);
const vec3 EDGE = vec3(0.230, 0.630, 0.800);
const vec3 SHEEN = vec3(0.560, 0.860, 0.950);

void main(void) {
  vec2 p = fragCoord - resolution * 0.5;
  p.y = -p.y;

  float cs = cos(uFacing);
  float sn = sin(uFacing);
  vec2 q = vec2(p.x * cs + p.y * sn, -p.x * sn + p.y * cs);

  float r = length(q);
  float a = atan(q.y, q.x);
  float u = a / uSpread;

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (uFront > 0.5 && abs(u) < 1.08 && r < uFront + 22.0) {
    float k = 52.0 / uThick;
    float s = a * max(r, 6.0) * k;
    float along = clamp((u + 1.0) * 0.5, 0.0, 1.0);
    float body = smoothstep(0.0, 0.34, along);
    float profile = pow(smoothstep(1.0, 0.76, along), 0.7) * (0.70 + 0.30 * body);
    float thick = uThick * profile;
    float life = 1.0 - smoothstep(0.5, 1.0, uErode);

    float lumpy = (noise(vec2(a * 1.1 + uSeed, 3.0)) - 0.5) * 0.11 + (noise(vec2(a * 2.6 - uSeed, 8.0)) - 0.5) * 0.04;
    float d = uFront * (1.0 + lumpy) - r;
    float dk = d * k;
    float v = d / max(thick, 0.001);
    float reveal = smoothstep(0.0, 0.08, uSweep * 1.2 - along);

    float warp = fbm(vec2(s * 0.030 - uTime * 1.5 + uSeed, dk * 0.080 + uSeed));
    float streak = fbm(vec2(s * 0.060 - uTime * 2.2 + warp * 1.6, dk * 0.20 + warp * 1.2 + uSeed));
    float fine = noise(vec2(s * 0.090 - uTime * 3.5, dk * 0.50 - uSeed));
    float n = streak * 0.75 + fine * 0.25;

    float gate = (v - 0.62) * 0.90 + (1.0 - body) * 0.42 + uErode * 0.9 + 0.10;
    float dens = smoothstep(gate - 0.07, gate + 0.07, n);

    float soft = smoothstep(0.0, 0.42, v + (n - 0.5) * 0.36);
    float shape = soft * smoothstep(1.5, 1.0, v) * smoothstep(0.0, 0.10, along) * step(0.001, profile);
    float mask = dens * shape * reveal;

    if (mask > 0.0) {
      float core = smoothstep(0.90, 0.40, v) * smoothstep(0.10, 0.45, v) * smoothstep(0.05, 0.55, along) * (1.0 - uErode * 0.6);

      float hue = fbm(q * k * 0.028 + uSeed + 7.0);
      float patchy = noise(q * k * 0.075 - uSeed) * 0.6 + noise(vec2(s * 0.05, dk * 0.12) + uSeed) * 0.4;
      float brushy = noise(vec2(s * 0.16 + uSeed, dk * 0.05));

      vec3 c = mix(BLUE, TEAL, smoothstep(0.30, 0.62, hue));
      c = mix(c, MOSS, smoothstep(0.62, 0.82, hue) * 0.7);
      c = mix(DEEP, c, smoothstep(0.25, 0.65, n));
      c = mix(c, LIGHT, core * smoothstep(0.40, 0.72, patchy) * 0.75);
      c = mix(c, CYAN, core * smoothstep(0.68, 0.88, patchy) * 0.55);
      c = mix(c, INDIGO, smoothstep(0.40, 1.1, v) * 0.80 + smoothstep(0.55, 0.25, hue) * 0.30);
      c *= 0.58 + 0.20 * brushy + 0.18 * n;

      float pall = fbm(vec2(s * 0.022 - uTime * 1.1 + uSeed * 5.0, dk * 0.060 - uTime * 0.5));
      float shroud = smoothstep(0.42, 0.72, pall) * 0.36;
      c = mix(c, SHADE * 1.3, shroud);

      alpha = mask * 0.95 * life;
      col = c * alpha;
    }

    {
      float edge = d < 0.0 ? exp(d / (5.0 + uThick * 0.12)) : exp(-max(v - 0.9, 0.0) * 2.5);
      float halo = edge * profile * reveal * life * body;
      float uneven = smoothstep(0.25, 0.75, fbm(q * k * 0.035 + uSeed + 3.0));
      float murk = halo * 0.20 * uneven * (1.0 - alpha);
      col = col * (1.0 - murk) + SHADE * murk;
      alpha = alpha * (1.0 - murk) + murk;
      col += TEAL * halo * 0.05 * uneven * (1.0 - alpha * 0.8);
    }
  }

  gl_FragColor = vec4(col, alpha);
}
`;
