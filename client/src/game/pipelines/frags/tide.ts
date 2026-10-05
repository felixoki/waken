export const getTideFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uGround;
uniform float uRadius;
uniform float uErode;

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
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = p * 2.03 + 17.1;
    amp *= 0.5;
  }
  return v;
}

const float ELEVATION = 0.62;
const float OBLATE = 0.60;
const vec3 HAZE = vec3(0.420, 0.600, 0.780);
const vec3 AQUA = vec3(0.620, 0.800, 0.920);
const vec3 PALE = vec3(0.860, 0.940, 0.980);
const vec3 FOAM = vec3(1.000, 0.990, 0.960);
const vec3 LIGHT = vec3(-0.420, 0.780, 0.460);

vec4 ribbon(vec3 q, float shell, float px) {
  float ta = 0.45 * sin(shell * 2.1 + uSeed);
  float tb = 0.45 * cos(shell * 1.7 + uSeed * 2.0);
  q.yz = vec2(q.y * cos(ta) - q.z * sin(ta), q.y * sin(ta) + q.z * cos(ta));
  q.xy = vec2(q.x * cos(tb) - q.y * sin(tb), q.x * sin(tb) + q.y * cos(tb));

  float lon = atan(q.z, q.x) - uTime * (3.0 + shell * 0.8);
  float lat = asin(clamp(q.y, -1.0, 1.0));

  float v = lat / 1.2 * 1.9 + lon / 6.2831853 + shell * 0.37;
  float id = floor(v);
  float u = (fract(v) - 0.5) * 2.0;

  float seg = fract(lon / 6.2831853 * 2.0 + hash(vec2(id, shell + uSeed)));
  float taper = pow(sin(seg * 3.14159), 0.55);
  float hw = (0.74 + 0.22 * hash(vec2(id + 3.0, shell + uSeed))) * taper * (1.0 - uErode * 0.8);
  float pole = smoothstep(1.30, 0.95, abs(lat));
  float uu = u / max(hw, 0.001);

  float body = smoothstep(hw, hw - px * 1.3, abs(u)) * pole;
  float churn = fbm(vec2(seg * 7.0 - uTime * 2.0 + id * 3.0, uu * 2.0 + shell));
  float crisp = max(px * 1.6 / max(hw, 0.05), 0.03);
  float foam = smoothstep(0.22, 0.22 + crisp, uu + (churn - 0.5) * 1.5) * smoothstep(0.05, 0.35, seg);
  float spray = smoothstep(0.60, 0.60 + crisp, churn) * smoothstep(1.5, 1.0, uu) * step(1.0, uu) * taper * pole;

  float across = 1.0 - clamp(abs(uu), 0.0, 1.0);
  float beam = 0.12 + 0.88 * pow(across, 1.4);
  float shimmer = 0.70 + 0.30 * churn;

  vec3 c = mix(HAZE, AQUA, across);
  c = mix(c, PALE, pow(across, 2.0));
  c = mix(c, FOAM, foam * 0.8);

  return vec4(c, max(body * beam * shimmer * 0.20 + foam * body * 0.12, spray * 0.16));
}

vec4 shellHit(vec3 o, vec3 d, float shell, float side) {
  float r = uRadius * (0.52 + 0.24 * shell);
  vec3 radii = vec3(r, r * OBLATE, r);
  vec3 centre = vec3(0.0, uRadius * 0.40, 0.0);
  vec3 oo = (o - centre) / radii;
  vec3 dd = d / radii;

  float a = dot(dd, dd);
  float b = dot(oo, dd);
  float c = dot(oo, oo) - 1.0;
  float disc = b * b - a * c;
  if (disc <= 0.0) return vec4(0.0);

  float t = (-b + side * sqrt(disc)) / a;
  vec3 q = oo + dd * t;
  vec3 world = o + d * t;
  if (world.y < 0.0) return vec4(0.0);

  vec4 col = ribbon(q, shell, 3.17 / max(r, 1.0));
  vec3 n = normalize(q / radii) * -side;
  float lit = 0.80 + 0.36 * max(dot(n, LIGHT), 0.0);
  float spec = pow(max(dot(reflect(-LIGHT, n), -d), 0.0), 26.0);
  float rim = pow(1.0 - abs(dot(n, -d)), 2.0);

  col.rgb = col.rgb * lit + FOAM * spec * 0.30 * col.a;

  if (side > 0.0) col.a *= 0.45;

  return col;
}

void main(void) {
  vec2 p = vec2(fragCoord.x - resolution.x * 0.5, fragCoord.y - uGround);
  float ce = cos(ELEVATION);
  float se = sin(ELEVATION);
  vec3 d = vec3(0.0, -se, -ce);
  vec3 o = vec3(p.x, p.y * ce, -p.y * se) - d * 1000.0;
  float life = 1.0 - smoothstep(0.70, 1.0, uErode);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec2 g = vec2(p.x, p.y / se);
  float gn = length(g) / max(uRadius, 1.0);
  col += HAZE * exp(-gn * gn * 1.4) * 0.05 * life;
  col += PALE * smoothstep(0.030, 0.0, abs(gn - 1.08)) * 0.10 * life;

  for (int k = 0; k < 3; k++) {
    vec4 c = shellHit(o, d, 2.0 - float(k), 1.0);
    col += c.rgb * c.a * life;
  }

  float core = length(vec2(p.x, p.y - uRadius * 0.40 * ce));
  float size = uRadius * 0.11 + 2.0;
  col += FOAM * exp(-core / size) * life * 0.22;
  col += HAZE * exp(-core / (size * 3.4)) * life * 0.08;

  for (int k = 0; k < 3; k++) {
    vec4 c = shellHit(o, d, float(k), -1.0);
    col += c.rgb * c.a * life;
  }

  gl_FragColor = vec4(col, alpha);
}
`;
