import { NOISE } from "./common";

export const getWellspringFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uRadius;
uniform float uSpread;
uniform float uFlash;
uniform float uFade;

varying vec2 fragCoord;

${NOISE}

const float TAU = 6.2831853;
const vec3 ABYSS = vec3(0.012, 0.075, 0.170);
const vec3 DEEP = vec3(0.020, 0.140, 0.290);
const vec3 BLUE = vec3(0.040, 0.300, 0.500);
const vec3 TEAL = vec3(0.090, 0.520, 0.640);
const vec3 CYAN = vec3(0.300, 0.840, 0.920);
const vec3 FOAM = vec3(0.800, 0.970, 1.000);

float cells(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = vec2(mod(i.x + o.x, period), i.y + o.y);
      vec2 pt = o + vec2(hash(c), hash(c + 7.3)) - f;
      float d = dot(pt, pt);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return sqrt(d2) - sqrt(d1);
}

void main(void) {
  vec2 p = fragCoord - resolution * 0.5;
  vec2 e = vec2(p.x, p.y / 0.6);
  float len = length(e);
  float r = len / max(uRadius, 1.0);
  float ang = atan(e.y, e.x);
  vec2 dir = e / max(len, 0.001);

  float shore = 1.0 + (fbm(dir * 1.6 + uSeed) - 0.47) * 0.34 + (noise(dir * 4.0 - uSeed) - 0.5) * 0.08;
  float rn = r / max(uSpread * shore, 0.001);

  float damp = fbm(e * 0.030 + uSeed * 3.0);
  float dry = smoothstep(uFade * 1.35 - 0.35, uFade * 1.35, damp * 0.65 + (1.0 - rn) * 0.35);
  float body = smoothstep(1.0, 0.86, rn) * dry;

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (body > 0.0) {
    float t = ang / TAU;
    float lr = log(max(r, 0.02));
    vec2 bend = vec2(
      fbm(e * 0.022 + uSeed + uTime * 0.06),
      fbm(e * 0.022 - uSeed + 9.1 - uTime * 0.05)
    ) - 0.47;

    vec2 ua = vec2(t * 11.0, lr * 11.0 / TAU - uTime * 0.30 + uSeed) + bend * 0.9;
    vec2 ub = vec2(t * 7.0 + 0.5, lr * 7.0 / TAU - uTime * 0.17 - uSeed) - bend * 0.7;
    float ca = cells(ua, 11.0);
    float cb = cells(ub, 7.0);

    float mid = smoothstep(0.07, 0.20, r);
    float centre = exp(-r * 2.4);
    float vary = 0.45 + 0.55 * smoothstep(0.25, 0.70, fbm(e * 0.045 - uSeed * 2.0));
    float net = smoothstep(0.090, 0.0, ca) * 0.75 + exp(-ca * 6.0) * 0.32;
    net += smoothstep(0.070, 0.0, cb) * 0.35 + exp(-cb * 5.0) * 0.14;
    net *= mid * vary * (1.0 - uFade * 0.7);

    float hue = fbm(e * 0.020 + uSeed + 4.0);
    vec3 base = mix(ABYSS, DEEP, smoothstep(0.30, 0.70, hue));
    base = mix(base, BLUE, centre * 0.8);

    alpha = body * (0.50 + 0.12 * hue);
    col = base * alpha;

    vec3 lit = mix(TEAL, CYAN, smoothstep(0.35, 0.65, fbm(e * 0.050 + uSeed + 11.0)));
    col += lit * net * body * (0.42 + 1.00 * centre);

    float rim = smoothstep(0.07, 0.0, abs(rn - 0.93 - (damp - 0.47) * 0.05));
    rim *= 0.35 + 0.65 * noise(dir * 5.0 + uSeed + 2.0);
    col += TEAL * rim * dry * (0.16 + 0.30 * uFlash) * (1.0 - uFade);

    float girth = 0.016 + 0.022 * noise(dir * 2.2 + uSeed + 6.0);
    float ring = smoothstep(girth, 0.0, abs(r - 0.13 - bend.x * 0.07 - (noise(dir * 3.0 - uSeed) - 0.5) * 0.05));
    col += mix(CYAN, FOAM, 0.6) * ring * body * (0.16 + 0.40 * uFlash) * (1.0 - uFade);
    col += CYAN * exp(-r * 7.0) * body * (0.18 + 0.45 * uFlash) * (1.0 - uFade);
  }

  float border = min(min(fragCoord.x, resolution.x - fragCoord.x), min(fragCoord.y, resolution.y - fragCoord.y));
  float fade = smoothstep(0.0, 24.0, border);

  gl_FragColor = vec4(col, alpha) * fade;
}
`;
