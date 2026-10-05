import { NOISE } from "./common";

export const getNovaFrag = (): string => `
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uRadius;
uniform float uCharge;
uniform float uBurst;
uniform float uFlash;
uniform float uFade;

varying vec2 fragCoord;
${NOISE}
const float SQUASH = 0.60;
const vec3 NIGHT = vec3(0.050, 0.035, 0.160);
const vec3 DEPTH = vec3(0.180, 0.065, 0.400);
const vec3 VIOLET = vec3(0.260, 0.090, 0.520);
const vec3 PURPLE = vec3(0.420, 0.140, 0.700);
const vec3 ORCHID = vec3(0.600, 0.250, 0.780);
const vec3 ROSE = vec3(0.700, 0.270, 0.740);
const vec3 LILAC = vec3(0.740, 0.500, 0.880);
const vec3 IRIS = vec3(0.320, 0.330, 0.820);
const vec3 SKY = vec3(0.360, 0.520, 0.860);
const vec3 PALE = vec3(0.520, 0.700, 0.960);
const vec3 AZURE = vec3(0.150, 0.360, 0.900);
const vec3 INDIGO = vec3(0.150, 0.170, 0.560);
const vec3 SMOKE = vec3(0.440, 0.200, 0.560);
const vec3 SOOT = vec3(0.150, 0.065, 0.270);

float lap(vec2 p, float per) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(vec2(mod(i.x, per), i.y));
  float b = hash(vec2(mod(i.x + 1.0, per), i.y));
  float c = hash(vec2(mod(i.x, per), i.y + 1.0));
  float d = hash(vec2(mod(i.x + 1.0, per), i.y + 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 facet(vec2 p, float per) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float best = 8.0;
  float id = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 cell = vec2(mod(i.x + o.x, per), i.y + o.y);
      vec2 pt = o + vec2(hash(cell), hash(cell + 7.3)) - f;
      float d = dot(pt, pt);
      if (d < best) {
        best = d;
        id = hash(cell + 3.1);
      }
    }
  }
  return vec2(id, sqrt(best));
}

float rim(vec2 q, float size) {
  vec2 e = vec2(q.x, q.y / SQUASH);
  vec2 d = normalize(e + 0.0001);
  float lump = (fbm(d * 1.3 + uSeed) - 0.5) * 0.13 + (noise(d * 4.5 - uSeed) - 0.5) * 0.045;
  return length(e) / size - lump;
}

float stroke(vec2 dir, float turn, float edge, float at, float seed, float torn) {
  float sweep = noise(dir * 1.15 + seed);
  float gaps = smoothstep(0.28 + torn * 0.24, 0.50 + torn * 0.24, sweep);
  float width = 0.060 + 0.140 * pow(noise(dir * 2.3 - seed), 1.2);
  float off = (noise(dir * 2.0 + seed + 5.0) - 0.5) * 0.09;
  float bristle = 0.50 + 0.50 * lap(vec2(turn * 214.0, edge * 46.0 + seed), 214.0);
  float chunk = smoothstep(0.30, 0.62, lap(vec2(turn * 58.0, edge * 9.0 + seed), 58.0));
  float tip = smoothstep(0.0, 0.16, gaps) * mix(1.0, bristle * chunk, 1.0 - gaps * 0.75);
  float d = abs(edge - at - off);
  float core = smoothstep(width, width * 0.30, d);
  return core * (0.55 + 0.45 * smoothstep(width * 0.6, 0.0, d)) * tip;
}

void main(void) {
  vec2 p = fragCoord - resolution * 0.5;
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec2 e = vec2(p.x, p.y / SQUASH);
  float rad = length(e);
  float ang = atan(e.y, e.x);
  vec2 dir = vec2(cos(ang), sin(ang));

  if (uBurst > 0.001) {
    float size = uRadius * uBurst * (1.0 + uFade * 0.10);
    vec2 en = e / size;
    float rn = rad / size;
    float calm = smoothstep(0.0, 0.45, uFade);
    float live = 1.0 - smoothstep(0.72, 1.0, uFade);
    float near = smoothstep(0.55, -0.85, dir.y);
    float edge = rim(p, size);
    float inside = smoothstep(1.0, 0.88, edge);

    float turn = (ang + 3.14159265) / 6.2831853;
    float pace = 0.25 + 0.75 * noise(dir * 1.7 + uSeed + 13.0);
    float lag = noise(dir * 2.9 - uSeed) * 6.0;
    float flow = rn * 2.4 - (uTime * mix(0.70, 0.12, calm) + lag) * pace;
    vec2 jit = vec2(noise(dir * 3.0 + rn * 2.0), noise(dir * 3.0 + rn * 2.0 + 5.0)) * 0.35;
    vec2 shard = facet(vec2(turn * 22.0, flow * 0.6 + uSeed) + jit, 22.0);
    vec2 chip = facet(vec2(turn * 56.0, flow * 1.3 + uSeed + 9.0) + jit, 56.0);
    float fibre = lap(vec2(turn * 44.0, rn * 1.4 - uTime * 0.55 * pace + uSeed), 44.0) * 0.6;
    fibre += lap(vec2(turn * 88.0, rn * 2.8 + uTime * 0.35 * (1.0 - pace) - uSeed), 88.0) * 0.4;
    float blob = fbm(en * 1.7 + uSeed + dir * 0.3 - vec2(uTime * 0.05, uTime * 0.07));
    float fine = fbm(en * 4.2 - uSeed + vec2(-uTime * 0.09, uTime * 0.06));
    float zone = smoothstep(0.22, 0.60, rn) * smoothstep(1.02, 0.72, rn);

    float reach = smoothstep(0.12, 0.55, rn);
    float tone = blob * 0.62 + fine * 0.20 + ((shard.x - 0.5) * 0.12 + (fibre - 0.5) * 0.22) * reach;
    tone += near * 0.27 + zone * 0.16 + 0.07;

    vec3 c = mix(DEPTH, VIOLET, smoothstep(0.22, 0.40, tone));
    c = mix(c, PURPLE, smoothstep(0.38, 0.58, tone));
    c = mix(c, ORCHID, smoothstep(0.56, 0.78, tone));
    c = mix(c, ROSE, near * smoothstep(0.52, 0.82, tone) * 0.55);
    c = mix(c, LILAC, smoothstep(0.86, 1.06, tone) * 0.34);
    c = mix(c, LILAC, smoothstep(0.80, 0.86, chip.x) * 0.10 * zone);
    c = mix(c, DEPTH, smoothstep(0.16, 0.10, chip.x) * 0.16);
    c *= 0.93 + 0.10 * smoothstep(0.0, 0.5, chip.y);

    float spoke = pow(lap(vec2(turn * 94.0, rn * 0.8 - uTime * 0.7 * pace + uSeed), 94.0), 4.0);
    c = mix(c, LILAC, spoke * smoothstep(0.35, 0.80, rn) * 0.26);

    vec2 pe = (en - vec2(0.08, -0.04)) * vec2(0.80, 1.10);
    float ragged = (fbm(en * 3.2 + uSeed * 2.0) - 0.5) * 0.42 + (chip.x - 0.5) * 0.12 * reach;
    float pit = smoothstep(0.58 + ragged, 0.22 + ragged * 0.5, length(pe));
    vec3 hollow = mix(NIGHT, VIOLET * 0.55, smoothstep(0.35, 0.80, fbm(en * 6.0 + uSeed)));
    vec2 slab = facet(en * 5.5 + uSeed + 40.0, 4096.0);
    hollow += vec3(0.070, 0.035, 0.140) * step(0.62, slab.x);
    hollow = mix(hollow, PURPLE * 0.55, step(0.90, slab.x) * 0.5);
    hollow *= 0.90 + 0.20 * hash(floor(fragCoord * 0.7));
    c = mix(c, hollow, pit * 0.94);

    float a = inside * 0.88;

    float spin = ang + rn * 1.3 - uTime * 0.10;
    vec2 orbit = vec2(cos(spin), sin(spin)) * (0.9 + rn * 1.5);
    vec2 sm = vec2(en.x * 1.6 + en.y * 0.9, en.y * 2.1 - en.x * 0.6);
    float curl = fbm(sm * 1.9 + uSeed);
    float cloud = fbm(orbit * 1.25 + uSeed + curl * 0.9) * 0.62 + fbm(sm * 1.3 - uSeed + curl * 0.5) * 0.38;
    float wisp = noise(vec2(sm.x * 9.0 + curl * 3.0, sm.y * 2.2));
    float mass = smoothstep(0.24 + uFade * 0.34, 0.48 + uFade * 0.34, cloud + 0.06) * (0.72 + 0.28 * wisp);
    vec3 haze = mix(SOOT, SMOKE, smoothstep(0.44, 0.74, cloud) * (0.70 + 0.30 * wisp));
    haze = mix(haze, vec3(0.600, 0.400, 0.720), smoothstep(0.60, 0.82, cloud) * wisp * 0.75);
    float body = smoothstep(0.16, 0.36, rn);
    float settled = inside * (mass * 0.80 * body + (1.0 - mass) * 0.30) * live;
    vec3 rest = mix(NIGHT, haze, mass * body);

    c = mix(c, rest, calm);
    a = mix(a, settled, calm);

    col = c * a;
    alpha = a;

    float veil = exp(-max(edge - 1.0, 0.0) * 0.9) * smoothstep(0.94, 1.10, edge) * mix(0.72, 0.42, calm) * live;
    col = col * (1.0 - veil) + NIGHT * veil;
    alpha = alpha * (1.0 - veil) + veil;

    float broad = pow(lap(vec2(turn * 23.0, 2.0 + uSeed), 23.0), 1.6);
    float thin = pow(lap(vec2(turn * 82.0, 6.0 - uSeed), 82.0), 3.0);
    float beyond = smoothstep(1.0, 1.08, edge);
    float push = (0.45 + 0.55 * uFlash) * (1.0 - calm);
    float mid = pow(lap(vec2(turn * 47.0, 9.0 + uSeed * 4.0), 47.0), 2.2);
    float sway = fbm(dir * 2.0 + vec2(rn * 0.8 - uTime * 0.6, uSeed));
    float smear = 0.55 + 0.45 * lap(vec2(turn * 61.0, rn * 1.2 - uTime * 1.4), 61.0);
    float rays = (broad * 0.90 + mid * 0.60 + thin * 0.40) * (0.50 + 0.95 * sway) * smear;
    col += INDIGO * rays * beyond * exp(-(rn - 1.0) * 1.05) * push * 0.58;
    col += SKY * pow(mid, 2.5) * sway * beyond * exp(-(rn - 1.0) * 3.2) * push * 0.16;

    float shape = 0.40 + 1.15 * noise(dir * 2.6 - uSeed);
    float lean = clamp(near + smoothstep(0.2, -0.9, dir.x) * 0.5, 0.0, 1.0);
    float width = (0.035 + 0.115 * lean) * shape;
    float fray = 0.70 + 0.30 * lap(vec2(turn * 120.0, edge * 30.0 + uSeed), 120.0);
    float nick = smoothstep(0.10, 0.24, noise(dir * 8.0 + uSeed + 31.0));
    float band = pow(smoothstep(width, 0.0, abs(edge - 0.97)), 0.8) * fray * nick;
    float bright = smoothstep(0.45, 0.80, noise(dir * 2.0 + uSeed + 4.0));
    vec3 glowing = mix(IRIS * 0.85, SKY, clamp(lean * 0.70 + bright * 0.40, 0.0, 1.0)) * (0.62 + 0.36 * lean);
    glowing = mix(glowing, vec3(0.440, 0.300, 0.820), smoothstep(0.52, 0.80, noise(dir * 3.3 + uSeed + 20.0)) * 0.65);
    glowing = mix(glowing, vec3(0.240, 0.600, 0.780), smoothstep(0.58, 0.84, noise(dir * 2.7 - uSeed + 27.0)) * 0.55);

    float twin = smoothstep(0.035, 0.0, abs(edge - 0.86)) * smoothstep(0.52, 0.74, noise(dir * 1.5 + uSeed + 11.0)) * near;
    float trace = smoothstep(0.010, 0.0, abs(edge - 0.905)) * smoothstep(0.50, 0.70, noise(dir * 1.8 + uSeed + 17.0)) * (1.0 - near);

    float hot = (1.0 - calm) * live;
    float r = band * 0.92 * hot;
    col = col * (1.0 - r) + glowing * r;
    alpha = alpha * (1.0 - r) + r;
    col += LILAC * twin * 0.40 * hot;
    col += vec3(0.200, 0.620, 0.700) * trace * 0.50 * hot;
    col += mix(IRIS, SKY, lean * 0.5) * exp(-abs(edge - 0.97) * size / (10.0 + 26.0 * lean)) * (0.22 + 0.20 * lean) * hot * (1.0 - r);

    float rise = 0.0;
    for (int k = 1; k <= 4; k++) {
      float fk = float(k);
      rise += smoothstep(0.075, 0.0, abs(rim(p - vec2(0.0, fk * 4.5), size) - 0.97)) * (1.0 - fk * 0.2);
    }
    col += mix(IRIS, SKY, near * 0.5) * rise * 0.085 * hot;

    float outer = stroke(dir, turn, edge, 0.985, uSeed * 3.0, uFade);
    float inner = stroke(dir, turn, edge, 0.850, uSeed * 3.0 + 21.0, uFade) * 0.55;
    float faint = stroke(dir, turn, edge, 0.470, uSeed * 3.0 + 37.0, uFade + 0.25) * 0.30;
    float cool = calm * live;

    vec3 paint = mix(vec3(0.070, 0.160, 0.480), vec3(0.220, 0.440, 0.860), smoothstep(0.30, 0.85, outer));
    paint = mix(paint, PALE, smoothstep(0.82, 1.0, outer) * 0.65);
    paint = mix(paint, vec3(0.300, 0.220, 0.700), smoothstep(0.54, 0.80, noise(dir * 3.1 + uSeed + 20.0)) * 0.55);
    paint = mix(paint, vec3(0.160, 0.520, 0.700), smoothstep(0.60, 0.84, noise(dir * 2.6 - uSeed + 27.0)) * 0.50);
    float s1 = min(outer * 1.2, 1.0) * 0.62 * cool;
    col = col * (1.0 - s1) + paint * s1;
    alpha = alpha * (1.0 - s1) + s1;

    float s2 = inner * 0.70 * cool;
    col = col * (1.0 - s2) + AZURE * 0.85 * s2;
    alpha = alpha * (1.0 - s2) + s2;

    float s4 = stroke(dir, turn, edge, 1.045, uSeed * 3.0 + 53.0, uFade + 0.10) * 0.42 * cool;
    col = col * (1.0 - s4) + vec3(0.110, 0.240, 0.640) * s4;
    alpha = alpha * (1.0 - s4) + s4;

    float s3 = faint * cool;
    col = col * (1.0 - s3) + SMOKE * 1.2 * s3;
    alpha = alpha * (1.0 - s3) + s3;

    float halo = exp(-abs(edge - 0.985) * size / 13.0) * smoothstep(0.30, 0.60, noise(dir * 1.15 + uSeed * 3.0));
    col += AZURE * halo * 0.26 * cool;
    col += AZURE * exp(-abs(edge - 0.95) * 5.0) * 0.08 * cool;

    col += vec3(0.780, 0.700, 1.000) * inside * max(uFlash - 0.60, 0.0) * 0.28;
  }

  if (uCharge > 0.001) {
    vec2 q = p - vec2(0.0, 12.0);
    float qa = atan(q.y, q.x);
    float lump = (noise(vec2(cos(qa), sin(qa)) * 1.4 + uTime * 1.5 + uSeed) - 0.5) * 0.22;
    float r = 25.0 * uCharge * (1.0 + sin(uTime * 22.0) * 0.03) * (1.0 + lump);
    float d = length(q);
    float n = d / max(r, 0.001);

    float shell = smoothstep(1.0, 0.78, n);
    float swirl = fbm(vec2(qa * 1.6 - uTime * 4.0, n * 2.0 + uSeed));
    vec3 c = mix(VIOLET, PURPLE, swirl * 0.8 + 0.2 * n);
    float a = shell * (0.50 + 0.25 * swirl) * uCharge;
    col = col * (1.0 - a) + c * a;
    alpha = alpha * (1.0 - a) + a;

    float side = pow(abs(cos(qa + 0.3 + sin(uTime * 3.0) * 0.3)), 1.6);
    float arc = smoothstep(0.40, 0.60, noise(vec2(qa * 1.2 - uTime * 3.0, uSeed))) * side;
    col += vec3(0.600, 0.700, 1.000) * smoothstep(1.1, 0.25, abs(d - r * 0.97)) * arc * uCharge * 0.60;
    float wisp = smoothstep(0.62, 0.80, noise(vec2(qa * 1.7 + uTime * 6.0, n * 3.0)));
    col += SKY * smoothstep(1.2, 0.3, abs(d - r * 0.62)) * wisp * uCharge * 0.45;
    col += PURPLE * exp(-max(n - 0.8, 0.0) * 2.4) * (1.0 - shell) * uCharge * 0.50;
  }

  float fringe = min(min(fragCoord.x, resolution.x - fragCoord.x), min(fragCoord.y, resolution.y - fragCoord.y));
  gl_FragColor = vec4(col, alpha) * smoothstep(0.0, 26.0, fringe);
}
`;
