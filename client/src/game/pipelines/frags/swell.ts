import { NOISE } from "./common";

export const getSwellFrag = (): string => `
precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform float uSeed;
uniform float uGround;
uniform float uLayer;
uniform float uRadius;
uniform float uCharge;
uniform float uBurst;
uniform float uDome;
uniform float uFlash;
uniform float uSpread;
uniform float uHollow;
uniform float uFade;
uniform float uSoak;

varying vec2 fragCoord;

${NOISE}

const float TAU = 6.2831853;
const vec3 SOAK = vec3(0.012, 0.055, 0.150);
const vec3 ABYSS = vec3(0.020, 0.150, 0.460);
const vec3 DEEP = vec3(0.040, 0.300, 0.740);
const vec3 BLUE = vec3(0.070, 0.480, 0.930);
const vec3 AZURE = vec3(0.150, 0.660, 0.980);
const vec3 CYAN = vec3(0.380, 0.870, 0.990);
const vec3 FOAM = vec3(0.820, 0.970, 1.000);

float cells(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = vec2(mod(i.x + o.x, period), i.y + o.y);
      vec2 pt = o + vec2(hash(c), hash(c + 7.3)) - f;
      float d = dot(pt, pt);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return sqrt(d2) - sqrt(d1);
}

const vec3 SUN = vec3(-0.512, 0.563, 0.648);
const vec3 GLINT = vec3(-0.349, -0.140, 0.927);

vec2 churn(vec2 e, float R) {
  float turn = uSeed - length(e) / R * 0.30;
  float cs = cos(turn);
  float sn = sin(turn);
  return vec2(e.x * cs - e.y * sn, e.x * sn + e.y * cs) / R;
}

float girth() {
  return mix(max(uSpread, 0.05), 0.58, uHollow);
}

float surf(vec2 e, float R) {
  float r = length(e) / R;
  float ang = atan(e.y, e.x);
  vec2 w = churn(e, R);
  float n1 = noise(w * 2.2 + uSeed);
  float n2 = noise(w * 5.0 - uSeed + 3.0);

  float wide = girth();
  float t = (r - uSpread + wide) / wide;
  float back = uSpread - r;

  float env = smoothstep(1.10, 0.88, t) * mix(1.0, smoothstep(-0.05, 0.30, t), uHollow) * smoothstep(0.0, 0.3, uSpread);
  float roll = 0.5 + 0.5 * sin(back * 26.0 + (n1 - 0.5) * 5.5 + sin(ang + uSeed) * 1.3 + uTime * 2.2);
  roll *= roll;
  float fine = 0.5 + 0.5 * sin(back * 43.0 - (n1 - 0.5) * 9.0 + n2 * 4.0 + uTime * 3.6);
  fine *= fine * smoothstep(0.30, 0.70, n2);
  float swell = 0.5 + 0.5 * sin(ang * 2.0 + r * 5.0 - uTime * 1.6 + (n1 - 0.5) * 3.0);
  float lead = exp(-pow((t - 0.80) / 0.13, 2.0)) * (0.45 + 1.10 * n1);
  float eye = exp(-pow(r / max(uSpread, 0.2), 2.0) * 30.0) * (1.0 - uHollow) * (1.0 - uDome);

  float h = roll * mix(0.42, 0.70, uHollow) * (0.55 + 0.90 * n2) + fine * 0.24 + swell * 0.22 + (n2 - 0.5) * 0.40;
  h += lead * (0.30 + 1.05 * uHollow) - eye * 0.45;
  h *= env * (1.0 - uFade * 0.85);

  float mound = r / max(uSpread * 0.52, 0.05);
  h += exp(-mound * mound) * uDome * smoothstep(0.0, 0.30, uBurst) * (1.5 + 0.8 * n1) * (1.0 - uHollow);

  return h * 0.095;
}

vec4 ground(vec2 p) {
  float R = max(uRadius, 1.0);
  vec2 e = vec2(p.x, p.y / 0.6);
  float wide = girth();
  float reach = length(e) / R;
  bool live = uSpread > 0.0 && uFade < 1.0 && reach < uSpread + 0.55 && reach > (uSpread - wide) * uHollow - 0.40;
  float h = 0.0;

  if (live) {
    for (int i = 0; i < 3; i++) {
      h = surf(e, R);
      e.y = (p.y - h * R) / 0.6;
    }
    h = surf(e, R);
  }

  float len = length(e);
  float r = len / R;
  vec2 dir = e / max(len, 0.001);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (uCharge > 0.0) {
    float c = r / 0.45;
    float wander = (noise(dir * 2.0 + uSeed) - 0.5) * 0.10;
    float thick = 0.020 + 0.030 * noise(dir * 3.0 - uSeed);
    float ring = smoothstep(thick, 0.0, abs(c - 0.80 * uCharge - wander));
    ring *= 0.25 + 0.75 * smoothstep(0.30, 0.65, noise(dir * 2.6 + uSeed + 4.0));
    col += BLUE * ring * uCharge * 0.26;

    vec2 g = e / (R * 0.45);
    vec2 kink = vec2(fbm(g * 2.6 + uSeed + 2.0), fbm(g * 2.6 - uSeed + 8.0)) - 0.47;
    float web = seams(g * 2.7 + kink * 1.5 + uSeed);
    float line = smoothstep(0.035 + 0.070 * exp(-c * 4.0), 0.0, web) * smoothstep(0.70 * uCharge, 0.08 * uCharge, c);
    line *= smoothstep(0.30, 0.55, fbm(g * 2.0 - uSeed));
    col += mix(CYAN, FOAM, 0.4) * line * uCharge * 1.10;
    col += AZURE * smoothstep(0.22, 0.0, web) * smoothstep(0.55 * uCharge, 0.05, c) * uCharge * 0.16;
    float disc = smoothstep(0.85, 0.40, c / max(uCharge, 0.01)) * (0.5 + 0.5 * fbm(g * 2.5 + uSeed));
    col += DEEP * disc * uCharge * 0.30;
    col += AZURE * exp(-c * 5.0) * uCharge * 0.18;
  }

  if (uSpread > 0.0) {
    vec2 w = churn(e, R);

    float cloud = fbm(w * 1.7 + uSeed);
    float puff = fbm(w * 3.4 - uSeed + 5.0);
    float patch1 = smoothstep(0.34, 0.66, cloud);
    float patch2 = smoothstep(0.38, 0.62, puff);

    float shore = (cloud - 0.47) * mix(0.26, 0.55, uHollow) + (puff - 0.47) * mix(0.12, 0.30, uHollow);
    float t = (r - uSpread + wide) / wide - shore;

    float soak = uSoak * 1.35;
    float hold = cloud * 0.55 + puff * 0.45 + r / max(uSpread, 0.3) * 0.24;
    float wet = smoothstep(1.02, 0.84, t) * smoothstep(soak - 0.30, soak, hold) * smoothstep(0.0, 0.3, uSpread);
    float glint = smoothstep(0.66, 0.74, noise(w * 13.0 + uSeed + 2.0)) * patch2;
    float film = wet * (0.20 + 0.10 * patch1);
    vec3 sheen = AZURE * wet * (patch2 * 0.050 + glint * 0.085) * (1.0 - uSoak * 0.7);

    alpha += film;
    col += SOAK * film + sheen;

    if (live) {
      float damp = fbm(w * 2.1 + uSeed * 3.0);
      float gaps = smoothstep(0.30, 0.62, fbm(w * 2.0 + uSeed + 1.0));
      float tin = t + (damp - 0.47) * 1.10 + (puff - 0.47) * 0.50;

      float late = uFade * 0.95;
      float tatter = smoothstep(late - 0.40, late, damp * 0.70 + 0.30);
      float dry = tatter * (1.0 - smoothstep(0.80, 1.0, uFade));
      float body = smoothstep(1.06, 0.82, t) * mix(1.0, smoothstep(0.0, 0.34, tin), uHollow) * dry;

      float step = R * 0.035;
      float hx = surf(e + vec2(step, 0.0), R);
      float hy = surf(e + vec2(0.0, step), R);
      vec3 n = normalize(vec3((h - hx) * R / step, (h - hy) * R / step, 0.60));
      float lit = clamp(dot(n, SUN), 0.0, 1.0);
      float shade = smoothstep(0.25, 0.95, lit);
      float spec = pow(max(dot(n, GLINT), 0.0), 34.0);
      float lift = h / 0.095;
      float crest = smoothstep(0.75, 1.35, lift);
      float trough = smoothstep(0.55, 0.05, lift);

      float eye = r / max(uSpread, 0.3);
      float centre = exp(-eye * 2.3) * (1.0 - uHollow);
      float core = exp(-eye * 5.5) * (1.0 - uHollow);

      vec3 base = mix(DEEP, mix(DEEP, BLUE, 0.45), smoothstep(0.0, 0.7, t));
      base = mix(base, BLUE, patch1 * 0.85);
      base = mix(base, AZURE, patch2 * patch1 * 0.35 + centre * 0.70);
      base = mix(base, ABYSS, trough * 0.30);
      base = mix(base * 0.84, base * 1.22, shade);
      base = mix(base, mix(AZURE, CYAN, 0.35), crest * (0.30 + 0.50 * shade));

      float cover = body * (0.64 + 0.14 * trough + 0.10 * centre - 0.10 * crest) * (1.0 - uFade * 0.60);
      col = col * (1.0 - cover) + base * cover;
      alpha = alpha * (1.0 - cover) + cover;
      col += mix(BLUE, AZURE, patch2) * (0.10 + 0.22 * patch1) * body * (1.0 - uFade * 0.8);

      float bright = centre * (0.45 + 0.65 * patch2) * (0.60 + 0.70 * shade);
      col += CYAN * bright * body * 0.62 * (1.0 - uFade);
      col += mix(CYAN, FOAM, 0.45) * core * (0.4 + 0.6 * patch2) * body * (0.20 + 0.50 * uFlash) * (1.0 - uFade);
      col += mix(CYAN, FOAM, 0.65) * spec * body * (0.36 + 0.40 * uFlash) * (1.0 - uFade * 0.7);

      float brow = smoothstep(1.15, 1.75, lift) * (0.35 + 0.65 * smoothstep(0.35, 0.65, noise(w * 9.0 + uSeed + uTime * 1.5)));
      col += mix(CYAN, FOAM, 0.65) * brow * body * uHollow * 0.80 * (1.0 - uFade);

      if (uDome > 0.0) {
        float ca = fbm(w * 4.6 + uSeed + 7.0 + vec2(0.0, uTime * 0.6));
        float cb = fbm(w * 7.5 - uSeed + vec2(uTime * 0.5, 0.0));
        float lace = pow(1.0 - abs(ca * 2.0 - 0.95), 9.0) * smoothstep(0.40, 0.58, cb);
        float blob = smoothstep(0.66, 0.74, cb) * smoothstep(0.50, 0.62, ca);
        col += mix(CYAN, FOAM, 0.5) * (lace * 1.10 + blob * 0.55) * (0.35 + 0.65 * crest) * body * uDome;
      }

      float rim = smoothstep(0.14, 0.0, abs(t - 0.90)) * (0.25 + 0.75 * gaps);
      col += mix(AZURE, CYAN, 0.4 * uHollow) * rim * dry * (0.06 + 0.26 * uFlash + 0.16 * uHollow) * (1.0 - uFade);
    }

    float halo = smoothstep(1.75, 1.00, t) * smoothstep(0.60, 1.00, t);
    halo *= 0.45 + 0.55 * puff;
    col += DEEP * halo * (0.26 + 0.22 * uFlash) * (1.0 - uFade) * smoothstep(0.0, 0.5, uSpread);
  }

  return vec4(col, alpha);
}

vec4 standing(vec2 p) {
  float F = max(uRadius, 1.0);
  float R = F * 0.46;
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (uFlash > 0.0) {
    vec2 f = vec2(p.x, (p.y - R * 0.10) / 0.80) / R;
    float d = length(f);
    float glow = exp(-d * d * 9.0) * uFlash * uFlash;
    col += mix(AZURE, FOAM, glow) * glow * 0.40;
    col += BLUE * exp(-d * 2.6) * uFlash * 0.28;
  }

  {
    float rise = uHollow * (1.0 - smoothstep(0.10, 0.70, uFade));
    float rc = F * uSpread * 0.93;
    float sx = p.x / rc;

    if (rise > 0.0 && abs(sx) < 1.0) {
      float arc = sqrt(1.0 - sx * sx);
      for (int k = 0; k < 2; k++) {
        float side = k == 0 ? 1.0 : -1.0;
        vec2 rd = vec2(sx, side * arc);
        float tall = fbm(rd * 3.1 * (0.6 + uSpread) + uSeed + 2.0);
        float tooth = noise(rd * 7.0 - uSeed + uTime * 1.5);
        float tongue = smoothstep(0.28, 0.60, noise(rd * 6.5 * (0.6 + uSpread) + uSeed + 6.0));
        float top = F * rise * (0.06 + 1.25 * tall * tall + 0.14 * tooth) * (0.35 + 0.65 * tongue) * (0.70 + 0.30 * side) * 0.24;
        float foot = side * arc * rc * 0.6 + (noise(rd * 3.0 - uSeed) - 0.5) * F * 0.05;
        float v = (p.y - foot) / max(top, 0.001);

        if (v > 0.0 && v < 1.0) {
          float fall = noise(vec2(rd.x * 9.0 + rd.y * 4.0, v * 2.2 + uTime * 2.4) + uSeed);
          float sheet = smoothstep(0.0, 0.45, v) * smoothstep(1.0, 0.55 + 0.35 * fall, v) * (0.25 + 0.75 * tongue);
          float flank = 0.55 + 0.45 * smoothstep(1.0, 0.55, abs(sx));
          float lipw = smoothstep(0.45, 0.85, v) * sheet;
          float a = sheet * flank * (0.18 + 0.42 * fall) * (0.60 + 0.40 * step(side, 0.0)) * smoothstep(0.0, 0.3, rise);
          vec3 tone = mix(BLUE, AZURE, v * 0.6);
          tone = mix(tone, AZURE, fall * 0.55);
          tone = mix(tone, mix(CYAN, FOAM, 0.5), lipw * (0.55 + 0.45 * fall));
          col = col * (1.0 - a * 0.6) + tone * a;
          alpha = alpha * (1.0 - a * 0.6) + a * 0.80;
        }
      }
    }
  }

  return vec4(col, alpha);
}

void main(void) {
  vec2 p = fragCoord - vec2(resolution.x * 0.5, uGround);
  vec4 c = uLayer < 0.5 ? ground(p) : standing(p);

  float border = min(min(fragCoord.x, resolution.x - fragCoord.x), min(fragCoord.y, resolution.y - fragCoord.y));
  float fade = smoothstep(0.0, 24.0, border);

  gl_FragColor = c * fade;
}
`;
