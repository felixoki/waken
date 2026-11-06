import { waterline } from "./wade";

export const getSheenVert = (): string => `
#define SHADER_NAME SHEEN_VS

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
varying vec2 outWorld;
varying float outAlpha;

void main() {
  vec2 position = inPosition + vec2(0.0, uDepth * uZoom);
  gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);

  outTexCoord = inTexCoord;
  outWorld = uWorldView + position / uZoom;
  outAlpha = inTint.a;
}
`;

export const getSheenFrag = (): string => `
#define SHADER_NAME SHEEN_FS

precision highp float;

uniform sampler2D uMainSampler;
uniform vec4 uFrame;
uniform vec2 uTexel;
uniform float uTime;
uniform float uWet;
uniform float uRise;
uniform float uSeed;
uniform float uGamma;
uniform float uSaturate;
uniform float uStrength;
uniform float uScale;
uniform float uSpeed;
uniform float uSteps;
uniform float uFade;
uniform float uFloor;
uniform float uRelief;
uniform float uCrest;
uniform float uFlash;
uniform vec3 uSky;
uniform float uClip;
uniform vec2 uCenter;
uniform vec2 uRadius;
uniform float uBand;
uniform float uBandAlpha;

varying vec2 outTexCoord;
varying vec2 outWorld;
varying float outAlpha;
${waterline}
const vec3 LUMA = vec3(0.299, 0.587, 0.114);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

vec4 sampleAt(vec2 uv) {
  if (uv.x < uFrame.x || uv.y < uFrame.y || uv.x > uFrame.z || uv.y > uFrame.w)
    return vec4(0.0);

  return texture2D(uMainSampler, uv);
}

float lumaAt(vec2 uv, float fallback) {
  vec4 c = sampleAt(uv);
  return c.a > 0.5 ? dot(c.rgb, LUMA) : fallback;
}

void main(void) {
  vec2 pixel = floor((outTexCoord - uFrame.xy) / uTexel);
  vec2 uv = uFrame.xy + (pixel + 0.5) * uTexel;
  vec4 texture = sampleAt(uv);

  if (texture.a <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float localV = clamp((uv.y - uFrame.y) / (uFrame.w - uFrame.y), 0.0, 1.0);

  float line = uWet * (1.0 + uFade * 2.0) - uFade;
  float rise = 1.0 - uRise * (1.0 + uFade * 2.0) + uFade;
  float k = max(
    (1.0 - smoothstep(line - uFade, line + uFade, localV)) * uWet,
    smoothstep(rise - uFade, rise + uFade, localV) * min(1.0, uRise * 3.0)
  );

  if (k <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float luma = dot(texture.rgb, LUMA);
  vec2 dx = vec2(uTexel.x, 0.0);
  vec2 dy = vec2(0.0, uTexel.y);

  float around = max(
    max(lumaAt(uv - dx, luma), lumaAt(uv + dx, luma)),
    max(lumaAt(uv - dy, luma), lumaAt(uv + dy, luma))
  );
  float relief = smoothstep(0.0, uRelief, luma - around);
  float crest = (1.0 - step(0.5, sampleAt(uv - dy).a)) * uCrest;
  float edge = max(relief, crest);
  float catchLight = max(edge, uFloor);

  vec3 wetCol = pow(texture.rgb, vec3(uGamma));
  wetCol = clamp(mix(vec3(dot(wetCol, LUMA)), wetCol, uSaturate), 0.0, 1.0);

  float band = fbm(vec2(
    pixel.x * 0.18 + uSeed * 37.0,
    localV * uScale - uTime * uSpeed
  ));
  float glint = smoothstep(0.50, 0.66, band);
  glint = floor(glint * uSteps + 0.5) / uSteps;
  glint = min(glint * catchLight + uFlash * edge * 0.7, 1.0);

  wetCol += glint * uSky * uStrength * (1.0 - 0.5 * luma) * smoothstep(0.02, 0.2, luma);

  float alpha = k * smoothstep(0.5, 1.0, texture.a) * outAlpha;

  if (uClip > 0.0) {
    float under = waterline(outWorld);
    if (under > uBand) alpha = 0.0;
    else if (under > 0.0) alpha *= uBandAlpha;
  }

  gl_FragColor = vec4(wetCol * alpha, alpha);
}
`;
