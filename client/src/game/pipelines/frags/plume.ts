import { NOISE } from "./common";

export const getPlumeFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uLength;
uniform float uFall;
uniform float uNow;
uniform float uLife;
uniform float uSize;

varying vec2 fragCoord;
${NOISE}
const float MARGIN = 30.0;

void main(void) {
  float u = fragCoord.x - MARGIN;
  float y = fragCoord.y - resolution.y * 0.5;
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  float along = clamp(u / uLength, 0.0, 1.0);
  float passed = uFall * sqrt(along);
  float age = uNow - passed;
  float a = age / uLife;

  if (u > -MARGIN * 0.5 && u < uLength + MARGIN * 0.5 && age > 0.0 && a < 1.0) {
    float start = smoothstep(0.0, 0.25, along);
    float lean = (noise(vec2(u * 0.012, uSeed)) - 0.5) * 2.0;
    float drift = lean * age * 12.0 + (noise(vec2(u * 0.03 + uSeed, age * 0.8)) - 0.5) * age * 20.0;
    float width = uSize * (0.30 + 0.25 * start) + sqrt(age) * 15.0;

    vec2 wq = vec2(u * 0.055, (y - drift) / max(width, 1.0) * 1.6);
    float roll = fbm(wq + vec2(-age * 0.8, age * 0.9 * sign(y - drift)) + uSeed);
    float fine = fbm(wq * 2.3 + vec2(age * 1.4, -age * 1.1) + uSeed * 3.0);
    float d = abs(y - drift) / max(width, 1.0);
    float body = smoothstep(1.0, 0.25, d + (roll - 0.5) * 0.9 + (fine - 0.5) * 0.35);

    float erode = smoothstep(a * 1.05 - 0.10, a * 1.05 + 0.08, roll * 0.7 + fine * 0.4 + (1.0 - d) * 0.15);
    float density = body * erode * (0.62 - 0.32 * a) * start * smoothstep(0.0, 0.05, age) * smoothstep(uLength, uLength - 28.0, u);

    float young = smoothstep(0.20, 0.0, age);
    vec3 smoke = mix(vec3(0.110, 0.100, 0.095), vec3(0.330, 0.305, 0.285), roll * 0.7 + fine * 0.3);
    smoke = mix(smoke, vec3(0.380, 0.200, 0.110), young * 0.55 * (1.0 - d));

    col = smoke * density;
    alpha = density;
  }

  vec2 m = min(fragCoord, resolution - fragCoord);
  float border = smoothstep(0.0, 12.0, min(m.x, m.y));
  gl_FragColor = vec4(col, alpha) * border;
}
`;
