export const getSheenFrag = (): string => `
#define SHADER_NAME SHEEN_FS

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uMainSampler[%count%];

uniform float time;
uniform float darken;
uniform float deepen;
uniform float strength;
uniform float scale;
uniform float speed;
uniform float steps;
uniform float fade;
uniform float facingFloor;
uniform float facingLow;
uniform float facingHigh;
uniform float flash;
uniform vec3 skyColor;

varying vec2 outTexCoord;
varying float outTexId;
varying float outTintEffect;
varying vec4 outTint;

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
  for (int i = 0; i < 3; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main(void) {
  vec4 texture;
  %forloop%

  if (texture.a <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float wet = outTint.a;
  float v0 = outTint.b;
  float span = outTint.g * 0.25;
  float phase = outTint.r;

  float localV = span > 0.0
    ? clamp((outTexCoord.y - v0) / span, 0.0, 1.0)
    : outTexCoord.y;

  float line = wet * (1.0 + fade * 2.0) - fade;
  float cover = 1.0 - smoothstep(line - fade, line + fade, localV);

  float k = cover * wet;

  if (k <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float luma = dot(texture.rgb, vec3(0.299, 0.587, 0.114));

  vec3 wetCol = texture.rgb * darken;
  wetCol = mix(vec3(luma * darken), wetCol, deepen);

  float facing = smoothstep(facingLow, facingHigh, luma);

  float band = fbm(vec2(localV * scale - time * speed, phase * 37.0));
  float glint = smoothstep(0.40, 0.62, band);

  glint = floor(glint * steps + 0.5) / steps;
  glint *= mix(facingFloor, 1.0, facing);
  glint = min(glint + flash * facing * 0.7, 1.0);

  wetCol += glint * skyColor * strength;

  float alpha = k * texture.a;

  gl_FragColor = vec4(wetCol * alpha, alpha);
}
`;
