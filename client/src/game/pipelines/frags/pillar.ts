export const getPillarFrag = (): string => `
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uScale;
uniform float uGround;
uniform float uGrow;
uniform float uFlash;
uniform float uGlint;
uniform float uCrack;
uniform float uShatter;
uniform float uFade;

varying vec2 fragCoord;

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
  for (int i = 0; i < 3; i++) {
    v += amp * noise(p);
    p = p * 2.03 + 17.1;
    amp *= 0.5;
  }
  return v;
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

vec3 pal(float idx) {
  if (idx < 0.5) return vec3(0.045, 0.100, 0.340);
  if (idx < 1.5) return vec3(0.100, 0.240, 0.600);
  if (idx < 2.5) return vec3(0.200, 0.440, 0.840);
  if (idx < 3.5) return vec3(0.400, 0.680, 0.960);
  if (idx < 4.5) return vec3(0.670, 0.880, 1.000);
  return vec3(0.930, 0.985, 1.000);
}

vec3 voronoi(vec2 p, float size) {
  vec2 g = p / size;
  vec2 i = floor(g);
  vec2 f = fract(g);
  float d1 = 8.0;
  float d2 = 8.0;
  float id = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = i + o;
      vec2 pt = o + vec2(hash(c + uSeed), hash(c + uSeed + 7.3)) - f;
      float d = dot(pt, pt);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = hash(c + uSeed * 1.7 + 3.1);
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return vec3(id, (sqrt(d2) - sqrt(d1)) * size, 0.0);
}

float crystal(
  vec2 p,
  vec2 base,
  float tilt,
  float w,
  float h,
  float grow,
  float lean,
  float seed,
  float dither
) {
  if (grow <= 0.0) return -1.0;

  vec2 l = p - base;
  float cs = cos(tilt);
  float sn = sin(tilt);
  l = vec2(l.x * cs - l.y * sn, l.x * sn + l.y * cs);

  float ly = l.y + h * (1.0 - grow);
  float t = ly / h;
  if (l.y < -2.0 || t > 1.0) return -1.0;

  float ts = 0.66;
  float tb = max(t, 0.0);
  float hw = w * (1.0 - 0.14 * min(tb / ts, 1.0));
  float ax = w * 0.30 * lean;
  float k = clamp((t - ts) / (1.0 - ts), 0.0, 1.0);

  float xl = mix(-hw, ax, k);
  float xr = mix(hw, ax, k);
  float el = l.x - xl;
  float er = xr - l.x;
  if (el < 0.0 || er < 0.0) return -1.0;

  float r1 = mix(ax - w * 0.34, ax, k * k);
  float r2 = mix(ax + w * 0.30, ax, k);

  float idx = 4.0;
  if (l.x > r1) idx = 3.0;
  if (l.x > r2) idx = 1.0;
  if (k > 0.0 && l.x <= r1) idx = 5.0;
  if (k > 0.0 && l.x > r1 && l.x <= r2) idx = 4.0;
  if (k > 0.0 && l.x > r2) idx = 2.0;

  float band = t + (dither - 0.5) * 0.16;
  if (band < 0.34) idx -= 1.0;
  if (band < 0.12) idx -= 1.0;

  float cloud = fbm(vec2(l.x * 0.30 + seed, ly * 0.075 - seed));
  if (cloud > 0.62 && idx < 4.5) idx += 1.0;
  if (cloud < 0.30 && idx > 1.5) idx -= 1.0;

  float vein = noise(vec2(l.x * 0.20 + ly * 0.06 + seed * 7.0, ly * 0.10));
  if (abs(vein - 0.5) < 0.016 && k < 0.6) idx = 5.0;

  float gpos = uGlint * (h * 1.9) - h * 0.3;
  float gl = abs(l.x * 0.9 + ly - gpos);
  if (gl < 2.6 && idx > 2.5) idx = 5.0;
  if (gl >= 2.6 && gl < 4.2 && idx > 0.5) idx += 1.0;
  float gl2 = abs(l.x * 0.9 + ly - gpos + 8.0);
  if (gl2 < 1.0 && idx > 2.5) idx = 5.0;

  if (abs(l.x - r1) < 0.6 && hash(vec2(floor(ly * 0.4), seed)) > 0.25) idx = 5.0;
  if (abs(l.x - r2) < 0.55 && k < 0.9) idx = max(idx - 1.0, 1.0);

  if (el < 1.0) idx = 5.0;
  if (er < 1.05) idx = 0.0;
  if (er < 2.1 && er >= 1.05 && idx > 1.5) idx = 2.0;
  if (k > 0.86) idx = 5.0;

  return clamp(idx, 0.0, 5.0);
}

void main(void) {
  vec2 px = floor(fragCoord) + 0.5;
  vec2 p = vec2(px.x - resolution.x * 0.5, px.y - uGround);
  float dither = bayer4(px);

  float s = uScale;
  float side = clamp(uGrow * 1.3 - 0.3, 0.0, 1.2);
  float late = clamp(uGrow * 1.6 - 0.6, 0.0, 1.2);
  float flip = hash(vec2(uSeed, 1.3)) > 0.5 ? 1.0 : -1.0;
  float j1 = hash(vec2(uSeed, 2.1)) - 0.5;
  float j2 = hash(vec2(uSeed, 4.7)) - 0.5;
  float j3 = hash(vec2(uSeed, 9.2)) - 0.5;

  float idx = -1.0;
  float c = 0.0;

  c = crystal(p, vec2(-8.0 * flip, 1.0) * s, -0.30 * flip + j1 * 0.1, 4.6 * s, (52.0 + j2 * 10.0) * s, side, -flip, uSeed + 1.0, dither);
  if (c >= 0.0) idx = max(c - 1.0, 0.0);

  c = crystal(p, vec2(11.0 * flip, 0.5) * s, 0.62 * flip + j2 * 0.12, 5.0 * s, (38.0 + j3 * 8.0) * s, late, flip, uSeed + 2.0, dither);
  if (c >= 0.0) idx = c;

  c = crystal(p, vec2(0.0, 0.0), 0.05 * flip + j3 * 0.06, 9.5 * s, 76.0 * s, uGrow, flip, uSeed, dither);
  if (c >= 0.0) idx = c;

  c = crystal(p, vec2(-12.0 * flip, -0.5) * s, -0.66 * flip + j3 * 0.12, 5.6 * s, (36.0 + j1 * 8.0) * s, side, -flip, uSeed + 3.0, dither);
  if (c >= 0.0) idx = c;

  c = crystal(p, vec2(6.5 * flip, -2.0) * s, 0.34 * flip + j1 * 0.1, 4.0 * s, (24.0 + j2 * 6.0) * s, late, flip, uSeed + 4.0, dither);
  if (c >= 0.0) idx = c;

  if (p.y < 0.0 && idx >= 0.0) {
    float ragged = -1.0 - noise(vec2(p.x * 0.5 + uSeed, 3.0)) * 2.0;
    if (p.y < ragged) idx = -1.0;
  }

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (idx >= 0.0) {
    vec3 cell = voronoi(p + vec2(0.0, uSeed * 13.0), 7.0 * s);
    float order = cell.x * 0.62 + (1.0 - clamp(p.y / (76.0 * s), 0.0, 1.0)) * 0.38;
    float gate = uShatter * 1.2;

    if (order < gate) {
      idx = -1.0;
    } else {
      if (order < gate + 0.08 && uShatter > 0.0) idx = 5.0;
      if (cell.y < 0.75 && uCrack > order * 0.9 + 0.05) idx = 5.0;
      if (cell.y >= 0.75 && cell.y < 1.5 && uCrack > order * 0.9 + 0.05) idx = max(idx - 1.0, 0.0);
    }
  }

  if (idx >= 0.0) {
    col = pal(idx);
    col = mix(col, vec3(1.0), clamp(uFlash, 0.0, 1.0));
    alpha = 1.0;
  }

  float mw = 19.0 * s;
  float mx = p.x / mw;
  if (abs(mx) < 1.0 && uGrow > 0.02) {
    float rise = clamp(uGrow * 3.0, 0.0, 1.0);
    float bump = noise(vec2(p.x * 0.38 + uSeed * 3.0, 1.0));
    float chunk = step(0.55, noise(vec2(p.x * 0.9 + uSeed, 5.0)));
    float top = (2.0 + bump * 4.5 + chunk * 1.5) * (1.0 - mx * mx) * rise * s;
    float bottom = -2.5 - bump * 1.5;

    if (p.y < top && p.y > bottom * (1.0 - mx * mx)) {
      float melt = uFade * 1.15;
      if (hash(floor(p * 0.5) + uSeed) * 0.5 + dither * 0.5 > melt) {
        float m = 4.0;
        if (top - p.y < 1.2) m = 5.0;
        else if (p.y < 0.5) m = 3.0;
        if (p.y < bottom * 0.5) m = 2.0;
        if (chunk > 0.5 && p.y > 1.0 && top - p.y >= 1.2) m = 3.0;
        col = mix(pal(m), vec3(1.0), clamp(uFlash, 0.0, 1.0) * 0.7);
        alpha = 1.0;
      }
    }
  }

  gl_FragColor = vec4(col * alpha, alpha);
}
`;
