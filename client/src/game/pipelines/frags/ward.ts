import { NOISE } from "./common";

export const getWardFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uRadius;
uniform float uAppear;
uniform float uBreak;

varying vec2 fragCoord;

${NOISE}

const vec3 MILK = vec3(0.930, 0.950, 0.980);
const vec3 FROST = vec3(0.780, 0.880, 0.980);
const vec3 BLUSH = vec3(1.000, 0.960, 0.900);
const vec3 LIGHT = vec3(-0.450, 0.600, 0.660);

void main(void) {
  vec2 p = fragCoord - resolution * 0.5;
  float t = uTime + uSeed * 7.0;

  float ang = atan(p.y, p.x);
  vec2 ring = vec2(cos(ang), sin(ang));
  float wobble = noise(ring * 1.6 + vec2(t * 0.35, uSeed)) - 0.5;
  float r = uRadius * (0.55 + 0.45 * uAppear + 0.22 * uBreak) * (1.0 + wobble * 0.08);

  float d = length(p) / max(r, 1.0);
  float px = 1.0 / max(r, 1.0);
  float inside = smoothstep(1.0, 1.0 - px * 1.6, d);
  if (inside <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float dd = min(d, 0.999);
  float z = sqrt(1.0 - dd * dd);
  vec3 n = vec3(p / r, z);

  float fres = pow(1.0 - z, 2.4);
  float rim = smoothstep(0.80, 1.0, d) * (0.65 + 0.35 * noise(ring * 3.0 - vec2(t * 0.6, 0.0)));

  vec2 uv = n.xy / (z + 0.55);
  float flow = fbm(uv * 2.4 + vec2(t * 0.18, -t * 0.11) + uSeed);
  float flow2 = fbm(uv * 3.1 - vec2(t * 0.13, t * 0.16) + uSeed * 3.0);
  float vein = smoothstep(0.075, 0.0, abs(flow - 0.5)) * 0.6 + smoothstep(0.05, 0.0, abs(flow2 - 0.52)) * 0.4;
  vein *= 0.35 + 0.65 * fres;

  float spec = pow(max(dot(reflect(-normalize(LIGHT), n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
  vec2 hp = p / r - vec2(-0.38, 0.42);
  float gleam = exp(-dot(hp, hp) * 26.0);
  vec2 bp = p / r - vec2(0.42, -0.50);
  float bounce = exp(-dot(bp * vec2(1.0, 2.2), bp * vec2(1.0, 2.2)) * 18.0);

  vec2 gp = uv * 5.0 + vec2(t * 0.25, -t * 0.2);
  float glint = smoothstep(0.93, 0.99, noise(gp + uSeed * 9.0)) * (0.5 + 0.5 * sin(t * 4.0 + hash(floor(gp)) * 6.28));

  float hue = noise(uv * 1.7 + vec2(-t * 0.07, t * 0.05) + uSeed * 5.0);
  vec3 tint = mix(FROST, MILK, smoothstep(0.25, 0.65, hue));
  tint = mix(tint, BLUSH, smoothstep(0.62, 0.90, hue) * 0.6);

  float shatter = smoothstep(0.42, 0.62, fbm(uv * 4.0 + uSeed * 11.0) + uBreak * 0.9 - 0.45);
  float keep = 1.0 - shatter * smoothstep(0.0, 0.25, uBreak);
  float life = uAppear * (1.0 - smoothstep(0.35, 1.0, uBreak));
  float pulse = 0.88 + 0.12 * sin(t * 1.7 + flow * 4.0);

  vec3 col = vec3(0.0);
  col += tint * fres * 0.30 * pulse;
  col += MILK * rim * 0.20;
  col += tint * vein * 0.24 * pulse;
  col += vec3(1.0) * (spec * 0.22 + gleam * 0.20);
  col += FROST * bounce * 0.07;
  col += MILK * glint * 0.35 * (0.4 + 0.6 * fres);
  col += MILK * 0.025;
  col += MILK * smoothstep(0.82, 0.98, d) * smoothstep(1.0, 0.98, d) * uBreak * 0.5;

  float alpha = (0.035 + fres * 0.06) * inside;

  float k = inside * keep * life;
  gl_FragColor = vec4(col * k, alpha * k);
}
`;
