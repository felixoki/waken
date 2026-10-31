import { BLAZE_REACH } from "@server/globals";
import { waterline } from "./wade";

export const getBlazeVert = (): string => `
#define SHADER_NAME BLAZE_VS

precision highp float;

uniform mat4 uProjectionMatrix;
uniform vec2 uWorldView;
uniform float uZoom;
uniform float uDepth;
uniform vec4 uFrame;
uniform vec2 uTexel;
uniform vec2 uScale;
uniform float uPad;

attribute vec2 inPosition;
attribute vec2 inTexCoord;
attribute float inTexId;
attribute float inTintEffect;
attribute vec4 inTint;

varying vec2 outTexCoord;
varying vec2 outWorld;
varying float outAlpha;

void main() {
  vec2 dir = sign(inTexCoord - (uFrame.xy + uFrame.zw) * 0.5);
  vec2 position = inPosition + dir * uPad * uScale + vec2(0.0, uDepth * uZoom);

  gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);

  outTexCoord = inTexCoord + dir * uPad * uTexel;
  outWorld = uWorldView + position / uZoom;
  outAlpha = inTint.a;
}
`;

export const getBlazeFrag = (): string => `
#define SHADER_NAME BLAZE_FS
#define REACH ${BLAZE_REACH}

precision highp float;

uniform sampler2D uMainSampler;
uniform vec4 uFrame;
uniform vec2 uTexel;
uniform float uTime;
uniform float uHeat;
uniform float uSeed;
uniform float uSpeed;
uniform float uNoiseScale;
uniform float uStretch;
uniform vec4 uThresholds;
uniform float uBody;
uniform float uGlow;
uniform float uSolid;
uniform float uSide;
uniform float uIntensity;
uniform vec3 uEmber;
uniform vec3 uFlame;
uniform vec3 uBright;
uniform vec3 uCore;
uniform float uClip;
uniform vec2 uCenter;
uniform vec2 uRadius;
uniform float uBand;
uniform float uBandAlpha;

varying vec2 outTexCoord;
varying vec2 outWorld;
varying float outAlpha;
${waterline}
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

float alphaAt(vec2 uv) {
  if (uv.x < uFrame.x || uv.y < uFrame.y || uv.x > uFrame.z || uv.y > uFrame.w)
    return 0.0;

  return texture2D(uMainSampler, uv).a;
}

float solid(vec2 uv) {
  return step(uSolid, alphaAt(uv));
}

void main(void) {
  vec2 pixel = floor((outTexCoord - uFrame.xy) / uTexel);
  vec2 uv = uFrame.xy + (pixel + 0.5) * uTexel;
  float own = alphaAt(uv);
  float body = step(uSolid, own);
  float shade = step(0.01, own) * (1.0 - body);
  float height = (pixel.y * uTexel.y) / (uFrame.w - uFrame.y);

  float rise = 0.0;
  for (int k = 1; k <= REACH; k++) {
    float below = float(k);
    float weight = 1.0 - below / float(REACH + 1);
    float centre = solid(uv + vec2(0.0, below) * uTexel);
    float sides = max(
      solid(uv + vec2(-1.0, below) * uTexel),
      solid(uv + vec2(1.0, below) * uTexel)
    );
    rise = max(rise, max(centre, sides * 0.8) * weight);
  }

  vec2 flow = vec2(
    pixel.x * uNoiseScale + uSeed * 17.0,
    (pixel.y + uTime * uSpeed) * uNoiseScale * uStretch
  );
  float n = noise(flow) * 0.65 + noise(flow * 2.3 + 5.1) * 0.35;

  float up = 1.0 - solid(uv + vec2(0.0, -1.0) * uTexel);
  float side = 1.0 - min(
    solid(uv + vec2(-1.0, 0.0) * uTexel),
    solid(uv + vec2(1.0, 0.0) * uTexel)
  );
  float edge = body * max(up, side * uSide);
  float settle = 1.0 - 0.6 * smoothstep(0.6, 1.0, height);

  float f = max(rise * (1.0 - body), edge - uBody)
    * uHeat * n * uIntensity * settle * (1.0 - shade);

  vec4 color = vec4(0.0);

  if (f > uThresholds.w) color = vec4(uCore, 1.0);
  else if (f > uThresholds.z) color = vec4(uBright, 1.0);
  else if (f > uThresholds.y) color = vec4(uFlame, 1.0);
  else if (f > uThresholds.x) color = vec4(uEmber, 0.85);
  else if (body > 0.0) {
    float glow = uGlow * uHeat * smoothstep(0.2, 0.8, height) * (0.6 + 0.4 * n);
    color = vec4(uFlame, glow);
  }

  if (uClip > 0.0) {
    float under = waterline(outWorld);
    if (under > uBand) color.a = 0.0;
    else if (under > 0.0) color.a *= uBandAlpha;
  }

  color.a *= outAlpha;
  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`;
