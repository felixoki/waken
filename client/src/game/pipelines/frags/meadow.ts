import { MEADOW_CHARACTERS } from "@server/globals";
import { BLADE_HEIGHT, BLADE_WIDTH, BLADE_VARIANTS } from "../../handlers/meadow";

export const getMeadowVert = (): string => `
#define SHADER_NAME MEADOW_VS

precision highp float;

uniform mat4 uProjectionMatrix;
uniform vec2 uWorldView;
uniform float uZoom;

attribute vec2 inPosition;
attribute vec2 inTexCoord;
attribute float inTexId;
attribute float inTintEffect;
attribute vec4 inTint;

varying vec2 outTexCoord;
varying vec2 outWorld;

void main() {
  gl_Position = uProjectionMatrix * vec4(inPosition, 1.0, 1.0);

  outTexCoord = inTexCoord;
  outWorld = uWorldView + inPosition / uZoom;
}
`;

export const getMeadowFrag = (): string => `
#define SHADER_NAME MEADOW_FS
#define CHARACTERS ${MEADOW_CHARACTERS}
#define BLADE_W ${BLADE_WIDTH}.0
#define BLADE_H ${BLADE_HEIGHT}.0
#define VARIANTS ${BLADE_VARIANTS}.0

precision highp float;

uniform sampler2D uMainSampler;
uniform sampler2D uBlades;
uniform sampler2D uMask;

uniform vec2 uMapSize;
uniform float uTile;
uniform float uTime;

uniform vec3 uFill;
uniform float uSpacing;
uniform vec2 uAccents;
uniform vec3 uAccent0;
uniform vec3 uAccent1;
uniform float uFramerate;
uniform vec2 uWind;
uniform float uWindScale;
uniform float uWindSpeed;
uniform float uLean;
uniform float uSway;
uniform float uSwaySpeed;
uniform float uPushRadius;
uniform float uPush;
uniform float uPushSquash;
uniform float uBent;
uniform float uBentShade;
uniform sampler2D uPattern;
uniform float uPatternSize;
uniform vec4 uCharacters[CHARACTERS];
uniform float uCount;

varying vec2 outTexCoord;
varying vec2 outWorld;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
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

vec3 patchAt(vec2 p) {
  return texture2D(uPattern, (mod(floor(p), uPatternSize) + 0.5) / uPatternSize).rgb;
}

bool grass(vec2 p) {
  return texture2D(uMask, (floor(p / uTile) + 0.5) / (uMapSize / uTile)).r > 0.5;
}

void main(void) {
  vec4 tile = texture2D(uMainSampler, outTexCoord);
  vec2 pixel = floor(outWorld);

  if (tile.a < 0.99) {
    gl_FragColor = tile;
    return;
  }

  vec3 color = tile.rgb / tile.a;
  if (distance(color, uFill) >= 0.02) {
    gl_FragColor = tile;
    return;
  }

  float bestY = -1.0e6;
  vec2 bestBase = vec2(0.0);
  float bestPick = 1.0;
  float bestBend = 0.0;
  bool found = false;

  vec2 slot0 = floor(pixel / uSpacing);

  for (int j = 0; j < 3; j++) {
    for (int i = -3; i <= 2; i++) {
      vec2 slot = slot0 + vec2(float(i), float(j));
      float h1 = hash(slot);
      float h2 = hash(slot + 31.7);
      vec2 base = slot * uSpacing + floor(vec2(h1, h2) * uSpacing);
      if (!grass(base)) continue;

      float seed = hash(slot + 7.3);
      float steps = floor((uTime + seed / uFramerate) * uFramerate) / uFramerate;

      vec2 flow = normalize(uWind);
      float w1 = noise(base * uWindScale + steps * uWindSpeed * flow * 0.1);
      float w2 = noise(base * uWindScale * 0.8 + steps * uWindSpeed * flow * 0.089 * 1.047 + 5.0);
      float wind = clamp(w1 * w2 + 0.365, 0.0, 1.0) * 2.0 - 1.0;
      float lean = wind * uLean + sin((steps + seed * 10.0) * uSwaySpeed * 6.2832) * uSway;
      float height = 1.0;

      float pushX = 0.0;
      float pushY = 0.0;
      for (int c = 0; c < CHARACTERS; c++) {
        if (float(c) >= uCount) break;
        vec4 ch = uCharacters[c];
        vec2 away = base - ch.xy;
        float d = length(away) / uPushRadius;
        if (d >= 1.0) continue;
        float strength = pow(1.0 - d, 0.9);
        vec2 dir = d > 0.0 ? normalize(away) : vec2(0.0, 1.0);
        pushX += dir.x * strength;
        pushY += abs(dir.y) * strength;
      }
      float bend = max(abs(pushX), pushY);
      lean += clamp(pushX, -1.0, 1.0) * uPush;
      height -= clamp(pushY, 0.0, 1.0) * uPushSquash;

      vec2 local = pixel - base;
      float rise = -local.y / (BLADE_H - 1.0);
      if (rise < 0.0 || rise > 1.0) continue;

      float fy = BLADE_H - 1.0 - floor(-local.y / height + 0.5);
      if (fy < 0.0) continue;
      float fx = local.x + floor(BLADE_W * 0.5) - floor(lean * rise + 0.5);
      if (fx < 0.0 || fx >= BLADE_W) continue;

      float pick = hash(slot + 91.1);
      float variant = floor(hash(slot + 3.3) * (VARIANTS - 2.0));
      if (pick < uAccents.x) variant = VARIANTS - 2.0;
      else if (pick < uAccents.x + uAccents.y) variant = VARIANTS - 1.0;

      vec2 uv = vec2((variant * BLADE_W + fx + 0.5) / (VARIANTS * BLADE_W), (fy + 0.5) / BLADE_H);
      if (texture2D(uBlades, uv).a < 0.5) continue;

      if (base.y > bestY) {
        bestY = base.y;
        bestBase = base;
        bestPick = pick;
        bestBend = bend;
        found = true;
      }
    }
  }

  if (found) {
    vec3 blade = bestPick < uAccents.x
      ? uAccent0
      : bestPick < uAccents.x + uAccents.y ? uAccent1
      : patchAt(bestBase) * (bestBend > uBent ? uBentShade : 1.0);
    gl_FragColor = vec4(blade, 1.0);
    return;
  }

  gl_FragColor = vec4(patchAt(pixel), 1.0);
}
`;
