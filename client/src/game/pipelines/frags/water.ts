export const getWaterVert = (): string => `
#define SHADER_NAME WATER_VS

precision highp float;

uniform mat4 uProjectionMatrix;
uniform vec2 uWorldView;
uniform float uZoom;

attribute vec2 inPosition;
attribute vec2 inTexCoord;
attribute float inTexId;
attribute float inTintEffect;
attribute vec4 inTint;

varying vec2 outTexCoord;
varying vec2 outWorld;

void main() {
  gl_Position = uProjectionMatrix * vec4(inPosition, 1.0, 1.0);

  outTexCoord = inTexCoord;
  outWorld = uWorldView + inPosition / uZoom;
}
`;

export const getWaterFrag = (): string => `
#define SHADER_NAME WATER_FS

precision highp float;

uniform sampler2D uMainSampler;
uniform sampler2D uDepth;
uniform sampler2D uCaustics;
uniform sampler2D uWake;
uniform sampler2D uShore;

uniform vec2 uMapSize;
uniform float uTime;
uniform float uPixelization;

uniform vec3 uGradient0;
uniform vec3 uGradient1;
uniform vec3 uGradient2;
uniform vec3 uGradientAt;

uniform float uCausticScale;
uniform float uMovementScale;
uniform float uMovementAmount;
uniform float uCausticSpeed;
uniform float uSquash;
uniform float uFaderMultiplier;
uniform float uFaderScale;
uniform vec4 uCausticColor;
uniform vec4 uHighlightColor;

uniform float uSpecularThreshold;
uniform float uSpecularSpeed;
uniform float uSpecularScale;
uniform float uSpecularScale2;
uniform vec4 uSpecularColor;

uniform float uFoamScale;
uniform vec4 uFoamColor;

uniform float uBeachEdge;
uniform vec2 uBeachBands;
uniform vec2 uBeachBandAlphas;
uniform float uBeachBandNoise;
uniform vec3 uBeachShallowColor;
uniform float uBeachNoise;
uniform float uBeachNoiseScale;
uniform float uBeachPeriod;
uniform float uBeachRun;
uniform float uBeachFoam;
uniform float uBeachFoamBreak;
uniform float uBeachFoamScale;
uniform vec4 uBeachFoamColor;
uniform vec4 uBeachWetColor;

uniform vec2 uWakeOrigin;
uniform vec2 uWakeSize;
uniform float uWakePhase;
uniform float uWakeSkew;
uniform float uWakeSpeed;
uniform float uWakeAlpha;
uniform float uWakeFill;
uniform float uWakeRipple;
uniform float uWakeLevels;
uniform float uWakeCutoff;
uniform float uWakeTail;
uniform vec3 uWakeColor;

varying vec2 outTexCoord;
varying vec2 outWorld;

vec2 gradientDir(vec2 p) {
  p = mod(p, 289.0);
  float x = mod((34.0 * p.x + 1.0) * p.x, 289.0) + p.y;
  x = mod((34.0 * x + 1.0) * x, 289.0);
  x = fract(x / 41.0) * 2.0 - 1.0;
  return normalize(vec2(x - floor(x + 0.5), abs(x) - 0.5));
}

float gradientNoise(vec2 uv, float scale) {
  vec2 p = uv * scale;
  vec2 ip = floor(p);
  vec2 fp = fract(p);
  float d00 = dot(gradientDir(ip), fp);
  float d01 = dot(gradientDir(ip + vec2(0.0, 1.0)), fp - vec2(0.0, 1.0));
  float d10 = dot(gradientDir(ip + vec2(1.0, 0.0)), fp - vec2(1.0, 0.0));
  float d11 = dot(gradientDir(ip + vec2(1.0, 1.0)), fp - vec2(1.0, 1.0));
  fp = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);
  return mix(mix(d00, d01, fp.y), mix(d10, d11, fp.y), fp.x) + 0.5;
}

float overlay(float base, float blend) {
  float screen = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
  float multiply = 2.0 * base * blend;
  float below = step(base, 0.5);
  return multiply * below + (1.0 - below) * screen;
}

vec3 depthColor(float t) {
  vec3 color = uGradient0;
  if (t > uGradientAt.x) color = mix(uGradient0, uGradient1, clamp((t - uGradientAt.x) / (uGradientAt.y - uGradientAt.x), 0.0, 1.0));
  if (t > uGradientAt.y) color = mix(uGradient1, uGradient2, clamp((t - uGradientAt.y) / (uGradientAt.z - uGradientAt.y), 0.0, 1.0));
  return color;
}

float shoreAt(vec2 cell) {
  return texture2D(uShore, cell / uMapSize).r;
}

float beachField(vec2 cell, float shore) {
  return shore + (gradientNoise(cell / 16.0, uBeachNoiseScale) - 0.5) * 2.0 * uBeachNoise;
}

float wake(vec2 pixel) {
  vec2 uv = (pixel + 0.5 - uWakeOrigin) / uWakeSize;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;

  vec4 texel = texture2D(uWake, uv);
  if (texel.a <= 0.0) return 0.0;

  float across = texel.r;
  float strength = texel.g;
  float ring = texel.b;

  float edge = mix(uWakeFill, 1.0, smoothstep(0.45, 0.95, across));
  float along = mix(1.0 - strength, across, ring);
  float phase = along * uWakePhase + across * uWakeSkew * (1.0 - ring);
  float ripple = (sin(phase - uTime * uWakeSpeed) * 0.5 + 0.5) * uWakeRipple;
  float alpha = clamp(strength * edge * uWakeAlpha - ripple, 0.0, uWakeCutoff);

  float tail = mix(smoothstep(0.0, uWakeTail, strength), 1.0, ring);
  return floor(alpha / uWakeCutoff * uWakeLevels + 0.5) / uWakeLevels * uWakeCutoff * tail;
}

float caustic(vec2 uv, float row) {
  return texture2D(uCaustics, vec2(fract(uv.x), (fract(uv.y) + row) * 0.5)).a;
}

void main(void) {
  float mask = texture2D(uMainSampler, outTexCoord).a;
  if (mask <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 pos = outWorld / 16.0;
  vec2 pix = floor(pos * uPixelization) / uPixelization;
  vec4 info = texture2D(uDepth, outWorld / uMapSize);

  vec3 depth = depthColor(info.r);

  vec2 squashed = pix * vec2(1.0, uSquash);
  float shift = gradientNoise(squashed + uTime * uCausticSpeed, uMovementScale);
  vec2 uv = squashed * uCausticScale - vec2(shift) * uMovementAmount;
  vec4 base = vec4(uCausticColor.rgb, uCausticColor.a * caustic(uv, 0.0));
  vec4 highlight = vec4(uHighlightColor.rgb, uHighlightColor.a * caustic(uv, 1.0));
  vec4 caustics = mix(base, highlight, highlight.a);
  caustics.a = clamp(caustics.a - gradientNoise(pos, uFaderScale) * uFaderMultiplier, 0.0, 1.0);

  float drift = uTime * uSpecularSpeed;
  float left = gradientNoise(pix + vec2(drift, 0.0), uSpecularScale);
  float right = gradientNoise(pix + vec2(-drift, 0.0), uSpecularScale);
  float sparkle = step(overlay(left, right) - gradientNoise(pix, uSpecularScale2), uSpecularThreshold);
  vec4 specular = vec4(uSpecularColor.rgb, uSpecularColor.a * sparkle);

  vec2 cell = floor(outWorld) + 0.5;
  float shore = shoreAt(cell);

  vec4 foam = vec4(uFoamColor.rgb, uFoamColor.a * caustic(pix * uFoamScale, 0.0) * info.g * step(0.999, shore));

  vec3 color = mix(depth, caustics.rgb, caustics.a);
  color = mix(color, specular.rgb, specular.a * ceil(caustics.a));
  color = mix(color, foam.rgb, foam.a);
  color = mix(color, uWakeColor, wake(floor(outWorld)));

  if (shore < 0.999) {
    vec2 tile = cell / 16.0;
    float field = beachField(cell, shore);

    float run = 0.5 - 0.5 * cos(uTime / uBeachPeriod * 6.2832);
    float line = uBeachEdge - uBeachRun * run;
    float crest = uBeachEdge - uBeachRun;

    if (field < line) {
      if (field < crest) {
        gl_FragColor = vec4(0.0);
        return;
      }

      float a = uBeachWetColor.a * mask;
      gl_FragColor = vec4(uBeachWetColor.rgb * a, a);
      return;
    }

    float depthBand = field - line + (gradientNoise(tile * 1.7 + 9.0, 1.0) - 0.5) * 2.0 * uBeachBandNoise;
    float alpha = depthBand < uBeachBands.x ? uBeachBandAlphas.x
      : depthBand < uBeachBands.y ? uBeachBandAlphas.y : 1.0;
    color = mix(color, uBeachShallowColor, (1.0 - alpha) * 0.8);

    float froth = gradientNoise(tile * uBeachFoamScale + vec2(uTime * 0.3, 0.0), 1.0);
    bool front = field - line < uBeachFoam * 3.0 && froth > uBeachFoamBreak
      && min(
        min(beachField(cell + vec2(1.0, 0.0), shoreAt(cell + vec2(1.0, 0.0))),
            beachField(cell - vec2(1.0, 0.0), shoreAt(cell - vec2(1.0, 0.0)))),
        min(beachField(cell + vec2(0.0, 1.0), shoreAt(cell + vec2(0.0, 1.0))),
            beachField(cell - vec2(0.0, 1.0), shoreAt(cell - vec2(0.0, 1.0))))
      ) < line;
    if (front) {
      color = uBeachFoamColor.rgb;
      alpha = uBeachFoamColor.a;
    }

    alpha *= mask;
    gl_FragColor = vec4(color * alpha, alpha);
    return;
  }

  gl_FragColor = vec4(color * mask, mask);
}
`;
