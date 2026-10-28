import { NOISE } from "./common";

export const getBreathFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uLayer;
uniform float uLength;
uniform float uOn;
uniform float uReach;
uniform float uBurnt;
uniform float uAfter;

varying vec2 fragCoord;
${NOISE}
const float MARGIN = 16.0;
const float SPREAD = 0.29;

vec3 fire(float heat) {
  vec3 c = mix(vec3(0.200, 0.045, 0.030), vec3(0.560, 0.110, 0.040), smoothstep(0.00, 0.30, heat));
  c = mix(c, vec3(0.860, 0.290, 0.070), smoothstep(0.28, 0.52, heat));
  c = mix(c, vec3(1.000, 0.540, 0.150), smoothstep(0.48, 0.72, heat));
  c = mix(c, vec3(1.000, 0.780, 0.420), smoothstep(0.70, 0.90, heat));
  return mix(c, vec3(1.000, 0.950, 0.820), smoothstep(0.88, 1.10, heat));
}

void over(inout vec3 col, inout float alpha, vec3 c, float a) {
  col = col * (1.0 - a) + c * a;
  alpha = alpha * (1.0 - a) + a;
}

void main(void) {
  float x = fragCoord.x - MARGIN;
  float y = fragCoord.y - resolution.y * 0.5;
  float t = x / uLength;
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  float side = y > 0.0 ? 1.0 : -1.0;
  float ragged = fbm(vec2(x * 0.035 - uTime * 3.2, side * 3.0 + uSeed));
  float wide = (2.5 + uLength * SPREAD * pow(clamp(t, 0.0, 1.2), 0.9)) * (0.70 + 0.60 * ragged);
  float d = abs(y) / wide;
  float tip = uReach + (fbm(vec2(y * 0.08, uTime * 2.0 + uSeed)) - 0.5) * 0.25;
  float ahead = smoothstep(tip + 0.04, tip - 0.14, t) * step(0.0, x);

  if (uLayer < 0.5) {
    float lightZone = smoothstep(0.05, 0.6, t) * smoothstep(1.3, 0.9, t + (ragged - 0.5) * 0.2);
    float flick = 0.85 + 0.15 * noise(vec2(uTime * 7.0, t * 3.0 + uSeed));
    float pool = exp(-d * d * 1.2) * lightZone * ahead * uOn * flick;
    col += vec3(1.000, 0.500, 0.180) * pool * 0.30;

    float burnt = smoothstep(uBurnt + 0.02, uBurnt - 0.15, t) * step(0.0, x) * smoothstep(0.08, 0.35, t);
    float cool = clamp(uAfter / 1.6, 0.0, 1.0);
    float fade = 1.0 - smoothstep(1.4, 2.4, uAfter);
    vec2 g = vec2(x, y);
    float patchy = fbm(g * 0.07 + uSeed);
    float edge = smoothstep(1.15, 0.55, d + (patchy - 0.5) * 0.6);
    float soot = burnt * edge * smoothstep(0.35, 0.65, patchy + 0.15) * 0.30 * fade;
    over(col, alpha, vec3(0.055, 0.040, 0.032), soot);

    float crack = seams(g * 0.11 + vec2(fbm(g * 0.05 + uSeed), 0.0) * 1.2 + uSeed);
    float gaps = smoothstep(0.50, 0.62, noise(g * 0.09 + uSeed * 2.0)) * smoothstep(0.36, 0.48, noise(g * 0.25 - uSeed));
    float line = smoothstep(0.030, 0.008, crack) * gaps * smoothstep(0.75, 0.3, d) * burnt * edge * fade;
    over(col, alpha, vec3(0.040, 0.030, 0.025), line * 0.6);
    col += fire(0.62 - cool * 0.3) * line * (1.0 - cool) * 0.9;
  } else {
    vec2 flow = vec2(x * 0.020 - uTime * 4.5, y / wide * 4.0);
    float streak = fbm(flow + uSeed);
    float roll = fbm(vec2(x * 0.045 - uTime * 2.6, y * 0.075) + uSeed * 3.0);

    float back = smoothstep(1.05, 0.55, d * 0.85 + (roll - 0.5) * 0.7) * smoothstep(0.30, 0.65, t);
    back *= ahead * smoothstep(1.2, 0.9, t) * uOn;
    vec3 soot = mix(vec3(0.150, 0.055, 0.030), vec3(0.070, 0.045, 0.040), smoothstep(0.4, 0.9, d + roll * 0.3));
    over(col, alpha, soot, back * 0.42);

    float jet = smoothstep(1.0, 0.15, d + (streak - 0.5) * 0.55) * smoothstep(0.75, 0.25, t) * smoothstep(0.05, 0.2, t) * ahead * uOn;
    float jheat = 1.05 - t * 0.9 - d * 0.35 + (streak - 0.5) * 0.45;
    col += fire(jheat) * jet * 0.45;
    alpha += jet * 0.25;

    float bill = smoothstep(0.95, 0.35, d * 0.9 + (roll - 0.5) * 0.9) * smoothstep(0.35, 0.7, t) * smoothstep(1.15, 0.85, t);
    bill *= ahead * uOn;
    col += fire(0.45 + roll * 0.45 - d * 0.2) * bill * 0.45;

    float lin = smoothstep(1.2, 0.0, uAfter) * step(0.001, uAfter);
    float spot = smoothstep(0.55, 1.0, t) * smoothstep(1.1, 0.85, t) * step(0.0, x);
    float lick = fbm(vec2(x * 0.18, y * 0.10 - uTime * 3.0) + uSeed * 5.0);
    float flames = smoothstep(0.62, 0.80, lick) * smoothstep(0.9, 0.3, d) * spot * lin;
    over(col, alpha, fire(0.55 + lick * 0.4), flames * 0.85);
  }

  vec2 m = min(fragCoord, resolution - fragCoord);
  float border = smoothstep(0.0, 14.0, min(m.x, m.y));
  gl_FragColor = vec4(col, min(alpha, 1.0)) * border;
}
`;
