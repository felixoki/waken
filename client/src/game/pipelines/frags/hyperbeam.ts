import { NOISE } from "./common";

export const getHyperbeamFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uLayer;
uniform float uLength;
uniform float uOrb;
uniform float uReach;
uniform float uOn;
uniform float uAfter;
uniform float uUp;

varying vec2 fragCoord;
${NOISE}
const float MARGIN = 60.0;
const float HALF = 22.0;
const vec3 INK = vec3(0.030, 0.060, 0.075);
const vec3 DEEP = vec3(0.040, 0.250, 0.280);
const vec3 MID = vec3(0.090, 0.620, 0.600);
const vec3 CORE = vec3(0.420, 0.950, 0.860);

void over(inout vec3 col, inout float alpha, vec3 c, float a) {
  col = col * (1.0 - a) + c * a;
  alpha = alpha * (1.0 - a) + a;
}

vec3 teal(float h) {
  vec3 c = mix(DEEP, MID, smoothstep(0.0, 0.55, h));
  return mix(c, CORE, smoothstep(0.55, 1.0, h));
}

float tears(vec2 q) {
  float r = 1.0 - abs(noise(q) * 2.0 - 1.0);
  float r2 = 1.0 - abs(noise(q * 2.1 + 7.3) * 2.0 - 1.0);
  float holes = smoothstep(0.55, 0.75, noise(q * vec2(0.7, 1.4) + 3.1));
  return max(max(smoothstep(0.70, 0.90, r), smoothstep(0.78, 0.94, r2) * 0.85), holes);
}

void main(void) {
  float x = fragCoord.x - MARGIN;
  float y = fragCoord.y - resolution.y * 0.5;
  float t = clamp(x / uLength, 0.0, 1.0);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  float surge = pow(0.5 + 0.5 * sin(x * 0.075 - uTime * 16.0), 3.0) * smoothstep(0.0, 40.0, x);
  float base = HALF * (0.30 + 1.05 * pow(t, 0.75));
  float wide = base * (1.0 + 0.16 * surge) * mix(0.35, 1.0, uOn * uOn);
  float v = y / wide;
  float tipX = uReach * uLength + (fbm(vec2(y * 0.10, uTime * 2.0 + uSeed)) - 0.5) * 22.0;
  float ahead = smoothstep(tipX + 4.0, tipX - 26.0, x);
  float muzzle = smoothstep(0.0, 10.0, x);

  if (uLayer < 0.5) {
    v = y / base;
    float body = ahead * muzzle;
    float pool = exp(-v * v * 0.35) * body * uOn;
    over(col, alpha, INK, pool * 0.22);
    col += MID * exp(-v * v * 0.9) * body * uOn * 0.10;

    vec2 g = vec2(x, y);
    float fade = 1.0 - smoothstep(0.6, 2.6, uAfter);
    float cool = smoothstep(0.0, 1.1, uAfter);
    float patchy = fbm(vec2(g.x * 0.025, v * 1.6) + uSeed);
    float edge = smoothstep(1.25, 0.55, abs(v) + (patchy - 0.5) * 0.7);
    float scar = edge * body * step(0.001, uAfter) * fade;
    over(col, alpha, INK, scar * smoothstep(0.25, 0.65, patchy + 0.15) * 0.14);

    vec2 sq = vec2(g.x * 0.012, v * 2.4 + (fbm(vec2(g.x * 0.02, uSeed)) - 0.5) * 1.2 + uSeed);
    float ridge = 1.0 - abs(noise(sq) * 2.0 - 1.0);
    float gaps = smoothstep(0.45, 0.65, noise(vec2(g.x * 0.03, v + uSeed * 2.0)));
    float line = smoothstep(0.88, 0.97, ridge) * gaps * smoothstep(0.9, 0.3, abs(v)) * scar;
    over(col, alpha, INK, line * 0.20);
    col += MID * line * (1.0 - cool) * 0.30;

  } else {
    float body = ahead * muzzle;
    float f = body * uOn;
    float lit = mix(1.0, 0.62, t) * (1.0 + 0.18 * surge);

    float sheath = abs(y) / (wide * 2.1);
    float haze = exp(-sheath * sheath * 2.2) * smoothstep(0.35, 0.9, sheath);
    float streak = smoothstep(0.45, 0.85, fbm(vec2(x * 0.018 - uTime * 11.0, y / wide * 1.3 + uSeed)));
    float wind = haze * (0.35 + 0.65 * streak) * smoothstep(-6.0, 14.0, x) * smoothstep(tipX + 10.0, tipX - 30.0, x) * uOn;
    col += vec3(0.60, 0.92, 0.90) * wind * 0.10;
    alpha += wind * 0.03;

    vec2 bk = vec2(-x - 2.0, y);
    float bkr = length(bk);
    float bka = atan(bk.y, bk.x);
    float fan = smoothstep(0.9, 0.15, abs(bka));
    float lane = bka * 3.5 + (fbm(vec2(bkr * 0.04, uSeed)) - 0.5) * 1.2;
    float streaks = smoothstep(0.40, 0.80, fbm(vec2(lane + uSeed, bkr * 0.02 - uTime * 6.0)));
    float spread = smoothstep(5.0, 12.0, bkr) * smoothstep(46.0, 14.0, bkr);
    float live = smoothstep(2.0, -6.0, x) * uOn * smoothstep(0.0, 0.3, uReach);
    float blow = streaks * fan * spread * live;
    over(col, alpha, mix(INK, DEEP * 0.4, 0.3), blow * 0.26);

    float under = -v * uUp;
    float smog = fbm(vec2(x * 0.045 - uTime * 3.0, v * 0.6 + uSeed * 2.0));
    float shadow = smoothstep(2.3, 1.0, under + (smog - 0.5) * 1.4) * smoothstep(0.2, 0.9, under) * abs(uUp);
    over(col, alpha, mix(INK, DEEP * 0.3, smog * 0.5), shadow * 0.32 * f);

    float rag = (fbm(vec2(x * 0.06 - uTime * 6.0, sign(v) * 3.0 + uSeed)) - 0.5) * 0.35 + (noise(vec2(x * 0.22 - uTime * 6.0, sign(v) * 5.0 + uSeed)) - 0.5) * 0.30;
    float cw = 1.0 + rag * 0.8;
    float u = abs(v) / cw;
    float inside = smoothstep(1.05, 0.90, u - smoothstep(0.40, 0.80, fbm(vec2(x * 0.10 - uTime * 6.0, sign(v) * 7.0 + uSeed))) * 0.10) * f;
    float flow = fbm(vec2(x * 0.024 - uTime * 7.0, v * 2.6 + uSeed));
    float brush = noise(vec2(x * 0.010 - uTime * 4.0, v * 9.0 + uSeed));
    float hair = noise(vec2(x * 0.016 - uTime * 6.0, v * 10.0 - uSeed));
    float side = clamp(v / cw, -1.0, 1.0) * uUp;
    float vu = clamp(v / cw, -1.0, 1.0);
    float dome = sqrt(max(1.0 - vu * vu, 0.0));
    float crest = exp(-pow(vu - 0.38 * uUp, 2.0) / 0.07);
    float h = (0.06 + 0.82 * dome * dome + crest * 0.40 + side * 0.12 + (flow - 0.5) * 0.35 + (brush - 0.5) * 0.45 + (hair - 0.5) * 0.10) * lit;
    vec3 stream = teal(h);
    float shade = smoothstep(0.52, 0.72, fbm(vec2(x * 0.015 - uTime * 5.0, v * 3.0 - uSeed * 2.0)));
    stream = mix(stream, DEEP * 0.7, shade * 0.55);
    float bend = (fbm(vec2(x * 0.02 - uTime * 6.5, uSeed)) - 0.5) * 1.2;
    vec2 cq = vec2(x * 0.010 - uTime * 4.5, v * 4.0 + bend + uSeed);
    float ridge = 1.0 - abs(noise(cq) * 2.0 - 1.0);
    float split = tears(vec2(x * 0.022 - uTime * 4.5, v * 3.2 + bend + uSeed)) * smoothstep(0.10 - t * 0.35, 0.40 - t * 0.25, noise(vec2(x * 0.02 - uTime * 4.5, v * 1.5 + 9.0)));
    stream = mix(stream, DEEP * 0.6, split * 0.25);
    stream = mix(stream, DEEP * 0.5, smoothstep(0.45, 1.0, u) * 0.75);
    float chips = smoothstep(0.35, 0.75, fbm(vec2(x * 0.08 - uTime * 6.0, sign(v) * 5.0 + uSeed)));
    float lip = smoothstep(0.66 + side * 0.12, 0.95, u + chips * 0.10) * (0.45 + 0.55 * chips);
    stream = mix(stream, INK, lip * 0.60);
    float fray = smoothstep(tipX - 70.0, tipX - 5.0, x);
    stream = mix(stream, DEEP * 0.8, fray * 0.5);
    float strands = smoothstep(0.25, 0.65, brush + hair * 0.3 - fray * 0.25);
    float rim = exp(-pow(vu - 0.80 * uUp, 2.0) / 0.012) * abs(uUp) * (0.6 + 0.4 * flow);
    stream += CORE * rim * 0.35 * lit;

    float deep = fbm(vec2(x * 0.030 - uTime * 2.2, v * 2.0 - uSeed));
    float floorLit = clamp(-vu * uUp * 0.5 + 0.5, 0.0, 1.0);
    float hin = (0.08 + 0.42 * floorLit * floorLit + (deep - 0.5) * 0.30) * lit;
    vec3 hollow = mix(INK, teal(hin), 0.35 + 0.65 * floorLit);
    float body3 = inside * 0.93 * mix(1.0, strands, fray);
    over(col, alpha, hollow, body3 * split * 0.9);
    over(col, alpha, stream, body3 * (1.0 - split));
    float cut = smoothstep(0.15, 0.5, split) * smoothstep(0.85, 0.5, split);
    col += mix(MID, CORE, 0.4) * cut * body3 * 0.30 * lit;

    for (int i = 0; i < 3; i++) {
      float k = float(i);
      float run = x * 0.045 - uTime * (8.0 + k * 1.5) + k * 2.1;
      float flap = (fbm(vec2(run, k * 5.0 + sign(v) * 2.0 + uSeed)) - 0.5) * (0.5 + 0.9 * t);
      float lane = (abs(v) - (1.0 + k * 0.30 + flap)) * wide;
      float thick = (2.0 + 5.0 * noise(vec2(x * 0.03 - uTime * 8.0, k * 3.0 + uSeed))) * (0.5 + 0.7 * t);
      float strip = smoothstep(thick, thick * 0.3, abs(lane));
      float torn = smoothstep(0.42, 0.62, noise(vec2(x * 0.02 - uTime * (7.0 + k * 1.5), k * 7.0 + sign(v) * 3.0 + uSeed)));
      float holes = 1.0 - smoothstep(0.62, 0.80, noise(vec2(x * 0.09 - uTime * 8.0, lane * 0.25 + k * 4.0)));
      float peel = strip * torn * holes * smoothstep(20.0, 90.0, x) * smoothstep(tipX + 30.0, tipX - 20.0, x) * uOn * (1.0 - k * 0.28);
      float facing = clamp(-lane / max(thick, 0.001) * 0.5 + 0.5, 0.0, 1.0);
      vec3 rc = mix(DEEP * 0.7, teal(0.50 - k * 0.10), facing * 0.7 + 0.15);
      over(col, alpha, rc, peel * 0.85);
    }

    col += MID * exp(-v * v * 1.4) * f * 0.08;
    float flare = exp(-x * x / 1100.0) * smoothstep(1.5, 0.2, abs(v) * mix(0.75, 1.0, smoothstep(0.0, 30.0, x)) + (flow - 0.5) * 0.6) * smoothstep(-8.0, 6.0, x) * f;
    col += teal(0.9) * flare * 0.40;
    alpha = max(alpha, flare * 0.5);

    vec2 bo = vec2(x - 4.0, y);
    float br = length(bo);
    vec2 bd = bo / max(br, 0.001);
    float ray = smoothstep(0.62, 0.92, noise(bd * 4.0 + vec2(uTime * 9.0, uSeed)));
    float reachR = 10.0 + 16.0 * noise(bd * 2.5 + vec2(uSeed, uTime * 5.0));
    float burst = ray * smoothstep(reachR, reachR * 0.3, br) * smoothstep(3.0, 7.0, br) * smoothstep(-0.6, 0.4, bd.x) * f;
    col += teal(0.75) * burst * 0.45;
    alpha = max(alpha, burst * 0.25);

    vec2 o = vec2(x - 4.0, y);
    float r = length(o);
    float size = uOrb * (0.80 + 0.20 * noise(vec2(uTime * 6.0, uSeed)));
    float aura = exp(-r * r / max(55.0 * size * size, 0.001)) * uOrb * uOn;
    col += MID * aura * 0.30;
    alpha = max(alpha, aura * 0.18);
    float core = exp(-r * r / max(7.0 * size * size, 0.001)) * uOrb * uOn;
    col += CORE * core * 0.85;
    alpha = max(alpha, core * 0.6);
  }

  vec2 m = min(fragCoord, resolution - fragCoord);
  float border = smoothstep(0.0, 14.0, min(m.x, m.y));
  gl_FragColor = vec4(col, alpha) * border;
}
`;
