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

uniform float rainStrength;
uniform float rainSpeed;
uniform float rainScale;

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

float rain(vec2 uv, float t) {
  float acc = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 st = uv * (rainScale * (24.0 + fi * 12.0));
    st.x += fi * 37.0;

    /** Per-column random drives fall speed and phase so columns don't scroll in lockstep. */
    float col = floor(st.x);
    float cr = hash(vec2(col, fi + 1.0));
    st.y += t * rainSpeed * (5.0 + cr * 8.0) + cr * 90.0;

    vec2 id = floor(st);
    vec2 f = fract(st);

    /** Per-cell randoms scatter position, length and brightness of each drop. */
    float drop = step(0.9, hash(id + fi * 7.0));
    float xoff = 0.25 + hash(id + 3.3) * 0.5;
    float yoff = hash(id + 9.1);
    float len = 0.4 + hash(id + 5.7) * 0.7;
    float bright = 0.5 + hash(id + 1.9) * 0.5;

    float dx = f.x - xoff;
    float dy = (f.y - yoff) / len;
    float streak = smoothstep(0.5, 0.0, abs(dx) * 9.0)
                 * smoothstep(0.5, 0.0, abs(dy) * 1.3);
    acc += streak * drop * bright;
  }
  return acc;
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

  // --- Rain (world-anchored so camera movement doesn't alter apparent speed) ---
  vec2 rainUv = vec2(world.x, -world.y) * 0.003;
  float r = rain(rainUv, time);
  graded += r * rainStrength * 0.12;

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
