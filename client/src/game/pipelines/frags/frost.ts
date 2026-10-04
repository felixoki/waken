export const getFrostFrag = (): string => `
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uRadius;
uniform float uCrack;
uniform float uGlow;
uniform float uFrost;
uniform float uFade;

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
  for (int i = 0; i < 3; i++) {
    v += amp * noise(p);
    p = p * 2.03 + 17.1;
    amp *= 0.5;
  }
  return v;
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

const float SPOKES = 9.0;
const vec3 DEEP = vec3(0.300, 0.540, 0.900);
const vec3 GLOW = vec3(0.230, 0.560, 0.980);
const vec3 RIM = vec3(0.620, 0.880, 1.000);
const vec3 HOT = vec3(0.930, 0.985, 1.000);
const vec3 ICE = vec3(0.740, 0.900, 1.000);
const vec3 SHADE = vec3(0.520, 0.760, 0.970);

void main(void) {
  vec2 px = floor(fragCoord) + 0.5;
  vec2 p = px - resolution * 0.5;
  vec2 e = vec2(p.x, p.y / 0.58);
  float dither = bayer4(px);

  float rad = length(e);
  float ang = atan(e.y, e.x);

  float an = (ang + 3.14159265) / 6.2831853 * SPOKES;
  float wig = (noise(vec2(rad * 0.16 + uSeed, floor(an) + uSeed)) - 0.5) * 0.9;
  wig *= smoothstep(0.0, 10.0, rad);
  float fa = fract(an + wig * 0.5);
  float spoke = mod(floor(an + wig * 0.5), SPOKES);
  float reach = uRadius * (0.55 + 0.45 * hash(vec2(spoke, uSeed)));
  float width = abs(fa - 0.5) * rad * (6.2831853 / SPOKES);
  float tip = reach * uCrack;
  float thin = mix(0.85, 0.35, clamp(rad / max(reach, 0.001), 0.0, 1.0));

  float crack = 0.0;
  if (rad < tip && width < thin) crack = 1.0;

  float web = fbm(e * 0.13 + uSeed * 3.0);
  if (abs(web - 0.5) < 0.014 && rad < uRadius * 0.7 * uCrack) crack = 1.0;

  float near = 0.0;
  if (rad < tip + 2.0) near = exp(-width / 2.4);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  float body = fbm(e * 0.085 + uSeed) * 0.62 + 0.72 - rad / max(uRadius * uFrost, 0.001);
  body -= uFade * 1.5;

  if (uFrost > 0.01 && body > 0.0) {
    vec3 c = ICE;
    float tone = fbm(e * 0.16 - uSeed) + (dither - 0.5) * 0.22;
    if (tone < 0.44) c = SHADE;
    if (body < 0.13) c = SHADE;
    if (body < 0.05) c = HOT;

    float feather = noise(vec2(ang * 9.0 + uSeed, rad * 0.5));
    if (body < 0.20 && feather > 0.62) c = HOT;

    if (hash(px + floor(uTime * 9.0) * 3.7) > 0.990) c = HOT;

    alpha = 0.78;
    if (c == HOT) alpha = 1.0;
    if (body < 0.10 && dither > body * 10.0 + 0.2 && c != HOT) alpha = 0.0;
    col = c * alpha;

    if (crack > 0.5) {
      col = mix(DEEP, HOT, uGlow);
      alpha = 1.0;
    }
  } else if (uFade < 0.9) {
    float live = 1.0 - uFade;
    if (crack > 0.5) {
      col = mix(DEEP, HOT, uGlow) * live;
      alpha = live;
      if (live < dither) {
        col = vec3(0.0);
        alpha = 0.0;
      }
    } else if (uGlow > 0.01) {
      float halo = near * uGlow;
      if (halo > dither * 0.8 + 0.25) col += GLOW * 0.42;
      if (halo > dither * 0.5 + 0.62) col += RIM * 0.35;

      float pool = exp(-rad / (uRadius * 0.34)) * uGlow * uCrack;
      if (pool > dither * 0.9 + 0.2) col += GLOW * 0.22;
    }
  }

  gl_FragColor = vec4(col, alpha);
}
`;
