import { NOISE } from "./common";

export const getGlowFrag = (): string => `
#define SHADER_NAME GLOW_FS

precision highp float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform vec2 uOrigin;
uniform vec2 uSize;
uniform float uDrift;
uniform float uScale;
uniform float uSpeed;
uniform float uBreath;
uniform float uPeriod;

varying vec2 outTexCoord;
varying float outTintEffect;
varying vec4 outTint;

${NOISE}

void main() {
  vec4 texel = texture2D(uMainSampler, outTexCoord);
  vec2 p = (uOrigin + outTexCoord * uSize) * uScale;
  float t = uTime * uSpeed;
  float n = 0.6 * noise(p + vec2(0.0, t)) + 0.4 * noise(p * 1.9 + vec2(t * 0.35, t * 1.4));
  float breath = 1.0 + uBreath * sin(uTime * 6.2831853 / uPeriod);
  gl_FragColor = texel * outTint.a * breath * (1.0 + uDrift * (n * 2.0 - 1.0));
}
`;
