import { waterline } from "./wade";

export const getStatusVert = (): string => `
#define SHADER_NAME STATUS_VS

precision highp float;

uniform mat4 uProjectionMatrix;
uniform vec2 uWorldView;
uniform float uZoom;
uniform float uDepth;
uniform vec4 uFrame;
uniform vec2 uTexel;
uniform vec2 uScale;
uniform float uPad;

attribute vec2 inPosition;
attribute vec2 inTexCoord;
attribute float inTexId;
attribute float inTintEffect;
attribute vec4 inTint;

varying vec2 outTexCoord;
varying vec2 outWorld;
varying float outAlpha;

void main() {
  vec2 dir = sign(inTexCoord - (uFrame.xy + uFrame.zw) * 0.5);
  vec2 position = inPosition + dir * uPad * uScale + vec2(0.0, uDepth * uZoom);

  gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);

  outTexCoord = inTexCoord + dir * uPad * uTexel;
  outWorld = uWorldView + position / uZoom;
  outAlpha = inTint.a;
}
`;

export const getStatusFrag = (): string => `
#define SHADER_NAME STATUS_FS

precision highp float;

uniform sampler2D uMainSampler;
uniform vec4 uFrame;
uniform vec2 uTexel;
uniform vec2 uSize;
uniform float uTime;
uniform float uSeed;
uniform vec4 uA;
uniform vec4 uB;
uniform float uWarm;
uniform vec3 uTrail;
uniform float uClip;
uniform vec2 uCenter;
uniform vec2 uRadius;
uniform float uBand;
uniform float uBandAlpha;

varying vec2 outTexCoord;
varying vec2 outWorld;
varying float outAlpha;
${waterline}
const vec3 LUMA = vec3(0.299, 0.587, 0.114);

vec4 S(vec2 p) {
  if (p.x < 0.0 || p.y < 0.0 || p.x >= uSize.x || p.y >= uSize.y)
    return vec4(0.0);

  return texture2D(uMainSampler, uFrame.xy + (p + 0.5) * uTexel);
}

float A(vec2 p) {
  return step(0.6, S(p).a);
}

float h(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hx(float x, float salt) {
  return h(vec2(x, salt + uSeed * 13.0));
}

float edge(vec2 p) {
  return 1.0 - A(p + vec2(1.0, 0.0)) * A(p - vec2(1.0, 0.0)) *
    A(p + vec2(0.0, 1.0)) * A(p - vec2(0.0, 1.0));
}

float top(vec2 p) {
  return 1.0 - A(p - vec2(0.0, 1.0));
}

float halo(vec2 p) {
  float m = 0.0;
  for (int x = -2; x <= 2; x++)
    for (int y = -2; y <= 2; y++) {
      vec2 d = vec2(float(x), float(y));
      m = max(m, A(p + d) * (1.0 - length(d) / 3.0));
    }
  return m;
}

float close(vec2 p) {
  return max(
    max(max(A(p + vec2(4.0, 0.0)), A(p - vec2(4.0, 0.0))),
        max(A(p + vec2(0.0, 4.0)), A(p - vec2(0.0, 4.0)))),
    max(max(A(p + vec2(3.0, 3.0)), A(p - vec2(3.0, 3.0))),
        max(A(p + vec2(3.0, -3.0)), A(p - vec2(3.0, -3.0))))
  );
}

float around(vec2 p, float l) {
  float s = 0.0;
  float n = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 d = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0);
    vec4 c = S(p + d);
    if (c.a > 0.6) {
      s += dot(c.rgb, LUMA);
      n += 1.0;
    }
  }
  return n > 0.0 ? s / n : l;
}

float overhang(vec2 p) {
  for (int j = 1; j <= 8; j++)
    if (A(p + vec2(0.0, float(j))) > 0.0) return 1.0;
  return 0.0;
}

float drop(vec2 p, float density, float salt, out float k) {
  k = 0.0;
  if (hx(p.x, salt) > density) return 0.0;

  for (int i = 1; i <= 10; i++) {
    float fi = float(i);
    vec2 q = p - vec2(0.0, fi);
    if (A(q) > 0.0) {
      k = fi;
      return overhang(q + vec2(0.0, 1.0));
    }
  }
  return 0.0;
}

float rising(vec2 p, float density, float salt, float speed, float span) {
  if (hx(p.x, salt) >= density || close(p) <= 0.0) return 0.0;
  float y = span - mod(uTime * speed + hx(p.x, salt + 1.0) * 40.0, span);
  return 1.0 - step(0.5, abs(p.y - floor(y)));
}

vec4 over(vec4 under, vec4 above) {
  float a = above.a + under.a * (1.0 - above.a);
  if (a <= 0.0) return vec4(0.0);
  vec3 rgb = (above.rgb * above.a + under.rgb * under.a * (1.0 - above.a)) / a;
  return vec4(rgb, a);
}

void main(void) {
  vec2 p = floor((outTexCoord - uFrame.xy) / uTexel);
  vec4 base = S(p);
  float t = uTime;
  vec4 color = vec4(0.0);

  if (A(p) > 0.0) {
    vec3 c = base.rgb;
    float l = dot(c, LUMA);

    if (uA.x > 0.0) {
      vec3 m = mix(c, vec3(l) * vec3(0.82, 0.95, 1.15) + vec3(0.02, 0.04, 0.08), 0.18);
      m = mix(m, vec3(0.88, 0.95, 1.0), max(top(p) * 0.45, edge(p) * 0.1));
      c = mix(c, m, uA.x);
    }

    if (uA.y > 0.0) {
      vec3 sick = vec3(l) * vec3(0.8, 1.08, 0.5) + vec3(0.03, 0.08, 0.0);
      vec3 m = mix(c, sick, 0.25 + 0.1 * sin(t * 3.0));
      if (h(floor(p / 2.0) + uSeed) > 0.86) m = mix(m, vec3(0.3, 0.5, 0.12), 0.2);
      c = mix(c, m, uA.y);
    }

    if (uA.z > 0.0) {
      vec3 m = mix(c * 1.04, vec3(1.0, 0.93, 0.62), edge(p) * 0.35);
      c = mix(c, m, uA.z);
    }

    if (uA.w > 0.0) {
      float pulse = 0.5 + 0.5 * sin(t * 2.2);
      vec3 m = mix(c, vec3(0.6, 1.0, 0.6), edge(p) * (0.12 + 0.18 * pulse));
      m += vec3(0.03, 0.08, 0.03) * pulse;
      c = mix(c, m, uA.w);
    }

    if (uB.x > 0.0) {
      vec2 back = floor(-uTrail.xy + 0.5);
      vec3 m = mix(c, vec3(1.0, 0.8, 0.4), (1.0 - A(p + back)) * 0.3);
      c = mix(c, m, uB.x * uTrail.z);
    }

    if (uB.y > 0.0) {
      float e = edge(p);
      vec3 m = mix(c, vec3(0.82, 0.92, 1.0), e * 0.2);
      float twinkle = step(0.985, h(p + floor(t * 3.0) * 7.31 + uSeed)) * e;
      m = mix(m, vec3(1.0), twinkle * 0.85);
      c = mix(c, m, uB.y);
    }

    if (uB.z > 0.0) {
      vec3 m = c * 0.87;
      float hue = fract(p.y * 0.08 + p.x * 0.04 + t * 0.2);
      vec3 slick = 0.5 + 0.5 * cos(6.283 * (hue + vec3(0.0, 0.33, 0.67)));
      float hi = max(top(p), smoothstep(0.0, 0.05, l - around(p, l)));
      m += slick * 0.09 * hi + vec3(0.04) * hi;
      c = mix(c, m, uB.z);
    }

    if (uB.w > 0.0) {
      float f = 0.75 + 0.25 * sin(t * 13.0 + p.x * 0.7) * sin(t * 7.0 + p.y);
      vec3 m = mix(c, c * vec3(1.15, 0.9, 0.78), 0.15);
      float crack = smoothstep(-0.03, -0.14, l - around(p, l));
      m = mix(m, vec3(1.0, 0.42, 0.08), crack * f * 0.45);
      m = mix(m, vec3(1.0, 0.88, 0.55), top(p) * 0.2 * f);
      c = mix(c, m, uB.w);
    }

    if (uWarm > 0.0) {
      vec3 m = c * vec3(1.03, 1.0, 0.96);
      m = mix(m, vec3(1.0, 0.72, 0.38), edge(p) * 0.2);
      c = mix(c, m, uWarm);
    }

    color = vec4(c, base.a);
  } else {
    float k;

    if (uA.x > 0.0 && drop(p, 0.22, 1.0, k) > 0.0) {
      float len = 1.0 + floor(hx(p.x, 2.0) * 2.5);
      if (k <= len)
        color = over(color, vec4(
          mix(vec3(0.95, 0.99, 1.0), vec3(0.6, 0.82, 1.0), k / len),
          (0.85 - 0.25 * k / len) * uA.x
        ));
    }

    if (uA.y > 0.0 && drop(p, 0.2, 3.0, k) > 0.0) {
      float y = mod(t * 9.0 + hx(p.x, 4.0) * 20.0, 12.0);
      if (abs(k - 1.0 - y) < 0.5) color = over(color, vec4(0.45, 0.85, 0.2, 0.8 * uA.y));
      else if (k < 1.5) color = over(color, vec4(0.4, 0.75, 0.2, 0.6 * uA.y));
    }

    if (uA.z > 0.0) {
      float n = halo(p);
      color = over(color, vec4(1.0, 0.9, 0.55, n * n * (0.16 + 0.04 * sin(t * 5.0)) * uA.z));
      if (close(p) > 0.0 && h(p + floor(t * 5.0)) > 0.996)
        color = over(color, vec4(1.0, 1.0, 0.85, uA.z));
    }

    if (uA.w > 0.0)
      color = over(color, vec4(0.55, 1.0, 0.55, rising(p, 0.07, 5.0, 14.0, uSize.y) * 0.7 * uA.w));

    if (uB.x > 0.0 && uTrail.z > 0.0) {
      vec2 near = floor(p + uTrail.xy * 3.0 + 0.5);
      vec2 far = floor(p + uTrail.xy * 6.0 + 0.5);
      float g = max(A(near) * 0.26, A(far) * 0.1);
      vec3 tone = mix(S(near).rgb, vec3(1.0, 0.7, 0.3), 0.6);
      color = over(color, vec4(tone, g * uB.x * uTrail.z));
    }

    if (uB.z > 0.0 && drop(p, 0.18, 8.0, k) > 0.0) {
      float y = mod(t * 4.0 + hx(p.x, 9.0) * 10.0, 8.0);
      if (k < 1.5 || abs(k - 1.0 - y) < 0.5)
        color = over(color, vec4(0.12, 0.09, 0.05, 0.75 * uB.z));
    }

    if (uB.w > 0.0)
      color = over(color, vec4(1.0, 0.6, 0.15, rising(p, 0.08, 10.0, 30.0, uSize.y) * 0.9 * uB.w));

    if (uWarm > 0.0)
      color = over(color, vec4(1.0, 0.85, 0.6, rising(p, 0.06, 12.0, 8.0, uSize.y * 0.3) * 0.35 * uWarm));
  }

  if (uClip > 0.0) {
    float under = waterline(outWorld);
    if (under > uBand) color.a = 0.0;
    else if (under > 0.0) color.a *= uBandAlpha;
  }

  color.a *= outAlpha;
  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`;
