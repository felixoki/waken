export const getAmbienceFrag = (): string => `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 resolution;

uniform float coolness;
uniform float saturation;
uniform float contrast;
uniform float brightness;

uniform float vignetteRadius;
uniform float vignetteStrength;

uniform float time;
uniform vec3 fogColor;
uniform float fogStrength;
uniform float fogSpeed;
uniform float fogScale;
uniform vec2 cameraScroll;
uniform float cameraZoom;

uniform float eclipseRadius;
uniform float eclipseSoftness;
uniform float eclipseStrength;

varying vec2 outTexCoord;

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
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main(void) {
  vec4 color = texture2D(uMainSampler, outTexCoord);

  // --- Contrast ---
  vec3 graded = mix(vec3(0.5), color.rgb, contrast);

  // --- Saturation ---
  float luma = dot(graded, vec3(0.299, 0.587, 0.114));
  graded = mix(vec3(luma), graded, saturation);

  // --- Cool tint ---
  graded.r -= coolness * 0.02;
  graded.g += coolness * 0.005;
  graded.b += coolness * 0.025;

  // --- Brightness ---
  graded *= brightness;

  // --- Fog wisps ---
  vec2 screen = vec2(outTexCoord.x, 1.0 - outTexCoord.y);
  vec2 world = cameraScroll + (screen * resolution) / cameraZoom;
  vec2 uv = world * fogScale * 0.002;
  float f = fbm(uv + vec2(time * fogSpeed, time * fogSpeed * 0.5));
  f = mix(f, fbm(uv * 1.7 - vec2(0.0, time * fogSpeed * 0.6)), 0.5);
  f = smoothstep(0.3, 0.7, f);
  graded = mix(graded, fogColor, f * fogStrength);

  // --- Vignette ---
  vec2 center = outTexCoord - 0.5;
  float aspect = resolution.x / resolution.y;
  center.x *= aspect;
  float dist = length(center);
  float vignette = smoothstep(vignetteRadius, vignetteRadius + 0.5, dist);
  graded *= 1.0 - vignette * vignetteStrength;

  // --- Eclipse ---
  float eclipse = smoothstep(eclipseRadius, eclipseRadius + eclipseSoftness, dist);
  graded *= 1.0 - eclipse * eclipseStrength;

  gl_FragColor = vec4(graded, color.a);
}
`;
