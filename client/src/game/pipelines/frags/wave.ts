export const getWaveFrag = (): string => `
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uFacing;
uniform float uSpread;
uniform float uFront;
uniform float uThick;
uniform float uSweep;
uniform float uErode;
uniform float uOrb;
uniform float uOrbRadius;

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

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

const vec3 VOID = vec3(0.010, 0.016, 0.060);
const vec3 DEEP = vec3(0.030, 0.065, 0.210);
const vec3 MID = vec3(0.075, 0.190, 0.520);
const vec3 GLOW = vec3(0.230, 0.520, 0.980);
const vec3 RIM = vec3(0.620, 0.880, 1.000);
const vec3 HOT = vec3(0.930, 0.980, 1.000);

void main(void) {
  vec2 px = floor(fragCoord) + 0.5;
  vec2 p = px - resolution * 0.5;
  p.y = -p.y;

  float dither = bayer4(px);

  float cs = cos(uFacing);
  float sn = sin(uFacing);
  vec2 q = vec2(p.x * cs + p.y * sn, -p.x * sn + p.y * cs);

  float r = length(q);
  float a = atan(q.y, q.x);
  float u = a / uSpread;
  float au = abs(u);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (uFront > 0.5 && au < 1.25 && r < uFront + 14.0) {
    float s = a * max(r, 6.0);
    float taper = pow(max(0.0, cos(min(au, 1.0) * 1.5708)), 0.55);
    float thick = uThick * taper;
    float settle = min(1.0, uFront / 36.0);

    float wob = sin(u * 6.0 - uTime * 13.0 + uSeed) * 3.4;
    wob += sin(u * 13.0 + uTime * 19.0 + uSeed * 2.0) * 1.5;
    wob *= settle;

    float fray = (noise(vec2(s * 0.22 + uSeed, uTime * 6.0)) - 0.5) * 2.5;
    float d = uFront - au * au * uFront * 0.10 + wob + fray - r;
    float v = d / max(thick, 0.001);

    float reveal = (u + 1.0) * 0.5;
    float sweepEdge = uSweep * 1.25 - reveal;
    sweepEdge += (noise(vec2(r * 0.2, uSeed)) - 0.5) * 0.12;

    vec2 flow = vec2(s * 0.035 - uTime * 1.6 + uSeed, d * 0.085 + uTime * 0.9);
    float warp = fbm(flow * 1.7 + uSeed);
    float body = fbm(flow + warp * 0.9);
    float streak = noise(vec2(s * 0.018 - uTime * 3.2, v * 7.0 + uSeed * 3.0));
    float streak2 = noise(vec2(s * 0.03 + uTime * 2.1, v * 13.0 - uSeed));

    float finger = noise(vec2(s * 0.15 + uSeed * 5.0, d * 0.035 - uTime * 2.2));
    finger = finger * 0.65 + noise(vec2(s * 0.34 - uSeed, d * 0.07 - uTime * 3.0)) * 0.35;
    float ridge = sin(v * 9.0 - body * 5.0 + u * 3.0 + uTime * 6.0);

    float keep = mix(body, finger, 0.6) * 1.35 + 0.46 - v * 1.12 - uErode * 1.7;
    keep = min(keep, sweepEdge * 6.0);

    if (d > 0.0 && taper > 0.02 && keep > 0.0) {
      float energy = (1.0 - v) * 0.55 + body * 0.6 - uErode * 0.25;
      float e = energy + (dither - 0.5) * 0.10;

      vec3 c = VOID;
      if (e > 0.40) c = DEEP;
      if (e > 0.70) c = MID;
      if (ridge > 0.90 && v > 0.14 && v < 0.62) c = c == VOID ? DEEP : MID;
      if (ridge > 0.975 && v > 0.14 && v < 0.40) c = GLOW;

      if (streak > 0.80 && v > 0.08) c = MID;
      if (streak > 0.90 && v > 0.08) c = GLOW;
      if (streak2 > 0.86 && v > 0.30 && v < 0.85) c = DEEP;

      float lead = d;
      if (lead < 4.5) c = MID;
      if (lead < 3.0) c = GLOW;
      if (lead < 2.0) c = RIM;
      if (lead < 1.0 && uErode < 0.5) c = HOT;

      if (keep < 0.10) c = GLOW;
      if (keep < 0.05) c = RIM;
      if (keep > 0.10 && keep < 0.17 && v > 0.15) c = MID;

      float fade = 1.0 - smoothstep(0.55, 1.0, uErode);
      if (fade < 1.0 && dither > fade) {
        c = vec3(0.0);
        alpha = 0.0;
      } else {
        alpha = 0.94;
        if (c == GLOW || c == RIM || c == HOT) alpha = 1.0;
      }
      col = c * alpha;
    } else if (taper > 0.02 && sweepEdge > 0.0) {
      float ahead = -d;
      float halo = 0.0;
      if (ahead > 0.0) halo = exp(-ahead / 4.5) * (1.0 - uErode);
      else halo = exp(-max(v - 0.4, 0.0) * 2.4) * 0.38 * (1.0 - uErode * 0.6);
      halo *= taper;

      if (halo > dither * 0.9 + 0.12) col += GLOW * 0.34;
      if (halo > dither * 0.6 + 0.55) col += GLOW * 0.30;

      float shade = exp(-max(v - 0.2, 0.0) * 1.3) * 0.55 * (1.0 - uErode);
      if (ahead < 0.0 && shade > dither * 0.8 + 0.1) {
        alpha = max(alpha, 0.34);
        col *= 0.66;
      }
    }
  }

  if (uOrb > 0.01) {
    float ro = uOrbRadius * uOrb;
    float len = length(p);
    float ang = atan(p.y, p.x);

    vec2 ring = vec2(cos(ang), sin(ang));
    float lump = noise(ring * 2.2 + vec2(uTime * 2.4, -uTime * 1.9) + uSeed);
    float pulse = 1.0 + sin(uTime * 16.0) * 0.07;
    float edge = ro * pulse * (0.86 + lump * 0.30);

    if (len < edge) {
      float n = len / edge;
      float z = sqrt(max(0.0, 1.0 - n * n));
      float fres = 1.0 - z;

      float sw = ang + uTime * 5.0 + (1.0 - n) * 3.2;
      vec2 sp = vec2(cos(sw), sin(sw)) * (0.8 + n * 1.7);
      float swirl = fbm(sp * 1.6 + uSeed);

      vec3 c = VOID;
      float e = fres * 0.75 + swirl * 0.55 + (dither - 0.5) * 0.08;
      if (e > 0.62) c = DEEP;
      if (e > 0.80) c = MID;
      if (e > 0.98) c = GLOW;
      if (swirl > 0.66 && n < 0.8) c = MID;

      vec2 spec = p - vec2(-0.34, -0.38) * edge;
      if (length(spec) < edge * 0.16) c = RIM;

      if (edge - len < 2.4) c = GLOW;
      if (edge - len < 1.2) c = RIM;

      col = c;
      alpha = 1.0;
    } else if (len < ro * 2.6) {
      float past = (len - edge) / max(ro, 0.001);
      float wisp = noise(vec2(ang * 3.0 + uSeed, len * 0.22 - uTime * 7.0));
      float tendril = wisp - past * 0.75;

      if (tendril > 0.52) {
        col = (tendril > 0.62 ? MID : DEEP);
        alpha = 1.0;
        if (tendril < 0.56) col = GLOW;
      } else {
        float halo = exp(-past * 2.2) * uOrb;
        if (halo > dither * 0.9 + 0.16) col += GLOW * 0.36;
        if (halo > dither * 0.6 + 0.6) col += GLOW * 0.3;
      }
    }
  }

  gl_FragColor = vec4(col, alpha);
}
`;
