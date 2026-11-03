import { NOISE } from "./common";

export const getMistFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uFoot;
uniform float uWidth;
uniform float uAlpha;

varying vec2 fragCoord;
${NOISE}
const vec3 MIST = vec3(0.902, 0.957, 0.965);

void main(void) {
  vec2 d = fragCoord - vec2(resolution.x * 0.5, uFoot);
  float reach = d.y > 0.0 ? resolution.y - uFoot : uFoot;
  float spread = uWidth * 0.5 + max(0.0, d.y) * 0.3;
  float across = 1.0 - smoothstep(spread - 6.0, spread + 8.0, abs(d.x));
  float along = exp(-pow(d.y / (reach * 0.45), 2.0));

  vec2 q = vec2(fragCoord.x * 0.07 + uSeed, fragCoord.y * 0.09 - uTime * 0.45);
  q.x += (noise(vec2(fragCoord.y * 0.05 - uTime * 0.3, uSeed)) - 0.5) * 1.5;
  float cloud = smoothstep(0.35, 0.75, fbm(q));

  float alpha = across * along * (0.3 + 0.7 * cloud) * uAlpha;
  gl_FragColor = vec4(MIST * alpha, alpha);
}
`;
