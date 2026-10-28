import { NOISE } from "./common";

export const getCraterFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uGround;
uniform float uLayer;
uniform float uRadius;
uniform float uCharge;
uniform float uFlash;
uniform float uBurn;
uniform float uDust;
uniform float uCool;
uniform float uDrift;
uniform float uAge;
uniform float uFade;

varying vec2 fragCoord;
${NOISE}
const float SQUASH = 0.6;
const float HOLE = 0.48;
const float LIP = 0.70;

float ease(float t) {
  t = clamp(t, 0.0, 1.0);
  return 1.0 - (1.0 - t) * (1.0 - t) * (1.0 - t);
}

vec3 fire(float heat) {
  vec3 c = mix(vec3(0.200, 0.045, 0.030), vec3(0.560, 0.110, 0.040), smoothstep(0.00, 0.30, heat));
  c = mix(c, vec3(0.860, 0.290, 0.070), smoothstep(0.28, 0.52, heat));
  c = mix(c, vec3(1.000, 0.540, 0.150), smoothstep(0.48, 0.72, heat));
  c = mix(c, vec3(1.000, 0.780, 0.420), smoothstep(0.70, 0.90, heat));
  return mix(c, vec3(1.000, 0.950, 0.820), smoothstep(0.88, 1.10, heat));
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float web(vec2 q) {
  vec2 i = floor(q);
  vec2 f = fract(q);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 cell = vec2(mod(i.x + o.x, 11.0), i.y + o.y);
      vec2 pt = o + 0.1 + 0.8 * vec2(hash(cell + uSeed), hash(cell + uSeed + 7.3)) - f;
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

void over(inout vec3 col, inout float alpha, vec3 c, float a) {
  col = col * (1.0 - a) + c * a;
  alpha = alpha * (1.0 - a) + a;
}

void lip(inout vec3 col, inout float alpha, vec2 e, float rn, vec2 dir, float live, float front) {
  float rise = smoothstep(0.0, 0.25, uBurn + uCool);
  float wob = (noise(dir * 3.0 + uSeed * 4.0) - 0.5) * 0.10 + (fbm(e * 0.25 + uSeed) - 0.5) * 0.12;
  float thick = 0.06 + 0.14 * smoothstep(0.3, 0.75, fbm(dir * 4.0 + uSeed * 2.0));
  float band = smoothstep(thick, thick * 0.3, abs(rn - LIP - wob)) * rise;
  float side = front > 0.5 ? smoothstep(0.05, -0.25, dir.y) : smoothstep(-0.05, 0.25, dir.y);
  float lit = smoothstep(LIP + 0.05, LIP - 0.12, rn - wob);
  float glow = (uBurn * 0.8 + (1.0 - uCool) * 0.3) * (front > 0.5 ? 0.25 : 1.0);
  vec3 earth = mix(vec3(0.090, 0.060, 0.045), vec3(0.200, 0.140, 0.100), noise(e * 0.4 + uSeed));
  earth = mix(earth, vec3(0.700, 0.300, 0.090), lit * glow * 0.8);
  float broken = smoothstep(0.28, 0.48, noise(dir * 5.0 + uSeed * 6.0));
  over(col, alpha, earth, band * side * broken * 0.55 * live);
}

void main(void) {
  vec2 p = vec2(fragCoord.x - resolution.x * 0.5, fragCoord.y - uGround);
  float live = 1.0 - clamp(uFade, 0.0, 1.0);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec2 e = vec2(p.x, p.y / SQUASH);
  float rn = length(e) / uRadius;
  float ang = atan(e.y, e.x);
  vec2 dir = vec2(cos(ang), sin(ang));

  if (uLayer < 0.5) {
    float edge = 1.05 + (fbm(dir * 1.8 + uSeed) - 0.5) * 0.35;
    float scorch = smoothstep(edge, edge * 0.5, rn) * (0.10 + 0.14 * fbm(e / uRadius * 3.0 + uSeed)) * smoothstep(0.25, 0.6, fbm(e * 0.12 + uSeed * 3.0) + smoothstep(0.8, 0.3, rn) * 0.4);
    scorch *= smoothstep(0.0, 0.3, uBurn + uCool) * live;
    over(col, alpha, vec3(0.060, 0.045, 0.035), scorch);

    float hr = HOLE + (noise(dir * 2.5 + uSeed * 2.0) - 0.5) * 0.22 + (noise(dir * 7.0 - uSeed) - 0.5) * 0.08;
    float hole = smoothstep(hr, hr - 0.10, rn) * smoothstep(0.0, 0.15, uBurn + uCool);
    float wall = clamp(0.5 + e.y / (uRadius * hr) * 0.5, 0.0, 1.0);
    vec3 pit = mix(vec3(0.075, 0.058, 0.046), vec3(0.200, 0.150, 0.115), wall * smoothstep(0.2, 1.0, rn / hr));
    float hot = 1.0 - smoothstep(0.0, 0.45, uCool);
    pit = mix(pit, fire(0.95 - rn * 0.6), hot * smoothstep(1.0, 0.3, rn / hr));
    over(col, alpha, pit, hole * 0.62 * (0.8 + 0.2 * noise(e * 0.3 + uSeed)) * live);

    float turn = (ang + 3.14159265) / 6.2831853;
    vec2 wq = vec2(turn * 11.0 + (noise(dir * 1.5 + rn * 2.0 + uSeed) - 0.5) * 0.3, log(max(rn, 0.05)) * 2.6 + uSeed);
    float span = rn * uRadius * (6.2831853 / 11.0);
    float dist = web(wq) * span * 0.5;
    float rough = noise(e * 0.25 + uSeed * 3.0);
    float width = 0.45 * (0.35 + 1.4 * rough * rough);
    float gaps = smoothstep(0.42, 0.56, noise(e * 0.12 + uSeed * 2.0)) * smoothstep(0.30, 0.42, noise(e * 0.32 - uSeed));
    float zone = smoothstep(hr - 0.02, hr + 0.08, rn) * smoothstep(1.25, 0.75, rn) * smoothstep(0.0, 0.2, uBurn + uCool);
    float line = smoothstep(width, width * 0.25, dist) * gaps * zone;
    float shadow = smoothstep(width * 1.4, 0.0, web(vec2(wq.x, log(max(length(vec2(e.x, e.y + 2.0 / SQUASH)) / uRadius, 0.05)) * 2.6 + uSeed)) * span * 0.5) * gaps * zone * 0.3;
    over(col, alpha, vec3(0.040, 0.030, 0.025), max(line * 0.8, shadow * 0.6) * live);
    float glowing = (1.0 - smoothstep(0.1, 0.9, uCool)) * smoothstep(1.3, hr, rn);
    col += fire(0.55 + 0.25 * rough) * line * glowing * 0.9 * live;

    lip(col, alpha, e, rn, dir, live, 0.0);

    float pool = exp(-rn * rn * 0.75) * smoothstep(2.0, 1.0, rn);
    float light = uCharge * 0.30 + uFlash * 0.80 + uBurn * 0.45 + uBurn * (1.0 - uCool) * 0.10;
    col += vec3(1.000, 0.520, 0.200) * pool * light * 0.32 * live;
  } else {
    vec2 c = p / uRadius;
    float grow = ease(uDust);
    float drift = uDrift;
    float lift = drift * 0.75;

    float field = 9.0;
    for (int k = 0; k < 7; k++) {
      float fk = float(k);
      float h1 = hash(vec2(fk, uSeed));
      float h2 = hash(vec2(fk + 11.0, uSeed));
      float h3 = hash(vec2(fk + 23.0, uSeed));
      vec2 at;
      float size;
      if (k < 2) {
        float side = k == 0 ? -1.0 : 1.0;
        at = vec2(side * (0.32 + 0.22 * grow + drift * 0.20), 0.14 + 0.08 * grow + lift * 0.45);
        size = (0.30 + 0.10 * h3) * (0.4 + 0.6 * grow) * (1.0 + drift * 0.6);
      } else {
        at = vec2((h1 - 0.5) * 0.7 * (1.0 + drift * 0.5), 0.15 + (0.10 + 0.40 * h2) * grow + lift * (0.6 + 0.5 * h2));
        size = (0.26 + 0.14 * h3) * (0.3 + 0.7 * grow) * (1.0 + drift * 0.7);
      }
      at.x += sin(uTime * 0.9 + fk * 1.7) * 0.03 * (1.0 + drift * 2.0);
      float d = length((c - at) / vec2(1.0, 0.85)) - size;
      field = smin(field, d, 0.32);
    }

    float b1 = fbm(c * 2.6 + vec2(uSeed, -uTime * 0.45));
    float b2 = noise(c * 8.0 + vec2(-uSeed, -uTime * 0.9));
    float big = noise(c * 1.3 + vec2(uSeed * 2.0, -uTime * 0.2));
    float f = field + (b1 - 0.5) * 0.30 + (b2 - 0.5) * 0.08 + (big - 0.5) * 0.18 * smoothstep(0.0, 0.6, c.y);
    float mask = smoothstep(0.02, -0.05, f) * smoothstep(-0.14, -0.02, c.y) * step(0.01, grow);
    float z = clamp(-f / 0.32, 0.0, 1.0);

    vec2 bw = vec2(uSeed, -uTime * 0.45);
    float gx = fbm((c + vec2(0.05, 0.0)) * 2.6 + bw) - b1;
    float gy = fbm((c + vec2(0.0, 0.05)) * 2.6 + bw) - b1;
    vec3 nrm = normalize(vec3(-gx * 4.5, -gy * 4.5 + (1.0 - z) * 0.6, 0.6 + z));
    float sun = clamp(dot(nrm, normalize(vec3(-0.35, 0.65, 0.65))), 0.0, 1.0);
    float crease = smoothstep(0.30, 0.55, b2 + z * 0.3);
    float light = clamp(sun * 0.65 + z * 0.30 + c.y * 0.12, 0.0, 1.0) * (0.88 + 0.12 * crease);
    vec3 smoke = mix(vec3(0.120, 0.112, 0.105), vec3(0.420, 0.400, 0.375), light);
    float under = smoothstep(0.7, 0.0, c.y - lift * 0.5) * (uBurn * 0.30 + (1.0 - uCool) * 0.08);
    smoke = mix(smoke, smoke * vec3(1.45, 1.15, 0.9) + vec3(0.06, 0.025, 0.0), under * (1.0 - z * 0.5));
    float core = uBurn * uBurn * smoothstep(0.45, 0.9, z + (b2 - 0.5) * 0.3) * smoothstep(0.65, 0.10, c.y - lift);
    vec3 cc = mix(smoke, fire(0.38 + z * 0.40 + (b1 - 0.5) * 0.3), core * 0.85);

    float erode = smoothstep(drift * 1.05 - 0.15, drift * 1.05 + 0.10, fbm(c * 2.2 + vec2(uSeed * 3.0, -uTime * 0.25)) + z * 0.25);
    over(col, alpha, cc, mask * erode * 0.88 * live);

    lip(col, alpha, e, rn, dir, live, 1.0);

    for (int k = 0; k < 16; k++) {
      float fk = float(k);
      float h1 = hash(vec2(fk, uSeed + 31.0));
      float h2 = hash(vec2(fk + 5.0, uSeed + 31.0));
      float h3 = hash(vec2(fk + 9.0, uSeed + 31.0));
      float h4 = hash(vec2(fk + 13.0, uSeed + 31.0));
      float tl = uAge - h1 * h1 * 0.14;
      float life = 0.30 + 0.45 * h4;
      float b = h2 * 6.2831853;
      float hs = 28.0 + 80.0 * pow(h3, 1.8);
      float vz = 30.0 + 60.0 * h4;
      float g = 300.0;
      float up = vz * tl - 0.5 * g * tl * tl;
      if (tl <= 0.0 || tl > life || up < -1.0) continue;
      vec2 at = vec2(cos(b) * hs * tl, -sin(b) * 0.6 * hs * tl + max(up, 0.0) + 3.0);
      vec2 vel = vec2(cos(b) * hs, -sin(b) * 0.6 * hs + vz - g * tl);
      float speed = length(vel);
      float len = clamp(speed * 0.035, 1.0, 4.5);
      float d = segment(p, at - vel / max(speed, 1.0) * len, at);
      float age = tl / life;
      float bright = (1.0 - age * age) * smoothstep(-1.0, 1.5, up);
      col += fire(1.05 - age * 0.55) * (smoothstep(0.85, 0.15, d) * 0.9 + exp(-d / 1.6) * 0.35) * bright * live;
      alpha += smoothstep(0.85, 0.15, d) * bright * 0.3;
    }

    vec2 fv = vec2(c.x, c.y - 0.22);
    float fl = length(fv);
    float flash = exp(-fl * 3.2) * smoothstep(1.6, 0.8, fl) * uFlash;
    float hit = smoothstep(0.55, 0.30, fl + (noise(fv * 4.0 + uSeed) - 0.5) * 0.08) * uFlash;
    col += vec3(1.000, 0.640, 0.300) * flash * 0.9 + vec3(1.000, 0.900, 0.700) * hit * 0.6;
    alpha += hit * 0.3;
  }

  vec2 m = min(fragCoord, resolution - fragCoord);
  float border = smoothstep(0.0, 20.0, min(m.x, m.y));
  gl_FragColor = vec4(col, min(alpha, 1.0)) * border;
}
`;
