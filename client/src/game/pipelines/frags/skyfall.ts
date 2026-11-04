import { NOISE } from "./common";

export const getSkyfallFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uBlend;
uniform float uSpeed;
uniform float uContract;
uniform float uSpread;
uniform float uCohesive;
uniform float uEnd;
uniform float uShimmer;
uniform float uGlints;

varying vec2 fragCoord;
${NOISE}
const vec3 SHADOW = vec3(0.235, 0.471, 0.588);
const vec3 MID = vec3(0.267, 0.569, 0.671);
const vec3 BODY = vec3(0.290, 0.639, 0.725);
const vec3 HIGH = vec3(0.325, 0.749, 0.812);
const vec3 GLINT = vec3(0.341, 0.875, 0.906);

float along(float v) {
  return (sqrt(v + 10.0) * 0.625 - uTime * uSpeed) * 4.0;
}

bool solid(float x, float v, float side) {
  float a = along(v);
  float d = v / resolution.y;
  float breakup = noise(vec2(x * 5.3 + uSeed + 11.0, a * 0.4 + 2.0)) * 0.75
    + noise(vec2(x * 0.35 + uSeed, a * 0.3)) * 0.25;
  float cover = 1.0 - smoothstep(uCohesive, uEnd, d + (noise(vec2(x * 0.3 + uSeed, uTime * 0.2)) - 0.5) * 0.12);
  cover *= smoothstep(-1.0, 3.0 + 10.0 * d, side);
  return breakup > 1.0 - cover * 1.15;
}

void main(void) {
  vec2 p = floor(fragCoord);
  float x = p.x;
  float v = resolution.y - 1.0 - p.y;
  float d = v / resolution.y;
  float a = along(v);

  float sway = smoothstep(4.0, 30.0, v) * 1.2;
  float inset = uContract * smoothstep(0.0, 28.0, v) - uSpread * smoothstep(40.0, resolution.y, v);
  float left = inset + (noise(vec2(v * 0.04 - uTime * 0.6, uSeed)) - 0.5) * 2.0 * sway;
  float right = inset + (noise(vec2(v * 0.04 - uTime * 0.6, uSeed + 9.0)) - 0.5) * 2.0 * sway;
  float side = min(x - left, resolution.x - 1.0 - x - right);

  bool inside = side >= 0.0;
  bool body = inside && solid(x, v, side);
  bool tip = body && !solid(x, v + 1.0, side) && d > uCohesive * 0.8;
  bool drop = inside && !body && d > 0.35
    && hash(vec2(x + uSeed, floor(a * 1.6))) > 0.93 && fract(a * 1.6) < 0.45;

  float strand = noise(vec2(floor(x / 2.0) * 7.1 + uSeed, a * 0.45));
  bool hidden = v < uBlend
    && strand * 0.8 + hash(vec2(x + 3.0, v)) * 0.2 < 1.0 - smoothstep(0.0, uBlend, v);

  if (hidden || (!body && !drop)) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float fine = noise(vec2(x * 7.3 + uSeed + 3.0, a * 1.2 + 4.0));
  float tone = strand * 0.88 + fine * 0.12;
  float far = d + (noise(vec2(x * 0.4 + uSeed + 5.0, a * 0.3)) - 0.5) * 0.15;

  float level = tone > 0.5 ? 2.0 : 1.0;
  if (tone > 0.72 && d < 0.5) level = 3.0;
  if (tone < 0.2) level = 0.0;
  if (far > 0.5) level = tone > 0.5 ? 1.0 : 0.0;
  if (far > 0.78) level = 0.0;

  float shimmer = noise(vec2(x * 0.18 + uTime * 0.7 + uSeed, a * 0.25 - uTime * 0.3));
  if (shimmer > uShimmer && far < 0.7) level = min(level + 1.0, 3.0);

  if (body && side < 1.0) level = 0.0;
  if (tip) level = far > 0.55 ? 1.0 : 3.0;
  if (drop) level = far > 0.7 ? 0.0 : 1.0;
  if (v < uBlend * 1.4 && tone > 0.62) level = 3.0;

  vec3 color = level < 0.5 ? SHADOW : level < 1.5 ? MID : level < 2.5 ? BODY : HIGH;

  float glint = hash(vec2(x + uSeed, floor(a * 2.5)));
  float twinkle = noise(vec2(x * 3.7 + uSeed, uTime * 5.0));
  if (body && side >= 1.0 && far < 0.65 && glint > uGlints && twinkle > 0.55) color = GLINT;

  float fade = far + (hash(vec2(x, floor(v / 2.0))) - 0.5) * 0.04;
  float alpha = fade < 0.6 ? 1.0 : fade < 0.7 ? 0.71 : fade < 0.8 ? 0.47 : fade < 0.92 ? 0.27 : 0.15;
  gl_FragColor = vec4(color * alpha, alpha);
}
`;
