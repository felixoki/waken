export const getVortexFrag = (): string => `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 resolution;
uniform float uTime;
uniform float uProgress;
uniform vec2 uCenter;
uniform float uRadius;

varying vec2 outTexCoord;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
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
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main(void) {
  vec4 scene = texture2D(uMainSampler, outTexCoord);

  /** Position relative to the centre, aspect-corrected and normalised so r = 1
   * sits at the rim. Squeeze x so the storm reads as a tall column. */
  vec2 p = outTexCoord - uCenter;
  p.x *= resolution.x / resolution.y;
  p /= uRadius;
  p.x *= 1.05;

  float r = length(p);

  /** Cheap early-out for the vast majority of the screen. */
  if (r > 1.15 || uProgress <= 0.001) {
    gl_FragColor = scene;
    return;
  }

  float ang = atan(p.y, p.x);

  /** Differential swirl: tighter rotation toward the core, spinning in time. */
  float swirl = uProgress * (2.6 / (r + 0.22)) - uTime * 2.0;
  float angS = ang + swirl;

  /** Sample the storm on a circle so the noise wraps seamlessly around 2*PI
   * (sampling on raw ang leaves an atan2 branch-cut seam on the left). The
   * ring radius grows with r to add variation along the column. */
  vec2 dir = vec2(cos(angS), sin(angS));
  vec2 sp = dir * (1.6 + r * 2.4) + vec2(uTime * 0.3, -uTime * 1.6);
  float warp = fbm(sp + uTime * 0.4);
  float storm = fbm(sp + warp);

  /** Radial profile: dense bright core fading to nothing at the rim. */
  float core = smoothstep(1.0, 0.05, r);
  float body = core * (0.35 + 0.85 * storm);

  /** White-hot fusion flash at the core, strongest at peak progress. */
  float hot = pow(core, 5.0) * pow(uProgress, 2.0);

  /** Colour ramp: indigo -> violet -> electric blue -> cyan -> white. */
  vec3 col = mix(vec3(0.16, 0.08, 0.42), vec3(0.42, 0.18, 0.85), storm);
  col = mix(col, vec3(0.18, 0.55, 1.0), smoothstep(0.25, 0.75, core));
  col = mix(col, vec3(0.65, 0.95, 1.0), smoothstep(0.7, 1.0, core) * 0.7);
  col += hot * vec3(1.0, 0.96, 0.92) * 1.2;

  /** Storm body gated by the envelope, with a soft outer edge. */
  float a = clamp(body * uProgress, 0.0, 1.0);
  a *= smoothstep(1.15, 0.5, r);

  /** Add the storm over the scene (additive glow), dimmed overall. */
  gl_FragColor = scene + vec4(col * a * 0.6, 0.0);
}
`;
