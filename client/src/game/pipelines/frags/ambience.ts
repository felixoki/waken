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

uniform float wetness;

uniform float rainStrength;
uniform float rainSpeed;
uniform float rainScale;
uniform float rainDensity;
uniform float rainRush;

uniform vec3 cloudColor;
uniform float cloudStrength;
uniform float cloudScale;
uniform float cloudSpeed;
uniform vec2 cloudDirection;
uniform float cloudCoverage;
uniform float cloudSoftness;

uniform vec3 rayColor;
uniform float rayStrength;
uniform float rayScale;
uniform float rayLength;
uniform float raySpeed;
uniform vec2 rayDirection;
uniform float rayCoverage;
uniform float raySoftness;
uniform float rayCore;
uniform float rayHaze;
uniform float rayGap;
uniform float rayRun;

uniform vec3 flashColor;
uniform float flashStrength;

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

float rain(vec2 uv, float t, float intensity) {
  float acc = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 st = uv * (rainScale * (24.0 + fi * 12.0));
    st.x += fi * 37.0;

    /** Per-column random drives fall speed and phase so columns don't scroll in lockstep. */
    float col = floor(st.x);
    float cr = hash(vec2(col, fi + 1.0));
    float rush = 1.0 - rainRush + intensity * rainRush;
    st.y += t * rainSpeed * (5.0 + cr * 8.0) * rush + cr * 90.0;

    vec2 id = floor(st);
    vec2 f = fract(st);

    /** Per-cell randoms scatter position, length and brightness of each drop. */
    float drop = step(
      1.0 - clamp(rainDensity * intensity, 0.0, 0.6),
      hash(id + fi * 7.0)
    );
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

float cloudNoise(vec2 p) {
  return noise(p) * 0.5 + noise(p * 2.0) * 0.25 + noise(p * 4.0) * 0.125;
}

float clouds(vec2 world) {
  vec2 drift = cloudDirection * time * cloudSpeed;
  vec2 uv = (world - drift) / cloudScale;

  float n = cloudNoise(uv);

  n = mix(n, cloudNoise(uv * 1.7 + vec2(11.3, 7.9) + drift * 0.4 / cloudScale), 0.35);

  float edge = 1.0 - cloudCoverage;
  return smoothstep(edge, edge + cloudSoftness, n);
}

float rays(vec2 world) {
  vec2 across = vec2(-rayDirection.y, rayDirection.x);
  vec2 axis = vec2(dot(world, across), dot(world, rayDirection));
  float sweep = time * raySpeed;

  vec2 uv = vec2(axis.x - sweep, axis.y / rayLength) / rayScale;
  float n = noise(uv) * noise(uv * 1.7 + vec2(9.2, 4.4));

  float edge = 1.0 - rayCoverage;
  float halo = smoothstep(edge, edge + raySoftness, n);
  float core = smoothstep(edge + raySoftness * 0.5, edge + raySoftness * 1.4, n);

  vec2 run = vec2(axis.y / rayRun, (axis.x - sweep) / (rayScale * 2.5));
  float along = noise(run);
  float window = smoothstep(rayGap, rayGap + 0.18, along)
               * (1.0 - smoothstep(rayGap + 0.34, rayGap + 0.55, along));

  return mix(halo, core, rayCore) * window;
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

  // --- Wetness ---
  if (wetness > 0.0) {
    float wl = dot(graded, vec3(0.299, 0.587, 0.114));
    graded = mix(vec3(wl), graded, 1.0 + wetness * 0.14);
    graded *= mix(1.0, 0.94, wetness);
  }

  vec2 screen = vec2(outTexCoord.x, 1.0 - outTexCoord.y);
  vec2 world = cameraScroll + (screen * resolution) / cameraZoom;

  // --- Cloud shadows ---
  float cover = 0.0;

  if (cloudStrength > 0.0) {
    cover = clouds(world);
    graded = mix(graded, graded * cloudColor, cover * cloudStrength);
  }

  // --- Fog wisps ---
  if (fogStrength > 0.0) {
    vec2 uv = world * fogScale * 0.002;
    float f = fbm(uv + vec2(time * fogSpeed, time * fogSpeed * 0.5));
    f = mix(f, fbm(uv * 1.7 - vec2(0.0, time * fogSpeed * 0.6)), 0.5);
    f = smoothstep(0.3, 0.7, f);
    graded = mix(graded, fogColor, f * fogStrength);
  }

  // --- Sun rays ---
  if (rayStrength > 0.0) {
    float lit = rays(world) * rayStrength * (1.0 - cover);

    graded *= 1.0 + lit * rayColor;
    graded = 1.0 - (1.0 - graded) * (1.0 - rayColor * lit * rayHaze);
  }

  // --- Rain (world-anchored so camera movement doesn't alter apparent speed) ---
  if (rainStrength > 0.0) {
    vec2 rainUv = vec2(world.x, -world.y) * 0.003;
    float r = rain(rainUv, time, rainStrength);
    graded += r * min(rainStrength, 1.5) * 0.12;
  }

  // --- Lightning ---
  graded = mix(graded, flashColor, flashStrength);

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
