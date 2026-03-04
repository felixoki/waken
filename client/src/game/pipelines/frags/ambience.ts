export const getAmbienceFrag = (): string => `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 resolution;

uniform float coolness;
uniform float saturation;
uniform float contrast;

uniform float vignetteRadius;
uniform float vignetteStrength;

varying vec2 outTexCoord;

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
