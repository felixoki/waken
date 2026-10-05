import { NOISE } from "./common";

export const getSunderFrag = (): string => `
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uGround;
uniform float uLayer;
uniform float uRadius;
uniform float uSmoke;
uniform float uBeam;
uniform float uCrack;
uniform float uGlow;
uniform float uWave;
uniform float uShaft;
uniform float uFade;

varying vec2 fragCoord;
${NOISE}
const float SQUASH = 0.60;
const float SECTORS = 7.0;
const float RING = 0.30;
const vec3 ABYSS = vec3(0.025, 0.040, 0.075);
const vec3 SLATE = vec3(0.320, 0.400, 0.460);
const vec3 DEEP = vec3(0.070, 0.300, 0.520);
const vec3 TEAL = vec3(0.170, 0.580, 0.700);
const vec3 CYAN = vec3(0.330, 0.800, 0.920);
const vec3 PALE = vec3(0.740, 0.950, 1.000);

vec3 web(vec2 q) {
  vec2 i = floor(q);
  vec2 f = fract(q);
  float d1 = 8.0;
  float d2 = 8.0;
  float id = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 cell = vec2(mod(i.x + o.x, SECTORS), i.y + o.y);
      vec2 pt = o + 0.08 + 0.84 * vec2(hash(cell + uSeed), hash(cell + uSeed + 7.3)) - f;
      float d = dot(pt, pt);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = hash(cell + 3.1);
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return vec3(sqrt(d2) - sqrt(d1), id, sqrt(d1));
}

vec3 cracks(vec2 p) {
  vec2 e = vec2(p.x, p.y / SQUASH);
  float rn = length(e) / uRadius;
  float ang = atan(e.y, e.x);
  float turn = (ang + 3.14159265) / 6.2831853;
  vec2 dir = vec2(cos(ang), sin(ang));

  float kink = (noise(dir * 1.2 + rn * 0.9 + uSeed) - 0.5) * 0.12;
  float bend = (noise(dir * 2.6 + rn * 1.6 - uSeed) - 0.5) * 0.05;
  vec2 q = vec2(turn * SECTORS + kink + bend, log(max(rn, 0.02)) * 0.92 + kink * 0.4 - bend + uSeed);
  vec3 w = web(q);

  float span = rn * uRadius * (6.2831853 / SECTORS);
  float dist = w.x * span * 0.5;
  float ring = abs(rn - RING - (noise(dir * 1.5 + uSeed) - 0.5) * 0.03) * uRadius;

  float arcA = abs(rn - 3.05 - (noise(dir * 1.3 + uSeed + 2.0) - 0.5) * 0.30) * uRadius;
  arcA += (1.0 - smoothstep(0.56, 0.62, noise(dir * 1.9 + uSeed + 14.0))) * 99.0;
  float arcB = abs(rn - 3.75 - (noise(dir * 1.1 - uSeed + 5.0) - 0.5) * 0.36) * uRadius;
  arcB += (1.0 - smoothstep(0.60, 0.66, noise(dir * 2.3 - uSeed + 23.0))) * 99.0;

  return vec3(min(min(dist, ring), min(arcA, arcB)), rn, w.y);
}

void main(void) {
  vec2 p = vec2(fragCoord.x - resolution.x * 0.5, fragCoord.y - uGround);
  float live = 1.0 - clamp(uFade, 0.0, 1.0);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec2 e = vec2(p.x, p.y / SQUASH);
  float rad = length(e);
  float ang = atan(e.y, e.x);
  vec2 dir = vec2(cos(ang), sin(ang));
  float rn = rad / uRadius;
  float near = smoothstep(0.5, -0.9, dir.y);

  if (uLayer < 0.5) {
    float woke = uCrack;
    float shade = smoothstep(4.80, 2.00, rn) * woke * (0.66 + 0.22 * uBeam) * live;
    shade = max(shade, smoothstep(1.10, 0.0, abs(rn - 3.9)) * uBeam * 0.55);
    col = ABYSS * shade;
    alpha = shade;

    if (uSmoke > 0.001) {
      float rs = rn * 0.764;
      float lobe = fbm(dir * 2.3 + uSeed);
      float reach = (1.30 + 2.10 * lobe) * (0.60 + 0.85 * near) * uSmoke;
      float body = smoothstep(reach, reach * 0.20, rs);
      float streak = fbm(dir * 3.6 + vec2(rs * 1.8 - uTime * 0.4, uSeed));
      float petal = body * smoothstep(0.22, 0.58, streak) * smoothstep(0.06, 0.26, rs);
      float soot = body * smoothstep(0.34, 0.22, streak) * 0.40;

      float a = petal * 0.70 * uSmoke;
      col = col * (1.0 - a) + SLATE * (0.75 + 0.35 * streak) * a;
      alpha = alpha * (1.0 - a) + a;

      float b = max(soot, exp(-rs * 9.0) * 0.75) * uSmoke;
      col = col * (1.0 - b) + ABYSS * 0.7 * b;
      alpha = alpha * (1.0 - b) + b;
    }

    if (uCrack > 0.001) {
      vec3 c = cracks(p);
      vec3 under = cracks(p + vec2(0.0, 2.2));

      float front = uCrack * 4.4;
      float grown = smoothstep(front, front - 0.40, rn);
      float tear = smoothstep(0.54, 0.40, noise(dir * 3.4 + rn * 2.2 + uSeed) * smoothstep(1.40, 3.60, rn));
      tear *= smoothstep(0.16, 0.30, noise(vec2(c.z * 13.0, rn * 2.2) + uSeed) + 0.25 * (1.0 - smoothstep(0.3, 1.0, rn)));
      float gaps = smoothstep(0.30, 0.40, noise(e * 0.090 + uSeed * 2.0)) * smoothstep(0.22, 0.30, noise(e * 0.260 - uSeed));
      float keep = grown * tear * gaps * step(RING - 0.02, rn);

      float burst = uBeam;
      float rough = noise(e * 0.200 + uSeed * 3.0);
      float width = mix(0.42, 0.62, burst) * (0.65 + 0.70 * c.z) * mix(1.0, smoothstep(4.2, 1.0, rn), 0.35) * (0.35 + 1.50 * rough * rough);
      float line = smoothstep(width, width * 0.25, c.x) * keep;

      float vein = abs(fbm(e * 0.085 + uSeed * 4.0) - 0.5);
      float patchy = smoothstep(0.50, 0.66, noise(e * 0.045 + uSeed + 9.0)) * smoothstep(8.0, 1.0, c.x);
      float chip = smoothstep(0.010, 0.003, vein) * patchy * grown * step(RING, rn) * 0.7;
      line = max(line, chip);
      float lift = smoothstep(width * 1.2, 0.0, under.x) * keep * (0.25 + 0.35 * burst);

      float dark = max(lift * 0.55, line * 0.80) * live;
      col = col * (1.0 - dark) + ABYSS * 0.5 * dark;
      alpha = alpha * (1.0 - dark) + dark;

      float flick = 0.70 + 0.50 * noise(vec2(c.z * 9.0 + rn * 6.0, uTime * 1.5 + uSeed));
      float tip = smoothstep(0.20, 0.0, front - rn) * (1.0 - burst);
      vec3 hue = mix(DEEP, TEAL, clamp(flick - 0.3 + tip, 0.0, 1.0));
      hue = mix(hue, CYAN, smoothstep(2.2, 0.3, rn) * 0.60 + tip * 0.3);
      hue = mix(hue, PALE, burst * 0.18);
      hue = mix(hue, vec3(0.180, 0.640, 0.560), smoothstep(0.70, 0.90, c.z) * (1.0 - burst) * 0.6);

      float shine = uGlow * live;
      float far = mix(1.0, 0.55, smoothstep(0.8, 3.8, rn));
      col += hue * line * shine * (0.62 + 0.50 * flick) * far;
      col += mix(DEEP, CYAN, burst * 0.6) * exp(-c.x / mix(2.2, 3.4, burst)) * keep * shine * (0.10 + 0.12 * burst) * far;
    }

    vec2 lifted = vec2(e.x, e.y - uRadius * 0.25);
    float dome = exp(-dot(lifted, lifted) / (uRadius * uRadius * 4.20)) * uBeam;
    float cap = smoothstep(1.25, 0.55, length(lifted) / (uRadius * 2.5) + (fbm(dir * 2.0 + uSeed) - 0.5) * 0.25);
    col += vec3(0.070, 0.290, 0.480) * (dome * 0.50 + cap * 0.36 * uBeam);

    float halo = abs(rn - RING) * uRadius;
    col += CYAN * exp(-halo / 3.0) * uBeam * 0.45;
    col += vec3(0.200, 0.620, 0.700) * smoothstep(RING, RING * 0.5, rn) * uBeam * 0.50;
    col += CYAN * exp(-rn * 5.0) * uBeam * 0.35;

    if (uWave > 0.001) {
      float size = uRadius * (0.7 + 3.0 * (1.0 - pow(1.0 - uWave, 2.5)));
      float n = rad / size;
      float power = pow(1.0 - uWave, 1.6);
      col += CYAN * smoothstep(0.07, 0.0, abs(n - 1.0)) * power * 0.40 * smoothstep(3.0, -5.0, p.y);
      col += DEEP * smoothstep(1.0, 0.75, n) * smoothstep(0.35, 1.0, n) * power * 0.22;
    }
  } else {
    float top = resolution.y - uGround;

    if (uWave > 0.001) {
      float size = uRadius * (0.7 + 3.0 * (1.0 - pow(1.0 - uWave, 2.5)));
      float power = pow(1.0 - uWave, 1.6);
      vec2 dq = vec2(p.x, max(p.y, 0.0) / 0.80);
      float n = length(dq) / size;
      float inside = smoothstep(0.0, 16.0, p.y) * smoothstep(1.0, 0.985, n);
      float shell = sqrt(max(1.0 - n * n, 0.0));
      float fres = pow(1.0 - shell, 2.2);
      float ripple = 0.75 + 0.25 * noise(vec2(atan(dq.y, dq.x) * 6.0 + uSeed, n * 6.0 - uTime * 6.0));

      col += mix(DEEP, CYAN, fres) * fres * inside * power * ripple * 0.55;
      col += PALE * smoothstep(0.045, 0.0, abs(n - 0.985)) * smoothstep(-1.0, 6.0, p.y) * power * 0.30;
      col += DEEP * inside * power * 0.07;
    }

    if (uBeam * uShaft > 0.001 && p.y > -4.0) {
      float h = clamp(p.y / top, 0.0, 1.0);
      float flick = 0.86 + 0.14 * noise(vec2(uTime * 22.0, uSeed));
      float w = mix(9.5, 3.2, pow(h, 0.7)) * flick;
      float xs = p.x + sin(p.y * 0.050 - uTime * 16.0) * 1.3 * h + (noise(vec2(p.y * 0.030 - uTime * 4.0, uSeed)) - 0.5) * 3.0 * h;

      float core = exp(-xs * xs / (w * w * 0.07));
      float mid = exp(-xs * xs / (w * w));
      float haze = exp(-xs * xs / (w * w * 11.0));

      float streak = noise(vec2(p.x * 0.55 + uSeed, p.y * 0.030 - uTime * 7.0));
      float thread = pow(noise(vec2(p.x * 1.50 - uSeed, p.y * 0.010 - uTime * 3.2)), 3.0);
      float rise = smoothstep(1.0, 0.20, h) * smoothstep(-4.0, 6.0, p.y);

      vec2 cell = vec2(floor(p.x / 5.0), floor((p.y - uTime * 150.0) / 9.0));
      vec2 inCell = vec2(fract(p.x / 5.0), fract((p.y - uTime * 150.0) / 9.0)) - 0.5;
      float mote = step(0.86, hash(cell + uSeed)) * smoothstep(0.30, 0.05, length(inCell * vec2(1.0, 1.8)));

      col += DEEP * haze * rise * uBeam * (0.30 + 0.50 * thread);
      col += vec3(0.220, 0.640, 0.840) * mid * rise * uBeam * (0.40 + 0.55 * streak);
      col += PALE * core * rise * uBeam * 0.80;
      col += PALE * mote * haze * rise * uBeam * 0.55;

      float flare = length(vec2(p.x, (p.y - 3.0) * 1.7));
      col += PALE * exp(-flare / 5.0) * uBeam * 0.55;
      col += CYAN * exp(-flare / 15.0) * uBeam * 0.30;
      col += DEEP * exp(-length(vec2(p.x, (p.y - 24.0) * 0.8)) / 46.0) * uBeam * 0.22;
    }
  }

  float fringe = min(min(fragCoord.x, resolution.x - fragCoord.x), min(fragCoord.y, resolution.y - fragCoord.y));
  gl_FragColor = vec4(col, alpha) * smoothstep(0.0, 26.0, fringe);
}
`;
