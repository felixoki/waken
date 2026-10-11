import { NOISE } from "./common";

export const getStormFrag = (): string => `
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uGround;
uniform float uLayer;
uniform float uRadius;
uniform float uLean;
uniform float uGale;
uniform float uWind;
uniform float uLift;
uniform float uLeader;
uniform float uDrop;
uniform float uBolt;
uniform float uFlash;
uniform float uDisc;
uniform float uCrown;
uniform float uSpread;
uniform float uScar;
uniform float uGlow;
uniform float uFade;
uniform float uAx;
uniform float uAy;
uniform float uBx;
uniform float uBy;

varying vec2 fragCoord;
${NOISE}
const float SQUASH = 0.60;
const float KNOTS = 5.0;
const vec3 INK = vec3(0.047, 0.039, 0.071);
const vec3 ASH = vec3(0.075, 0.090, 0.110);
const vec3 SOOT = vec3(0.040, 0.050, 0.065);
const vec3 SMOKE = vec3(0.176, 0.205, 0.262);
const vec3 MIST = vec3(0.830, 0.870, 0.940);
const vec2 TILT = vec2(0.814, 0.581);
const float OBLATE = 0.34;
const float SECTORS = 6.0;
const vec3 DUSK = vec3(0.140, 0.100, 0.380);
const vec3 INDIGO = vec3(0.231, 0.204, 0.573);
const vec3 BLUE = vec3(0.353, 0.327, 0.850);
const vec3 VIOLET = vec3(0.600, 0.471, 0.933);
const vec3 ORCHID = vec3(0.667, 0.549, 0.945);
const vec3 LILAC = vec3(0.678, 0.647, 0.976);
const vec3 BLUSH = vec3(0.953, 0.843, 0.996);
const vec3 WHITE = vec3(0.990, 0.980, 0.995);
const vec3 PLUM = vec3(0.349, 0.204, 0.592);
const vec3 AMETHYST = vec3(0.408, 0.282, 0.733);

void lay(inout vec3 col, inout float alpha, vec3 c, float a) {
  a = clamp(a, 0.0, 1.0);
  col = col * (1.0 - a) + c * a;
  alpha = alpha * (1.0 - a) + a;
}

vec2 knot(float i, vec2 a, vec2 b, float sway, float seed, float pin) {
  float t = i / KNOTS;
  float inner = step(0.5, i) * step(i, KNOTS - 0.5);
  t = clamp(t + (hash(vec2(i, seed)) - 0.5) * 0.16 * inner, 0.0, 1.0);
  vec2 ab = b - a;
  vec2 n = normalize(vec2(ab.y, -ab.x));
  float side = mod(i, 2.0) < 0.5 ? -1.0 : 1.0;
  float weight = hash(vec2(i + 3.7, seed));
  float amp = (0.30 + 0.70 * weight) * sway * side;
  float env = smoothstep(0.0, 0.22, 1.0 - t) * mix(1.0, smoothstep(0.0, 0.22, t), pin);
  float bow = sin(3.14159265 * t) * sway * 1.1 * (hash(vec2(seed, 9.0)) - 0.5) * (1.0 - pin);
  return a + ab * t + n * (amp * env + bow);
}

vec2 bolt(vec2 p, vec2 a, vec2 b, float sway, float seed, float pin) {
  float thin = 1e4;
  float wide = 1e4;
  vec2 from = knot(0.0, a, b, sway, seed, pin);
  for (int i = 1; i <= 5; i++) {
    vec2 to = knot(float(i), a, b, sway, seed, pin);
    float s = segment(p, from, to);
    float w = 0.62 + 0.76 * hash(vec2(float(i) + 9.1, seed));
    thin = min(thin, s);
    wide = min(wide, s / w);
    from = to;
  }
  return vec2(wide, thin);
}

float path(float y, vec2 a, vec2 b, float sway, float seed) {
  float x = a.x;
  vec2 from = knot(0.0, a, b, sway, seed, 0.0);
  for (int i = 1; i <= 5; i++) {
    vec2 to = knot(float(i), a, b, sway, seed, 0.0);
    if (y <= from.y && y > to.y) x = mix(from.x, to.x, (from.y - y) / max(from.y - to.y, 0.001));
    from = to;
  }
  return y <= 0.0 ? b.x : x;
}

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

float stepped(float y, float size, float seed) {
  float v = y / size;
  float i = floor(v);
  return mix(hash(vec2(i, seed)), hash(vec2(i + 1.0, seed)), smoothstep(1.0 - 1.2 / size, 1.0, fract(v)));
}

float trace(float t, float sway, float seed) {
  float v = 0.0;
  float t0 = 0.0;
  float v0 = 0.0;
  for (int i = 1; i <= 6; i++) {
    float fi = float(i);
    float t1 = i == 6 ? 1.0 : clamp(fi / 6.0 + (hash(vec2(fi, seed)) - 0.5) * 0.15, 0.0, 1.0);
    float side = mod(fi, 2.0) < 0.5 ? -1.0 : 1.0;
    float weight = hash(vec2(fi + 3.7, seed));
    float v1 = i == 6 ? 0.0 : (0.08 + 0.92 * weight * weight) * sway * side;
    if (t >= t0 && t <= t1) v = mix(v0, v1, (t - t0) / max(t1 - t0, 0.001));
    t0 = t1;
    v0 = v1;
  }
  return v;
}

vec2 tooth(float j, float grow) {
  float h1 = hash(vec2(j, uSeed + 31.0));
  float h2 = hash(vec2(j + 5.3, uSeed + 32.0));
  float a = hash(vec2(uSeed, 33.0)) * 6.2831853 + j * 1.12 + (h1 - 0.5) * 0.60;
  float peak = mod(j, 2.0);
  float r = uRadius * mix(0.30 + 0.25 * h2, 0.85 + 0.55 * h2, peak) * mix(0.6, 1.0, grow);
  float lift = uRadius * (0.20 + 0.80 * h1) * peak * grow;
  return vec2(cos(a) * r, sin(a) * r * 0.5 + lift);
}

float corona(vec2 p, float grow) {
  float d = 1e4;
  vec2 from = tooth(0.0, grow);
  for (int i = 1; i <= 5; i++) {
    float j = float(i);
    vec2 to = tooth(j, grow);
    vec2 ab = to - from;
    float t = clamp(dot(p - from, ab) / dot(ab, ab), 0.0, 1.0);
    float peak = mod(j, 2.0);
    float tipward = mix(1.0 - t, t, peak);
    float w = uRadius * 0.038 * (0.55 + 0.80 * hash(vec2(j, uSeed + 34.0))) * mix(1.0, 0.12, smoothstep(0.55, 1.0, tipward)) * mix(0.45, 1.0, smoothstep(0.0, 0.25, tipward));
    float gone = step(hash(vec2(j, uSeed + 35.0)), 0.12) * 1e3;
    d = min(d, length(p - from - ab * t) - w + gone);

    vec2 tip = mix(from, to, peak);
    vec2 barb = tip + vec2(sign(tip.x) * 0.16, -0.20 - 0.14 * hash(vec2(j, uSeed + 36.0))) * uRadius * grow;
    float hooked = step(0.45, hash(vec2(j + peak, uSeed + 37.0))) * step(0.5, peak);
    d = min(d, segment(p, tip, barb) - uRadius * 0.010 + (1.0 - hooked) * 1e3 + gone);
    from = to;
  }
  return d;
}

void dome(inout vec3 col, inout float alpha, vec2 p, float side) {
  for (int k = 0; k < 6; k++) {
    float fk = float(k);
    float t = fract(fk / 6.0 + uWind * 0.22);
    float life = smoothstep(0.0, 0.14, t) * smoothstep(1.0, 0.72, t);
    float lat = t * 1.30;
    vec2 q = vec2(p.x, (p.y - uRadius * OBLATE * sin(lat) * TILT.x) / TILT.y);

    float turn = (atan(q.y, q.x) + uWind * (2.6 - 0.8 * t) + fk * 2.4 + uSeed) / 6.2831853;
    float s = fract(turn) * 2.0;
    float si = floor(s);
    float seg = fract(s);
    float h1 = hash(vec2(fk + si * 3.1, uSeed));
    float h2 = hash(vec2(fk + si * 5.7, uSeed + 4.0));
    float tail = 0.45 + 0.55 * h1;
    float taper = smoothstep(0.0, 0.35, seg) * smoothstep(tail, tail - 0.40, seg);

    float bent = lat + 0.34 * (seg - 0.5);
    q = vec2(p.x, (p.y - uRadius * OBLATE * sin(bent) * TILT.x) / TILT.y);
    float depth = q.y / max(length(q), 0.001);
    float facing = side < 0.5 ? smoothstep(-0.15, 0.15, depth) : smoothstep(0.15, -0.15, depth);
    float nearer = side < 0.5 ? 0.55 : 1.0;

    float d = abs(length(q) / uRadius - cos(bent));
    float w = (0.060 + 0.130 * h2) * taper * mix(0.7, 1.0, nearer) * (0.50 + 1.00 * noise(vec2(seg * 5.0 + fk * 3.0, uSeed)));
    float stroke = smoothstep(w, w * 0.10, d) * step(0.001, taper);
    float streak = 0.45 + 0.55 * noise(vec2(d * 90.0 + fk, seg * 7.0 + uSeed));

    lay(col, alpha, MIST, stroke * streak * life * facing * nearer * 0.40 * uGale);
  }
}

void main(void) {
  vec2 p = vec2(fragCoord.x - resolution.x * 0.5, fragCoord.y - uGround);
  float live = 1.0 - clamp(uFade, 0.0, 1.0);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec2 e = vec2(p.x, p.y / SQUASH);
  float rad = length(e);
  float rn = rad / uRadius;
  float ang = atan(e.y, e.x);
  vec2 dir = vec2(cos(ang), sin(ang));

  if (uGale > 0.001) {
    dome(col, alpha, p, uLayer);
  } else if (uLayer < 0.5) {
    if (uScar > 0.001) {
      float ragged = rn + (fbm(e * 0.07 + uSeed) - 0.5) * 1.3;
      float burn = smoothstep(2.20, 0.50, ragged);
      lay(col, alpha, ASH, burn * 0.46 * uScar * live);

      float turn = (ang + 3.14159265) / 6.2831853;
      float kink = (noise(dir * 1.2 + rn * 1.4 + uSeed) - 0.5) * 0.34;
      float bend = (noise(dir * 2.6 + rn * 2.4 - uSeed) - 0.5) * 0.16;
      vec3 w = web(vec2(turn * SECTORS + kink + bend, log(max(rn, 0.05)) * 1.10 + kink * 0.4 - bend + uSeed));
      float c = w.x * rn * uRadius * (6.2831853 / SECTORS) * 0.5;

      vec2 g = e / uRadius;
      float edge = rn + (noise(dir * 2.0 + uSeed) - 0.5) * 0.55;
      float within = smoothstep(1.35, 0.85, edge) * smoothstep(0.10, 0.20, rn);
      float tear = smoothstep(0.56, 0.40, noise(dir * 3.4 + rn * 2.2 + uSeed) * smoothstep(0.35, 1.10, rn));
      float gaps = smoothstep(0.32, 0.44, noise(g * 3.1 + uSeed * 2.0)) * smoothstep(0.24, 0.34, noise(g * 8.5 - uSeed));
      float rough = noise(g * 6.5 + uSeed * 3.0);
      float width = 0.50 * (0.60 + 0.70 * w.z) * (0.30 + 1.50 * rough * rough) * (1.0 + 1.1 * smoothstep(0.7, 0.2, rn)) * clamp(uRadius / 30.0, 0.55, 1.0);
      float line = smoothstep(width, width * 0.25, c) * within * tear * gaps;

      float heart = smoothstep(0.95, 0.25, rn);
      float lit = uGlow * live;
      float flick = 0.70 + 0.45 * noise(vec2(w.z * 9.0 + rn * 6.0, uTime * 1.5 + uSeed));
      vec3 ember = mix(mix(PLUM, AMETHYST, heart), ORCHID, heart * heart * flick);
      float warm = clamp(lit * (0.30 + 0.70 * heart) * flick, 0.0, 1.0);

      lay(col, alpha, mix(SOOT, ember, warm), line * 0.85 * uScar * live);
      col += PLUM * exp(-c / 2.2) * within * heart * lit * 0.22;
      col += PLUM * exp(-rn * rn * 3.0) * lit * 0.48;

      float jag = floor(noise(dir * 2.1 + uSeed + 4.0) * 5.0) / 5.0;
      float hoop = abs(rn - 1.02 - (jag - 0.4) * 0.40) * uRadius;
      float bits = smoothstep(0.50, 0.58, noise(dir * 2.3 + uSeed + 11.0)) * smoothstep(0.30, 0.45, noise(dir * 6.0 - uSeed));
      float nib = 0.35 + 0.75 * noise(dir * 4.0 + uSeed + 2.0);
      lay(col, alpha, mix(BLUE, LILAC, 0.45), smoothstep(nib, nib * 0.35, hoop) * bits * lit * 0.80 * (1.0 - uFlash));
    }

    if (uFlash > 0.001) {
      float size = 0.45 + 0.55 * uDisc;
      float rw = rn / size * (1.0 + (noise(dir * 1.3 + uSeed) - 0.5) * 0.20);
      float tone = noise(e * 0.06 + uSeed * 1.7);
      vec3 fill = mix(mix(VIOLET, ORCHID, tone), BLUE, smoothstep(0.45, 0.75, hash(vec2(uSeed, 3.3)) * 0.5 + tone * 0.5));
      float disc = smoothstep(1.0, 0.95, rw);
      float hollow = 0.50 + 0.22 * smoothstep(0.2, 1.0, rw);

      col += DUSK * exp(-rn * 0.55) * smoothstep(3.6, 1.5, rn) * uFlash * 0.85;
      col += BLUE * exp(-max(rw - 1.0, 0.0) * 3.2) * (1.0 - disc) * uFlash * 0.30;
      lay(col, alpha, fill, disc * hollow * uFlash);

      float rim = smoothstep(0.085, 0.020, abs(rw - 0.945)) * (0.12 + 0.88 * smoothstep(0.30, 0.65, noise(dir * 1.9 - uSeed)));
      lay(col, alpha, mix(LILAC, BLUSH, 0.45), rim * 0.95 * uFlash);
      lay(col, alpha, BLUSH, exp(-rn * rn * 7.0) * uFlash * 0.8);
      lay(col, alpha, WHITE, exp(-rn * rn * 22.0) * uFlash * 1.2);
    }
  } else if (uLayer < 1.5) {
    float top = resolution.y - uGround;
    float h = clamp(p.y / top, 0.0, 1.0);
    float scale = uRadius / 32.0;

    if (uLift > 0.001 && p.y > 0.0) {
      float column = exp(-p.x * p.x / (uRadius * uRadius * 1.2));
      float rise = smoothstep(0.0, uRadius * 0.4, p.y) * smoothstep(uRadius * 4.2, uRadius * 0.8, p.y);
      float streak = pow(noise(vec2(p.x * 0.24 + uSeed, p.y * 0.030 - uTime * 2.6)), 3.0);
      float wisp = pow(noise(vec2(p.x * 0.09 - uSeed, p.y * 0.016 - uTime * 1.4)), 2.0);
      lay(col, alpha, MIST, (streak * 0.75 + wisp * 0.30) * column * rise * uLift * 0.18);
    }

    vec2 crown = vec2(uLean, top);
    float sway = 22.0 * scale;
    float centre = path(p.y, crown, vec2(0.0), sway, uSeed);
    float wy = p.y + (noise(vec2(p.y * 0.045, uSeed)) - 0.5) * 26.0;
    float sunk = max(-p.y, 0.0) * 3.0;

    if (uLeader > 0.001) {
      float front = top * (1.0 - uLeader);
      float shown = smoothstep(front - 3.0, front + 10.0, p.y);
      float wander = (stepped(wy, 9.0, uSeed + 7.0) - 0.5) * 3.4;
      float torn = smoothstep(0.22, 0.32, stepped(wy, 17.0, uSeed + 8.0));
      float thread = abs(p.x - centre - wander) + sunk;
      float hair = smoothstep(1.1, 0.25, thread) * shown * torn;
      lay(col, alpha, mix(INDIGO, LILAC, 0.45), hair * 0.80 * (1.0 - uBolt));
      col += INDIGO * exp(-thread / 3.5) * shown * torn * 0.30 * (1.0 - uBolt);
    }

    if (uBolt > 0.001) {
      float front = top * (1.0 - uDrop);
      float shown = smoothstep(front - 2.0, front + 8.0, p.y);
      float girth = uRadius * mix(0.055, 0.25, pow(h, 1.2)) * (0.50 + 0.50 * uBolt);
      float left = centre - girth * (0.62 + 0.62 * stepped(wy, 19.0, uSeed + 1.0) + 0.14 * stepped(wy, 6.0, uSeed + 3.0));
      float right = centre + girth * (0.62 + 0.62 * stepped(wy + 5.0, 26.0, uSeed + 2.0) + 0.14 * stepped(wy, 7.5, uSeed + 4.0));
      float within = min(p.x - left, right - p.x) - sunk;
      float body = smoothstep(-0.5, 0.6, within) * shown;
      float heat = smoothstep(0.35, 1.0, uBolt);
      float shade = noise(vec2(p.x * 0.12 + uSeed, p.y * 0.05));
      vec3 inside = mix(mix(LILAC, VIOLET, shade * 0.35), WHITE, heat);
      vec3 edge = mix(BLUSH, LILAC, heat);
      vec3 ribbon = mix(inside, edge, smoothstep(girth * 0.45, 0.0, within));

      float split = abs(p.x - centre - girth * (stepped(wy, 19.0, uSeed + 5.0) - 0.5) * 0.9);
      float cleft = smoothstep(0.9, 0.3, split) * smoothstep(0.50, 0.62, stepped(wy, 23.0, uSeed + 6.0)) * smoothstep(0.25, 0.70, h);
      ribbon = mix(ribbon, mix(BLUE, VIOLET, 0.4), cleft * 0.80);

      float off = max(-within, 0.0);
      col += BLUE * exp(-off / (girth * 0.7 + 1.0)) * (1.0 - body) * shown * uBolt * 0.60;
      col += INDIGO * exp(-off / (girth * 5.0 + 4.0)) * shown * uBolt * 0.32;
      lay(col, alpha, ribbon, body * smoothstep(0.0, 0.25, uBolt));

      float cell = floor(wy / 27.0);
      float yc = (cell + 0.5) * 27.0;
      float side = hash(vec2(cell, uSeed + 12.0)) < 0.5 ? -1.0 : 1.0;
      float reach = (4.0 + 9.0 * hash(vec2(cell, uSeed + 13.0))) * scale;
      vec2 spur = vec2(centre + side * girth * 0.7, yc);
      float chip = segment(p, spur, spur + vec2(side * reach * 0.55, -reach));
      float sprout = step(0.45, hash(vec2(cell, uSeed + 14.0))) * step(8.0, p.y) * shown;
      lay(col, alpha, mix(LILAC, BLUSH, heat), smoothstep(0.85, 0.25, chip) * sprout * uBolt * 0.85);
    }

    if (uFlash > 0.001) {
      float foot = length(vec2(p.x, (p.y - 2.0) * 1.35));
      float smear = smoothstep(0.34, 0.74, noise(vec2(p.x * 0.75 + uSeed, p.y * 0.045 - uTime * 4.0)));
      float tuft = 0.35 + 0.65 * noise(vec2(p.x * 0.10 - uSeed, uSeed));
      float plume = exp(-p.x * p.x / (uRadius * uRadius * 0.20)) * smoothstep(uRadius * 2.2 * tuft, 0.0, p.y) * smoothstep(-2.0, uRadius * 0.25, p.y);

      col += BLUE * exp(-foot / (uRadius * 1.1)) * uFlash * 0.30;
      col += LILAC * exp(-foot / (uRadius * 0.45)) * uFlash * 0.32;
      lay(col, alpha, BLUSH, smear * plume * uFlash * 0.85);

      float jag = corona(p, 0.25 + 0.75 * uSpread) + (noise(p * 0.22 + uSeed * 2.0) - 0.5) * 0.5;
      float brushed = 0.55 + 0.45 * noise(vec2(p.x * 0.9 + uSeed, p.y * 0.14));
      float stroke = smoothstep(0.35, -0.25, jag);
      col += VIOLET * exp(-max(jag, 0.0) / 1.6) * (1.0 - stroke) * uCrown * 0.16;
      lay(col, alpha, mix(BLUSH, WHITE, smoothstep(0.0, -1.6, jag) * 0.8), stroke * (0.80 + 0.20 * brushed) * uCrown * 0.78);

      float flare = length(vec2(p.x, (p.y - 2.0) * (p.y > 2.0 ? 0.70 : 1.50)));
      lay(col, alpha, BLUSH, exp(-flare / (uRadius * 0.20)) * uFlash * 0.65);
      lay(col, alpha, WHITE, exp(-flare / (uRadius * 0.13)) * uFlash * 1.5);
    }

    if (uGlow > 0.001 && uFlash < 0.05) {
      float tick = floor(uTime * 7.0);
      float lit = step(0.62, hash(vec2(tick, uSeed + 6.0))) * uGlow * live;
      vec2 base = vec2((hash(vec2(tick, uSeed)) - 0.5) * uRadius * 1.2, (hash(vec2(tick, uSeed + 2.0)) - 0.5) * uRadius * 0.4);
      vec2 tip = base + vec2((hash(vec2(tick, uSeed + 3.0)) - 0.5) * uRadius * 0.8, uRadius * (0.3 + 0.5 * hash(vec2(tick, uSeed + 4.0))));
      vec2 s = bolt(p, tip, base, uRadius * 0.16, uSeed + tick, 1.0);
      float frayed = smoothstep(0.30, 0.45, noise(p * 0.35 + tick));
      lay(col, alpha, mix(BLUE, LILAC, 0.6), smoothstep(0.60, 0.15, s.y) * frayed * lit * 0.70);
      col += BLUE * exp(-s.y / 2.0) * lit * 0.12;
    }

    float crownFade = smoothstep(1.0, 0.72, h);
    col *= crownFade;
    alpha *= crownFade;
  } else {
    vec2 q = fragCoord - resolution * 0.5;
    vec2 a = vec2(uAx, uAy);
    vec2 c = vec2(uBx, uBy);
    float span = max(length(c - a), 1.0);
    vec2 axis = (c - a) / span;
    vec2 nrm = vec2(-axis.y, axis.x);
    float tick = floor(uTime * 14.0);
    float seed = uSeed + tick;

    float u = dot(q - a, axis);
    float t = clamp(u / span, 0.0, 1.0);
    float ends = smoothstep(0.0, 0.10, t) * smoothstep(1.0, 0.90, t);
    float v = dot(q - a, nrm) - sin(3.14159265 * t) * span * 0.10 * nrm.y;
    float wu = u + (noise(vec2(u * 0.05, seed)) - 0.5) * 22.0;
    float beyond = max(max(-u, u - span), 0.0) * 2.0;

    float sway = span * 0.17;
    float main = trace(t, sway, seed) * ends + ((stepped(wu, 7.0, seed + 7.0) - 0.5) * 4.2 + (stepped(wu, 3.0, seed + 9.0) - 0.5) * 1.4) * ends;
    float rough = stepped(wu, 12.0, seed + 1.0);
    float girth = (0.22 + 1.05 * rough * rough) * (0.40 + 0.60 * ends);
    float rip = smoothstep(0.16, 0.24, stepped(wu + 3.0, 10.0, seed + 5.0));
    float within = girth - abs(v - main) - beyond;
    float body = smoothstep(-0.45, 0.35, within) * rip;
    float off = max(-within, 0.0);

    float cell = floor(wu / 29.0);
    float uc = (cell + 0.5) * 29.0;
    float side = hash(vec2(cell, seed + 12.0)) < 0.5 ? -1.0 : 1.0;
    float reach = 5.0 + 11.0 * hash(vec2(cell, seed + 13.0));
    vec2 fork = vec2(uc, trace(clamp(uc / span, 0.0, 1.0), sway, seed));
    vec2 prong = fork + vec2(reach * 0.8, side * reach);
    float sprig = min(segment(vec2(u, v), fork, prong), segment(vec2(u, v), prong, prong + vec2(reach * 0.5, -side * reach * 0.25)));
    float sprout = step(0.40, hash(vec2(cell, seed + 14.0))) * step(8.0, uc) * step(uc, span - 8.0);

    float twin = trace(t, span * 0.20, seed + 31.0) * ends + (stepped(wu, 8.0, seed + 17.0) - 0.5) * 3.0 * ends;
    float torn = smoothstep(0.52, 0.62, stepped(wu, 13.0, seed + 8.0));
    float hair = smoothstep(0.65, 0.15, abs(v - twin) + beyond) * torn;

    col += INDIGO * exp(-off / 7.0) * uBolt * 0.20;
    col += BLUE * exp(-off / 1.8) * (1.0 - body) * (0.45 + 0.55 * rip) * uBolt * 0.40;
    lay(col, alpha, mix(INDIGO, LILAC, 0.45), hair * uBolt * 0.55);
    lay(col, alpha, mix(BLUE, LILAC, 0.6), smoothstep(0.60, 0.15, sprig) * sprout * uBolt * 0.75);
    lay(col, alpha, mix(LILAC, WHITE, smoothstep(0.0, girth, within) * 0.8), body * uBolt);
  }

  float fringe = min(min(fragCoord.x, resolution.x - fragCoord.x), min(fragCoord.y, resolution.y - fragCoord.y));
  gl_FragColor = vec4(col, alpha) * smoothstep(0.0, 24.0, fringe);
}
`;
