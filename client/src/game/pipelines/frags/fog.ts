import { NOISE } from "./common";

export const getFogFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D uBlend;
uniform vec2 uScale;
uniform vec2 uDrift;
uniform vec2 uEdge;
uniform vec3 uColor;
uniform float uAlpha;

varying vec2 fragCoord;
${NOISE}
void main(void) {
  vec2 world = vec2(fragCoord.x, resolution.y - fragCoord.y);
  float blend = texture2D(uBlend, world / resolution).r;
  if (blend <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 q = (world + time * uDrift) * uScale;
  float wisp = smoothstep(uEdge.x, uEdge.y, fbm(q));
  float gaps = smoothstep(0.3, 0.7, fbm(q * 2.3 + vec2(5.2 - time * 0.02, 3.1)));
  float alpha = wisp * gaps * uAlpha * blend;
  gl_FragColor = vec4(uColor * alpha, alpha);
}
`;
