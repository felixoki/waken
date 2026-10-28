import { NOISE } from "./common";

export const getSpikesFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uGround;
uniform float uRadius;
uniform float uLead;
uniform float uAge;

varying vec2 fragCoord;
${NOISE}
const float SQUASH = 0.55;
const float PI = 3.14159265;

vec3 ember(float heat) {
  vec3 c = mix(vec3(0.300, 0.060, 0.030), vec3(0.780, 0.230, 0.060), smoothstep(0.0, 0.4, heat));
  c = mix(c, vec3(1.000, 0.580, 0.200), smoothstep(0.4, 0.8, heat));
  return mix(c, vec3(1.000, 0.880, 0.640), smoothstep(0.8, 1.1, heat));
}

float band(float a, float b, float t) {
  return clamp((t - a) / (b - a), 0.0, 1.0);
}

void paint(inout vec3 col, inout float alpha, vec3 c, float a) {
  col = col * (1.0 - a) + c * a;
  alpha = alpha * (1.0 - a) + a;
}

void main(void) {
  vec2 p = vec2(fragCoord.x - resolution.x * 0.5, fragCoord.y - uGround);
  vec2 e = vec2(p.x, p.y / SQUASH);
  float R = uRadius;
  float rn = length(e) / R;
  float ang = atan(e.y, e.x);
  vec2 dir = vec2(cos(ang), sin(ang));
  float fade = 1.0 - band(1.20, 1.70, uAge);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  {
    vec2 raw = p;
    p = floor(p) + 0.5;
    e = vec2(p.x, p.y / SQUASH);
    rn = length(e) / R;
    ang = atan(e.y, e.x);
    dir = vec2(cos(ang), sin(ang));
    float wake = band(-uLead, 0.05, uAge);
    float edge = 1.15 + (fbm(dir * 1.7 + uSeed) - 0.5) * 0.30;
    float shade = smoothstep(edge, edge - 0.45, rn + (fbm(e * 0.08 + uSeed) - 0.5) * 0.25) * wake * fade;
    paint(col, alpha, vec3(0.055, 0.045, 0.060), floor(shade * 3.0 + 0.5) / 3.0 * 0.40);
    float lit = band(-0.02, 0.10, uAge) * (1.0 - band(0.42, 0.75, uAge));
    float flare = 0.85 + 0.15 * sin(uTime * 37.0) * sin(uTime * 23.0 + 1.7);
    vec2 sp = vec2(raw.x, (raw.y + R * 0.08) / SQUASH);
    float pool = exp(-dot(sp, sp) / (R * R * 0.30)) * lit * flare;
    col += vec3(1.000, 0.380, 0.120) * pool * 0.20;
    alpha = max(alpha, pool * 0.12);

    float twist = ang + rn * 2.4 + (noise(dir * 1.3 + uSeed) - 0.5) * 0.8;
    float turn = twist / (2.0 * PI);
    vec2 q = vec2(fract(turn) * 7.0 + (noise(vec2(rn * 3.0, uSeed)) - 0.5) * 0.4, log(max(rn, 0.04)) * 2.2 + uSeed);
    float web = seams(vec2(mod(q.x, 7.0), q.y));
    float span = rn * R * (2.0 * PI / 7.0);
    float dist = web * span * 0.45;
    float grownTo = wake * edge * 1.05;
    float reach = smoothstep(grownTo, grownTo - 0.15, rn) * smoothstep(0.16, 0.26, rn);
    float gaps = smoothstep(0.40, 0.52, noise(e * 0.11 + uSeed * 2.0)) * smoothstep(0.28, 0.40, noise(e * 0.30 - uSeed));
    float rough = noise(e * 0.22 + uSeed * 3.0);
    float width = 0.45 * (0.45 + 1.3 * rough * rough);
    float line = step(dist, 0.55) * step(0.5, reach * gaps) * fade;
    float hot = clamp(1.0 - band(0.25, 1.30, uAge), 0.0, 1.0);
    float flick = step(0.35, noise(vec2(rn * 9.0, floor(uTime * 8.0) + uSeed)));
    float heat = 0.40 + 0.40 * hot * (0.6 + 0.4 * flick);
    vec3 lc = hot > 0.15 ? ember(floor(heat * 4.0) / 4.0) : vec3(0.040, 0.030, 0.035);
    paint(col, alpha, lc, line);

    vec2 cw = raw / R;
    cw += (vec2(fbm(cw * 3.0 + uSeed), fbm(cw * 3.0 - uSeed)) - 0.5) * 0.35;
    float cr = seams(vec2(cw.x * 3.0, cw.y / SQUASH * 3.0) + uSeed * 5.0);
    float split = band(-0.01, 0.12, uAge);
    float zone = smoothstep(0.95 * split, 0.55 * split, length(vec2(raw.x, raw.y / SQUASH)) / R + (noise(cw * 5.0) - 0.5) * 0.25);
    float open = smoothstep(0.52, 0.64, noise(cw * vec2(5.0, 8.0) + uSeed * 7.0));
    float glowT = 1.0 - band(0.55, 1.45, uAge);
    float core = smoothstep(0.045, 0.015, cr) * zone * open * fade;
    float bloom = exp(-cr / 0.07) * zone * open * fade;
    float pulse = 0.80 + 0.20 * sin(uTime * 9.0 + cr * 30.0);
    paint(col, alpha, vec3(0.060, 0.015, 0.012), core * 0.55);
    col += vec3(1.000, 0.160, 0.070) * core * (0.30 + 0.60 * glowT) * pulse;
    col += vec3(0.950, 0.090, 0.040) * bloom * 0.18 * glowT * pulse;
    alpha = max(alpha, bloom * 0.20 * glowT);
  }

  vec2 m = min(fragCoord, resolution - fragCoord);
  float border = smoothstep(0.0, 12.0, min(m.x, m.y));
  gl_FragColor = vec4(col, min(alpha, 1.0)) * border;
}
`;
