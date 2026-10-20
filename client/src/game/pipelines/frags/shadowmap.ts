import { LIGHT_ANGLES, LIGHT_MARCH } from "@server/globals";

export const getShadowmapVert = (): string => `
precision highp float;

attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const getShadowmapFrag = (lights: number): string => `
precision highp float;

const int kMaxLights = ${lights};
const int kMarch = ${LIGHT_MARCH};
const float kAngles = ${LIGHT_ANGLES}.0;
const float kTau = 6.28318530718;

uniform sampler2D uOccluder;
uniform vec2 uWorld;
uniform vec2 uOrigins[kMaxLights];
uniform float uReach[kMaxLights];

void main() {
  int row = int(gl_FragCoord.y);
  vec2 origin = vec2(0.0);
  float reach = 0.0;

  for (int i = 0; i < kMaxLights; i++) {
    if (i == row) {
      origin = uOrigins[i];
      reach = uReach[i];
    }
  }

  float angle = gl_FragCoord.x / kAngles * kTau - 3.14159265359;
  vec2 dir = vec2(cos(angle), sin(angle));
  float hit = reach;

  for (int s = 1; s < kMarch; s++) {
    float t = float(s);
    if (t >= reach) break;

    vec2 p = floor(origin + dir * t) + 0.5;

    if (texture2D(uOccluder, p / uWorld).r > 0.5) {
      hit = t;
      break;
    }
  }

  float v = floor(clamp(hit / max(reach, 1.0), 0.0, 1.0) * 65535.0 + 0.5);
  float high = floor(v / 256.0);

  gl_FragColor = vec4(high / 255.0, (v - high * 256.0) / 255.0, 0.0, 1.0);
}
`;
