import { NOISE } from "./common";

export const getScorchFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uRadius;
uniform float uAppear;
uniform float uFade;

varying vec2 fragCoord;
${NOISE}
const float SQUASH = 0.6;
const float SECTORS = 17.0;
const vec3 SOOT = vec3(0.050, 0.030, 0.025);

vec3 fire(float heat) {
  vec3 c = mix(vec3(0.200, 0.030, 0.025), vec3(0.560, 0.070, 0.035), smoothstep(0.00, 0.35, heat));
  c = mix(c, vec3(0.820, 0.180, 0.050), smoothstep(0.35, 0.65, heat));
  c = mix(c, vec3(0.980, 0.420, 0.110), smoothstep(0.62, 0.88, heat));
  return mix(c, vec3(1.000, 0.720, 0.380), smoothstep(0.86, 1.10, heat));
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

vec3 cracks(vec2 p) {
  vec2 e = vec2(p.x, p.y / SQUASH);
  float rn = length(e) / uRadius;
  float ang = atan(e.y, e.x);
  float turn = (ang + 3.14159265) / 6.2831853;
  vec2 dir = vec2(cos(ang), sin(ang));

  float kink = (noise(dir * 1.4 + rn * 2.0 + uSeed) - 0.5) * 0.14;
  vec2 q = vec2(turn * SECTORS + kink, log(max(rn, 0.05)) * SECTORS / 6.2831853 * 1.3 + uSeed);
  vec3 w = web(q);

  float span = rn * uRadius * (6.2831853 / SECTORS);
  float dist = w.x * span * 0.5;

  float wob = (noise(dir * 2.2 + uSeed * 5.0) - 0.5) * 0.07 + (noise(dir * 9.0 - uSeed) - 0.5) * 0.02;
  float main = abs(rn - 1.0 - wob) * uRadius;
  main += (1.0 - smoothstep(0.30, 0.38, noise(dir * 2.6 + uSeed + 11.0))) * 99.0;

  return vec3(min(dist, main), rn - wob, w.y);
}

void main(void) {
  vec2 p = fragCoord - resolution * 0.5;
  vec2 e = vec2(p.x, p.y / SQUASH);
  float a = atan(e.y, e.x);
  vec2 dir = vec2(cos(a), sin(a));
  float live = 1.0 - clamp(uFade, 0.0, 1.0);
  float near = smoothstep(0.6, -0.9, dir.y);

  vec3 c = cracks(p);
  vec3 under = cracks(p + vec2(0.0, 2.0));
  float d = c.y - 1.0;

  float lit = fbm(dir * 2.2 + uSeed * 2.0);
  float gate = smoothstep(1.0 - uAppear * 1.1, 1.0 - uAppear * 1.1 + 0.20, lit);
  float band = smoothstep(0.24 + 0.08 * noise(dir * 4.0 + uSeed), 0.0, abs(d + 0.02));
  float gaps = smoothstep(0.28, 0.40, noise(e * 0.09 + uSeed * 2.0)) * smoothstep(0.20, 0.30, noise(e * 0.26 - uSeed));
  float keep = smoothstep(0.0, 0.25, band) * gaps * gate;

  float rough = noise(e * 0.20 + uSeed * 3.0);
  float width = 0.55 * (0.65 + 0.70 * c.z) * (0.35 + 1.50 * rough * rough) * mix(0.35, 1.0, band) * mix(1.0, 1.6, smoothstep(0.03, 0.0, abs(d)));
  float line = smoothstep(width, width * 0.25, c.x) * keep;
  float lift = smoothstep(width * 1.3, 0.0, under.x) * keep * 0.30;

  float sootA = smoothstep(0.07, 0.0, abs(d + 0.01)) * gate * smoothstep(0.30, 0.65, fbm(dir * 5.0 + uSeed * 4.0)) * 0.30;
  float dark = max(max(lift * 0.6, line * 0.75), sootA) * live;
  vec3 col = SOOT * dark;
  float alpha = dark;

  float flick = 0.70 + 0.50 * noise(vec2(c.z * 9.0 + c.y * 6.0, uTime * 1.5 + uSeed));
  float heat = 0.30 + flick * 0.30 + smoothstep(0.04, 0.0, abs(d)) * 0.30 + (c.z - 0.5) * 0.15 - (1.0 - band) * 0.15;
  float far = mix(1.0, 0.75, near);
  col += fire(heat) * line * (0.65 + 0.45 * flick) * live * far;
  col += fire(0.45) * exp(-c.x / 2.6) * keep * 0.16 * live * far;

  float tongue = fbm(vec2(dir.x * 14.0 + dir.y * 9.0, d * 7.0 - uTime * 1.4) + uSeed);
  float lick = smoothstep(0.05, 0.0, abs(d + 0.02)) * smoothstep(0.62, 0.86, tongue) * smoothstep(0.55, 0.75, lit) * gate;
  float la = lick * 0.75 * live;
  col = col * (1.0 - la) + fire(0.45 + tongue * 0.45) * la;
  alpha = alpha * (1.0 - la) + la;

  vec2 m = min(fragCoord, resolution - fragCoord);
  float border = smoothstep(0.0, 24.0, min(m.x, m.y));
  gl_FragColor = vec4(col, alpha) * border;
}
`;
