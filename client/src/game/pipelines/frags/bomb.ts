import { NOISE } from "./common";

export const getBombFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uGround;
uniform float uLayer;
uniform float uRadius;
uniform float uCharge;
uniform float uBlast;
uniform float uGrow;
uniform float uRise;
uniform float uScorch;
uniform float uFade;

varying vec2 fragCoord;
${NOISE}
const float SQUASH = 0.58;
const vec3 SOOT = vec3(0.050, 0.030, 0.030);
const vec3 CHAR = vec3(0.120, 0.060, 0.040);
const vec3 RUST = vec3(0.420, 0.160, 0.050);
const vec3 EMBER = vec3(0.860, 0.330, 0.060);
const vec3 FLAME = vec3(1.000, 0.560, 0.120);
const vec3 GOLD = vec3(1.000, 0.800, 0.340);
const vec3 WHITE = vec3(1.000, 0.950, 0.760);

vec3 fire(float heat) {
  vec3 c = mix(vec3(0.520, 0.130, 0.130), vec3(0.840, 0.280, 0.150), smoothstep(0.00, 0.35, heat));
  c = mix(c, vec3(0.960, 0.440, 0.150), smoothstep(0.20, 0.55, heat));
  c = mix(c, vec3(1.000, 0.600, 0.200), smoothstep(0.38, 0.68, heat));
  c = mix(c, vec3(1.000, 0.760, 0.330), smoothstep(0.52, 0.82, heat));
  c = mix(c, vec3(1.000, 0.880, 0.560), smoothstep(0.68, 0.96, heat));
  return mix(c, vec3(1.000, 0.960, 0.820), smoothstep(0.88, 1.10, heat));
}

float hash3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x);
  float b = mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x);
  float c = mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x);
  float d = mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x);
  return mix(mix(a, b, f.y), mix(c, d, f.y), f.z);
}

const float ORB = 0.96;

vec3 swirl(vec3 q) {
  float twist = q.y * 2.4 - uTime * 5.0;
  return vec3(q.x * cos(twist) - q.z * sin(twist), q.y, q.x * sin(twist) + q.z * cos(twist));
}

vec2 stream(vec3 q) {
  vec3 w = swirl(q);
  float n = noise3(w * 2.6 + uSeed) * 0.6 + noise3(w * 5.6 - vec3(0.0, uTime * 2.2, 0.0)) * 0.4;
  float spent = (1.0 - uBlast) * 0.9;

  float rad = length(q.xz);
  float az = atan(q.z, q.x);
  float h = clamp((q.y + 0.28) / 1.50, 0.0, 1.0);
  float profile = sqrt(max(ORB * ORB - q.y * q.y, 0.0)) * 1.05 + 0.08 + 0.10 * h;
  float arm = sin(az * 3.0 + q.y * 4.8 - uTime * 7.0 + n * 1.5);
  float grown = smoothstep(uRise * 1.5, uRise * 1.5 - 0.30, h);
  float band = smoothstep(-0.35, 0.45, arm) * smoothstep(0.22, 0.05, abs(rad - profile) + (n - 0.5) * 0.20);
  band *= grown * smoothstep(0.16 + spent, 0.34 + spent, n + 0.14) * smoothstep(1.06, 0.92, h);

  float heat = 0.60 + arm * 0.16 + (n - 0.5) * 0.34 + (1.0 - h) * 0.18 - spent * 0.3;

  float wide = profile * 1.20 + 0.06;
  float slow = noise3(w * 1.1 + uSeed + 5.0);
  float arm2 = sin(az * 2.0 - q.y * 3.2 + uTime * 5.0 + slow * 2.4);
  float outer = smoothstep(-0.10, 0.60, arm2) * smoothstep(0.16, 0.05, abs(rad - wide) + (slow - 0.5) * 0.12);
  outer *= smoothstep(uRise * 1.3, uRise * 1.3 - 0.30, h) * smoothstep(0.26 + spent, 0.44 + spent, slow + 0.12) * smoothstep(0.95, 0.70, h) * 0.85;
  float cool = 0.32 + arm2 * 0.14 + (slow - 0.5) * 0.26 + (n - 0.5) * 0.10 + (1.0 - h) * 0.14 - spent * 0.3;

  return outer > band ? vec2(outer, cool) : vec2(band, heat);
}

vec3 surface(vec3 q, vec3 d) {
  vec3 nrm = q / ORB;
  float facing = clamp(-dot(nrm, d), 0.0, 1.0);
  vec3 w = swirl(nrm);
  float broad = noise3(w * 1.6 + uSeed);
  float fine = noise3(w * 4.2 - vec3(0.0, uTime * 1.6, 0.0) + uSeed);
  float az = atan(nrm.z, nrm.x);
  float coil = sin(az * 2.0 + nrm.y * 7.0 - uTime * 5.0 + broad * 4.0) * 0.5 + 0.5;
  float coil2 = sin(az * 3.0 - nrm.y * 4.0 + uTime * 3.0 + fine * 3.0) * 0.5 + 0.5;

  float calm = 1.0 - smoothstep(0.65, 1.0, nrm.y);
  float heat = 0.40 + pow(facing, 0.7) * 0.26 + (broad - 0.5) * 0.30 + (fine - 0.5) * 0.14 + ((coil - 0.5) * 0.36 + (coil2 - 0.5) * 0.14) * calm;
  heat += smoothstep(0.60, 0.0, nrm.y) * 0.34 - nrm.y * 0.10 + smoothstep(0.72, 1.0, nrm.y) * 0.24 - (1.0 - uBlast) * 0.3;
  return fire(heat);
}

void main(void) {
  vec2 p = vec2(fragCoord.x - resolution.x * 0.5, fragCoord.y - uGround);
  float live = 1.0 - clamp(uFade, 0.0, 1.0);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec2 e = vec2(p.x, p.y / SQUASH);
  float rad = length(e);
  float rn = rad / uRadius;
  float ang = atan(e.y, e.x);
  vec2 dir = vec2(cos(ang), sin(ang));
  float near = smoothstep(0.6, -0.9, dir.y);

  if (uLayer < 0.5) {
    if (uCharge > 0.001) {
      float size = (0.35 + 0.65 * uCharge) * 1.30;
      float cn = rn / size;
      float spin = ang + cn * (3.0 + 1.6 * noise(dir * 1.2 + uSeed + 2.0)) - uTime * 2.6;
      vec2 sw = vec2(cos(spin), sin(spin));
      float swirl = fbm(sw * 1.5 + cn * 1.2 + uSeed);
      float arm = fbm(sw * 3.4 - cn * 0.8 + uSeed * 2.0);

      float disc = smoothstep(1.0, 0.90, cn + (swirl - 0.5) * 0.10);
      vec3 c = mix(SOOT, CHAR, smoothstep(0.35, 0.60, swirl));
      c = mix(c, RUST * 0.8, smoothstep(0.58, 0.80, arm) * smoothstep(0.15, 0.75, cn) * 0.60);
      float a = disc * (0.26 + 0.20 * swirl) * uCharge;
      col = c * a;
      alpha = a;

      for (int k = 0; k < 6; k++) {
        float fk = float(k);
        float at = 0.90 + 0.016 * fk;
        float wob = (noise(dir * (1.1 + 0.25 * fk) + uSeed + fk * 3.0) - 0.5) * 0.13;
        float stroke = 0.010 + 0.050 * noise(dir * (1.8 + 0.4 * fk) - uSeed + fk * 5.0);
        float line = smoothstep(stroke, stroke * 0.25, abs(cn - at - wob));

        float pick = fract(fk * 0.37 + uSeed * 0.31);
        vec3 rc = mix(vec3(0.320, 0.100, 0.090), vec3(0.560, 0.200, 0.070), smoothstep(0.0, 0.35, pick));
        rc = mix(rc, vec3(0.760, 0.330, 0.090), smoothstep(0.30, 0.60, pick));
        rc = mix(rc, vec3(0.860, 0.520, 0.200), smoothstep(0.55, 0.85, pick));
        rc = mix(rc, vec3(0.900, 0.700, 0.400), smoothstep(0.80, 1.00, pick));
        rc *= 0.75 + 0.35 * near;

        float r = line * 0.30 * uCharge;
        col = col * (1.0 - r) + rc * r;
        alpha = alpha * (1.0 - r) + r;
      }

      float inner = smoothstep(0.016, 0.004, abs(cn - 0.52 - (noise(dir * 2.4 + 3.0) - 0.5) * 0.10)) * smoothstep(0.50, 0.66, arm);
      col += RUST * inner * uCharge * 0.22;

      float pulse = 0.85 + 0.15 * sin(uTime * 14.0);
      col += GOLD * exp(-cn / 0.075) * uCharge * pulse * 0.45;
      col += FLAME * exp(-cn / 0.20) * uCharge * pulse * 0.18;
      col += EMBER * exp(-cn / 0.50) * uCharge * 0.06;
    }

    if (uBlast > 0.001) {
      float size = 0.6 + 0.9 * uGrow;
      float bn = rn / size;
      col += GOLD * exp(-bn * bn * 3.0) * uBlast * 0.60;
      col += FLAME * exp(-bn * bn * 1.1) * uBlast * 0.42;
      col += vec3(0.800, 0.240, 0.200) * exp(-bn * bn * 0.35) * uBlast * 0.26;

      float ray = smoothstep(0.80, 0.86, noise(dir * 13.0 + uSeed)) * smoothstep(0.62, 0.70, noise(dir * 3.0 - uSeed));
      col += GOLD * ray * smoothstep(0.7, 1.1, bn) * exp(-max(bn - 1.0, 0.0) * 0.9) * uBlast * 0.62;
      col += vec3(0.420, 0.180, 0.480) * smoothstep(0.45, 0.0, abs(bn - 1.30)) * uBlast * 0.20;

      float halo1 = smoothstep(0.035, 0.0, abs(bn - 1.18)) * smoothstep(0.30, 0.50, noise(dir * 2.0 + uSeed));
      float halo2 = smoothstep(0.020, 0.0, abs(bn - 1.50)) * smoothstep(0.50, 0.70, noise(dir * 1.6 - uSeed));
      col += EMBER * (halo1 * 0.55 + halo2 * 0.30) * uBlast;
    }

    if (uScorch > 0.001) {
      float sr = rn / 1.40;
      float turn = (ang + 3.14159265) / 6.2831853;
      float burn = smoothstep(1.05, 0.88, sr + (fbm(dir * 3.0 + uSeed) - 0.5) * 0.20);
      float cool = 1.0 - clamp(uFade * 1.6, 0.0, 1.0);

      float bent = sr * (1.0 + (fbm(dir * 1.7 + uSeed * 3.0) - 0.5) * 0.30) + (noise(e * 0.045 + uSeed) - 0.5) * 0.07;
      float lane = bent * 4.3 + turn + uSeed * 0.1;
      float coil = abs(fract(lane) - 0.5) * 2.0;
      float rough = noise(e * 0.20 + uSeed * 5.0);
      float heavy = 0.945 - 0.070 * rough * rough;
      float coilGap = smoothstep(0.24, 0.34, noise(dir * 2.4 + bent * 3.0 + uSeed)) * smoothstep(0.24, 0.34, noise(e * 0.110 + uSeed * 2.0));
      float track = smoothstep(heavy, heavy + 0.030, coil) * coilGap;

      float level = floor(lane);
      float count = 3.0 + level * 1.5;
      float sect = turn * count + hash(vec2(level, uSeed)) + (noise(e * 0.05 - uSeed) - 0.5) * 0.4;
      float spoke = abs(fract(sect) - 0.5) * 2.0;
      float spokeOn = step(0.35, hash(vec2(floor(sect), level + uSeed)));
      float span = 6.2831853 * max(sr, 0.08) * uRadius * 1.4 / count;
      float rib = smoothstep(1.0 - (0.8 + 2.0 * rough * rough) / span, 1.0 - 0.4 / span, spoke) * spokeOn * coilGap;

      float vein = abs(fbm(e * 0.085 + uSeed * 4.0) - 0.5);
      float chip = smoothstep(0.010, 0.003, vein) * smoothstep(0.50, 0.66, noise(e * 0.045 + uSeed + 9.0)) * 0.7;
      rib = max(rib, chip);

      float seam = clamp(max(track, rib), 0.0, 1.0) * burn * step(0.05, sr);
      float slab = hash(vec2(floor(sect), level + 3.0 + uSeed));
      float grit = fbm(e * 0.08 + uSeed * 2.0);

      vec3 c = mix(SOOT, CHAR, slab * 0.7 + grit * 0.4);
      c = mix(c, RUST * 0.60, smoothstep(0.70, 0.95, slab) * smoothstep(0.55, 0.10, sr) * 0.45 * cool);
      c *= 0.55 + 0.45 * smoothstep(1.0, 0.2, sr);
      float a = burn * 0.50 * uScorch * live;
      col = col * (1.0 - a) + c * a;
      alpha = alpha * (1.0 - a) + a;

      float flick = 0.72 + 0.28 * noise(vec2(sr * 9.0 + turn * 20.0, uTime * 2.5));
      float inward = smoothstep(0.85, 0.0, sr);
      vec3 hot = mix(vec3(0.560, 0.130, 0.050), vec3(0.920, 0.360, 0.080), smoothstep(0.10, 0.50, inward));
      hot = mix(hot, GOLD, smoothstep(0.62, 0.95, inward));
      col += hot * seam * uScorch * cool * flick * (0.22 + 0.40 * inward * inward);
      col += GOLD * exp(-sr / 0.045) * uScorch * cool * 0.32;
      col += vec3(0.900, 0.340, 0.080) * exp(-sr / 0.16) * uScorch * cool * 0.08;

      for (int k = 0; k < 3; k++) {
        float fk = float(k);
        float at = 1.10 + fk * 0.20;
        float drift = uTime * (0.25 - fk * 0.08) + fk * 2.0;
        vec2 rd = vec2(cos(ang - drift), sin(ang - drift));
        float wob = (noise(rd * 1.4 + uSeed + fk) - 0.5) * 0.14;
        float on = smoothstep(0.50, 0.62, noise(rd * 1.5 + uSeed * 2.0 + fk * 7.0));
        float fat = (0.030 + 0.070 * noise(rd * 2.6 - uSeed + fk)) * on;
        float sweep = smoothstep(fat, fat * 0.30, abs(sr - at - wob)) * on;
        float s = sweep * (0.22 - fk * 0.05) * uScorch * live;
        vec3 sc = mix(CHAR * 1.4, RUST * 0.8, 0.25 + 0.55 * cool) * (0.8 + 0.5 * noise(rd * 5.0 + fk));
        col = col * (1.0 - s) + sc * s;
        alpha = alpha * (1.0 - s) + s;
      }
    }
  } else {
    if (uCharge > 0.001) {
      float core = length(vec2(p.x, (p.y - 3.0) * 1.3));
      col += GOLD * exp(-core / (uRadius * 0.07)) * uCharge * 0.20;
    }

    if (uBlast > 0.001) {
      float size = uRadius * (0.80 + 0.70 * uGrow);

      float aura = length(vec2(p.x, (p.y - size * 0.45) / 0.95)) / size;
      col += vec3(0.860, 0.260, 0.240) * exp(-max(aura - 0.75, 0.0) * 2.2) * uBlast * 0.36;

      float ce = cos(0.62);
      float se = sin(0.62);
      vec3 d = vec3(0.0, -se, -ce);
      float scale = size * (0.72 + 0.30 * uRise);
      float lift = 0.28;
      vec3 oo = (vec3(p.x, p.y * ce, -p.y * se) - d * 1000.0) / scale - vec3(0.0, lift, 0.0);

      float b = dot(oo, d);
      float disc = b * b - (dot(oo, oo) - 2.20);

      if (disc > 0.0) {
        float root = sqrt(disc);
        float t0 = -b - root;
        float span = 2.0 * root / 18.0;
        float grain = 0.30 + 0.40 * hash(fragCoord + fract(uTime * 7.0) * 31.0);

        float inner = b * b - (dot(oo, oo) - ORB * ORB);
        float hit = inner > 0.0 ? -b - sqrt(inner) : 1.0e6;
        vec3 at = oo + d * hit;
        if (at.y < -lift) hit = 1.0e6;
        if (at.y > ORB * (0.30 + 1.2 * uRise)) hit = 1.0e6;

        for (int k = 0; k < 18; k++) {
          float t = t0 + (float(k) + grain) * span;

          if (t > hit) {
            float worn = noise3(swirl(at / ORB) * 2.2 + uSeed);
            float edge = clamp(-dot(at / ORB, d), 0.0, 1.0);
            float left = (1.0 - alpha) * smoothstep(0.20, 0.60, uBlast + (worn - 0.5) * 0.7) * smoothstep(0.0, 0.22, edge);
            col += surface(at, d) * left;
            alpha += left;
            break;
          }

          vec3 q = oo + d * t;
          if (q.y < -lift) continue;

          vec2 f = stream(q);
          float a = f.x * min(span * 5.5, 1.0) * (1.0 - alpha);
          col += fire(f.y) * a;
          alpha += a;
        }
      }

      float flare = length(vec2(p.x, (p.y - size * 0.04) / 0.36)) / size;
      col += vec3(1.000, 0.960, 0.820) * exp(-flare * flare * 2.2) * uBlast * 0.62;
      col += vec3(1.000, 0.640, 0.560) * exp(-flare * flare * 0.9) * uBlast * 0.30;
      col += vec3(1.000, 0.700, 0.300) * exp(-aura * aura * 1.6) * uBlast * 0.10;
    }

    if (uScorch > 0.001) {
      vec2 q = p - vec2(0.0, uRadius * 0.55);
      float drift = fbm(q / uRadius * 1.6 + vec2(uSeed, -uTime * 0.30));
      float haze = exp(-dot(q, q) / (uRadius * uRadius * 0.9)) * smoothstep(0.35, 0.70, drift);
      float a = haze * 0.14 * uScorch * (1.0 - smoothstep(0.15, 0.85, uFade));
      col = col * (1.0 - a) + SOOT * 1.6 * a;
      alpha = alpha * (1.0 - a) + a;
    }
  }

  float fringe = min(min(fragCoord.x, resolution.x - fragCoord.x), min(fragCoord.y, resolution.y - fragCoord.y));
  gl_FragColor = vec4(col, alpha) * smoothstep(0.0, 24.0, fringe);
}
`;
