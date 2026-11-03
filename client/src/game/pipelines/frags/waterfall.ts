import { NOISE } from "./common";

export const getWaterfallFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uLip;
uniform float uBase;
uniform float uEdge;

varying vec2 fragCoord;
${NOISE}
const vec3 DEEP = vec3(0.302, 0.392, 0.667);
const vec3 MID = vec3(0.329, 0.447, 0.737);
const vec3 LIGHT = vec3(0.357, 0.518, 0.800);
const vec3 SHALLOW = vec3(0.498, 0.765, 0.812);
const vec3 FOAM = vec3(0.902, 0.957, 0.965);

void main(void) {
  vec2 p = floor(fragCoord) + 0.5;
  float v = resolution.y - p.y;
  float x = p.x;
  float fall = resolution.y - uBase + (noise(vec2(x * 0.3 + uSeed, uTime * 0.8)) - 0.5) * 4.0;

  float spread = smoothstep(fall - 2.0, resolution.y, v) * uEdge;
  float wobble = (noise(vec2(v * 0.22 - uTime * 1.4, uSeed)) - 0.5) * 2.0;
  float inset = uEdge - spread + wobble * 1.4 * smoothstep(0.0, uLip + 4.0, v);
  float side = min(x - inset, resolution.x - inset - x);
  if (side < 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 color;
  float alpha = 1.0;

  if (v < uLip) {
    float t = v / uLip;
    float sheen = noise(vec2(x * 0.9 + uTime * 0.4, uSeed + 4.0));
    color = mix(MID, LIGHT, smoothstep(0.4, 1.0, t));
    color = mix(color, SHALLOW, step(uLip - 1.0, v) * step(0.72, sheen));
    color = mix(color, FOAM, step(uLip - 1.0, v) * step(0.86, sheen));
    alpha = smoothstep(0.0, uLip, v + 0.5) * smoothstep(0.0, 3.0, side);
  } else if (v < fall) {
    float d = (v - uLip) / max(1.0, fall - uLip);
    float fallen = pow(v - uLip, 1.25);
    float coarse = noise(vec2(x * 0.42 + uSeed, (fallen - uTime * 22.0) * 0.045));
    float fine = noise(vec2(x * 0.95 + uSeed + 7.0, (fallen - uTime * 30.0) * 0.09));
    float streak = (coarse * 0.6 + fine * 0.4) * smoothstep(0.0, 5.0, v - uLip) + 0.25 * (1.0 - smoothstep(0.0, 5.0, v - uLip));
    color = mix(LIGHT, DEEP, 0.35 + d * 0.4);
    color = mix(color, MID, step(0.45, streak));
    color = mix(color, LIGHT, step(0.6, streak));
    color = mix(color, FOAM, step(0.74, streak) * (0.35 + 0.65 * d));
    color = mix(color, DEEP, step(side, 1.5) * 0.6);
  } else {
    float b = (v - fall) / uBase;
    float churn = fbm(vec2(x * 0.16 + uSeed, v * 0.22 - uTime * 0.7));
    float bubble = noise(vec2(x * 0.6 - uTime * 0.4, v * 0.6 + uTime * 1.1 + uSeed));
    float foam = step(0.42 + b * 0.32, churn * 0.75 + bubble * 0.25);
    color = mix(LIGHT, SHALLOW, step(0.5, churn));
    color = mix(color, FOAM, foam);
    alpha = mix(1.0, foam, smoothstep(0.25, 1.0, b));
    alpha *= smoothstep(0.0, 3.0, side + (1.0 - b) * 3.0);
  }

  gl_FragColor = vec4(color * alpha, alpha);
}
`;
