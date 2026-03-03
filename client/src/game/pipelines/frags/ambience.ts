export const getAmbienceFrag = (): string => `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 resolution;

// Color grading uniforms
uniform float coolness;    // blue/teal shift strength (0.0 - 1.0)
uniform float saturation;  // saturation multiplier (< 1.0 desaturates)
uniform float contrast;    // contrast multiplier (< 1.0 flattens)

// Vignette uniforms
uniform float vignetteRadius;
uniform float vignetteStrength;

varying vec2 outTexCoord;

void main(void) {
  vec4 color = texture2D(uMainSampler, outTexCoord);

  // --- Contrast reduction ---
  // Pull values toward mid-grey to soften bright colors
  vec3 graded = mix(vec3(0.5), color.rgb, contrast);

  // --- Saturation ---
  float luma = dot(graded, vec3(0.299, 0.587, 0.114));
  graded = mix(vec3(luma), graded, saturation);

  // --- Cool tint: slight blue/teal push for rainy atmosphere ---
  graded.r -= coolness * 0.02;
  graded.g += coolness * 0.005;
  graded.b += coolness * 0.025;

  // --- Vignette ---
  vec2 center = outTexCoord - 0.5;
  float aspect = resolution.x / resolution.y;
  center.x *= aspect;
  float dist = length(center);
  float vignette = smoothstep(vignetteRadius, vignetteRadius + 0.5, dist);
  graded *= 1.0 - vignette * vignetteStrength;

  gl_FragColor = vec4(graded, color.a);
}
`;
