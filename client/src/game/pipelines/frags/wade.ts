export const getWadeVert = (): string => `
#define SHADER_NAME WADE_VS

precision highp float;

uniform mat4 uProjectionMatrix;
uniform vec2 uWorldView;
uniform float uZoom;
uniform float uDepth;

attribute vec2 inPosition;
attribute vec2 inTexCoord;
attribute float inTexId;
attribute float inTintEffect;
attribute vec4 inTint;

varying vec2 outTexCoord;
varying float outTintEffect;
varying vec4 outTint;
varying vec2 outWorld;

void main() {
  vec2 position = inPosition + vec2(0.0, uDepth * uZoom);
  gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);

  outTexCoord = inTexCoord;
  outTint = inTint;
  outTintEffect = inTintEffect;
  outWorld = uWorldView + position / uZoom;
}
`;

export const waterline = `
float waterline(vec2 world) {
  vec2 pixel = floor(world) + 0.5;
  float dx = (pixel.x - uCenter.x) / uRadius.x;
  float line = uCenter.y + uRadius.y * sqrt(max(0.0, 1.0 - dx * dx));
  return pixel.y - line;
}
`;

export const getWadeFrag = (): string => `
#define SHADER_NAME WADE_FS

precision highp float;

uniform sampler2D uMainSampler;
uniform vec2 uCenter;
uniform vec2 uRadius;
uniform float uBand;
uniform float uBandAlpha;
uniform float uTint;
uniform vec3 uWater;

varying vec2 outTexCoord;
varying float outTintEffect;
varying vec4 outTint;
varying vec2 outWorld;
${waterline}
void main(void) {
  vec4 texture = texture2D(uMainSampler, outTexCoord);
  vec4 texel = vec4(outTint.bgr * outTint.a, outTint.a);
  vec4 color = texture * texel;

  if (outTintEffect == 1.0) color.rgb = mix(texture.rgb, outTint.bgr * outTint.a, texture.a);
  else if (outTintEffect == 2.0) color = texel;

  float under = waterline(outWorld);

  if (under > uBand) {
    gl_FragColor = vec4(0.0);
    return;
  }

  if (under > 0.0) {
    color.rgb = mix(color.rgb, uWater * color.a, uTint);
    color *= uBandAlpha;
  }

  gl_FragColor = color;
}
`;
