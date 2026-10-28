import { NOISE } from "./common";

export const getMeteorFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uSize;
uniform float uHeat;
uniform float uTravel;
uniform float uFade;
uniform float uGone;

varying vec2 fragCoord;
${NOISE}
const float NOSE = 30.0;

vec3 fire(float heat) {
  vec3 c = mix(vec3(0.220, 0.050, 0.030), vec3(0.600, 0.120, 0.040), smoothstep(0.00, 0.30, heat));
  c = mix(c, vec3(0.880, 0.300, 0.070), smoothstep(0.28, 0.55, heat));
  c = mix(c, vec3(1.000, 0.560, 0.160), smoothstep(0.50, 0.78, heat));
  c = mix(c, vec3(1.000, 0.800, 0.450), smoothstep(0.74, 0.95, heat));
  return mix(c, vec3(1.000, 0.960, 0.860), smoothstep(0.92, 1.15, heat));
}

void main(void) {
  float s = uSize * mix(0.45, 1.0, uHeat);
  vec2 q = vec2(fragCoord.x - (resolution.x - NOSE), fragCoord.y - resolution.y * 0.5);
  float back = max(-q.x, 0.0);
  float behind = smoothstep(s * 0.5, -s * 0.2, q.x);
  float live = 1.0 - clamp(uFade, 0.0, 1.0);
  float lit = live * (1.0 - clamp(uGone, 0.0, 1.0));
  vec2 w = vec2(back + uTravel, q.y);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  float fl = fbm(vec2(w.x * 0.09 - uTime * 0.8, q.y * 0.20) + uSeed * 3.0);
  float fl2 = noise(vec2(w.x * 0.25 - uTime * 1.5, q.y * 0.45) + uSeed * 5.0);
  float fw = s * 0.85 + back * 0.08;
  float flen = s * 7.0 * uHeat + s * 1.5;
  float flame = smoothstep(fw * (0.55 + 0.8 * fl), fw * 0.15, abs(q.y)) * smoothstep(flen, flen * 0.3, back) * behind;
  flame *= smoothstep(0.20, 0.50, fl * 0.75 + fl2 * 0.35 + smoothstep(s * 3.5, 0.0, back) * 0.45 - back / flen * 0.30);
  float fheat = 0.44 + fl * 0.30 + fl2 * 0.18 + smoothstep(s * 4.5, 0.0, back) * 0.42 - back / flen * 0.30;
  float flake = smoothstep(0.62, 0.78, noise(w * vec2(0.30, 0.42) + uSeed * 9.0 - vec2(uTime * 2.0, 0.0))) * flame;
  fheat += flake * 0.30;
  float fa = flame * 0.95 * lit;
  col = col * (1.0 - fa) + fire(fheat * mix(0.7, 1.0, uHeat)) * fa;
  alpha = alpha * (1.0 - fa) + fa;

  vec2 h = vec2(q.x / (s * 1.0), q.y / (s * 0.62));
  vec2 hc = vec2(h.x + 0.35, h.y);
  float hd = length(vec2(hc.x * (hc.x > 0.0 ? 1.0 : 0.42), hc.y));
  float rock = smoothstep(1.0, 0.86, hd + (noise(h * 3.0 + uSeed) - 0.5) * 0.12);
  vec2 hw = h * vec2(0.8, 1.2) + vec2(fbm(h * 1.8 + uSeed), fbm(h * 1.8 - uSeed)) * 0.7 + uSeed;
  float cells = seams(hw);
  float vein = smoothstep(0.24, 0.08, cells) * smoothstep(0.25, 0.55, noise(h * 2.5 + uSeed * 2.0));
  float nose = smoothstep(-0.9, 0.65, hc.x);
  float rheat = 0.86 + nose * 0.20 - vein * 0.22 * (1.2 - nose) + (fbm(h * 3.0 + uSeed) - 0.5) * 0.08;
  rheat = rheat * mix(0.75, 1.0, uHeat) + (noise(h * 6.0 + uTime * 2.0) - 0.5) * 0.06;
  float ra = rock * lit;
  col = col * (1.0 - ra) + fire(rheat) * ra;
  alpha = alpha * (1.0 - ra) + ra;

  float ax = q.x - s * 0.75;
  float shell = s * 1.0 * sqrt(max(-ax, 0.0) / s + 0.05);
  float streak = noise(vec2(ax * 0.12 - uTime * 3.0, q.y / max(shell, 1.0) * 6.0 + uSeed));
  float sheet = smoothstep(s * (0.25 + 0.35 * streak), 0.0, abs(abs(q.y) - shell)) * smoothstep(-s * 4.5, -s * 0.5, ax) * smoothstep(s * 0.3, -s * 0.1, ax);
  sheet *= 0.20 + 0.65 * smoothstep(0.35, 0.8, streak);
  float sa = sheet * 0.45 * uHeat * lit * (1.0 - ra);
  col = col * (1.0 - sa) + vec3(0.700, 0.460, 0.300) * sa;
  alpha = alpha * (1.0 - sa) + sa;

  float glow = exp(-length(vec2(q.x + s * 0.3, q.y * 1.4)) / (s * 1.1));
  col += vec3(1.000, 0.450, 0.140) * glow * 0.35 * lit * uHeat;

  vec2 m = min(fragCoord, resolution - fragCoord);
  float border = smoothstep(0.0, 10.0, min(m.x, m.y));
  gl_FragColor = vec4(col, min(alpha, 1.0)) * border;
}
`;
