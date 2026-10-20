import {
  LIGHT_ANGLES,
  LIGHT_BIAS,
  LIGHT_FACE,
  LIGHT_OFFSET,
  LIGHT_SOFTNESS,
  LIGHT_SURFACE,
} from "@server/globals";

export const getLightFrag = (): string => `
#define SHADER_NAME WAKEN_LIGHT_FS
precision highp float;

struct Light {
  vec2 position;
  vec3 color;
  float intensity;
  float radius;
};

const int kMaxLights = %LIGHT_COUNT%;
const float kAngles = ${LIGHT_ANGLES}.0;
const float kSoftness = ${LIGHT_SOFTNESS};
const float kBias = ${LIGHT_BIAS};
const float kFace = ${LIGHT_FACE}.0;
const float kOffset = ${LIGHT_OFFSET}.0;
const float kSurface = ${LIGHT_SURFACE}.0;
const float kPi = 3.14159265359;
const float kTau = 6.28318530718;

uniform vec4 uCamera;
uniform vec2 uResolution;
uniform sampler2D uMainSampler;
uniform sampler2D uNormSampler;
uniform vec3 uAmbientLightColor;
uniform Light uLights[kMaxLights];
uniform mat3 uInverseRotationMatrix;
uniform int uLightCount;

uniform sampler2D uOccluder;
uniform sampler2D uShadows;
uniform float uOcclusion;
uniform float uBoost;
uniform vec2 uView;
uniform float uViewHeight;
uniform vec2 uWorld;
uniform vec2 uOrigins[kMaxLights];
uniform float uReach[kMaxLights];

varying vec2 outTexCoord;
varying float outTintEffect;
varying vec4 outTint;

vec2 toWorld(vec2 frag) {
  return uView + vec2(frag.x, uViewHeight - frag.y) / uCamera.w;
}

vec3 ground(vec2 p) {
  vec2 pixel = floor(p);
  vec4 m = texture2D(uOccluder, (pixel + 0.5) / uWorld);
  float drop = floor(m.g * 255.0 + 0.5);

  if (drop > 0.5 && drop <= kFace) return vec3(p.x, pixel.y + drop + 0.5 + kOffset, 0.0);

  return vec3(p, m.r > 0.5 ? kSurface : 0.0);
}

float hit(float index, float row, float reach) {
  vec2 uv = vec2((mod(index, kAngles) + 0.5) / kAngles, (row + 0.5) / float(kMaxLights));
  vec4 s = texture2D(uShadows, uv);

  return (s.r * 65280.0 + s.g * 255.0) / 65535.0 * reach;
}

float shade(vec2 origin, float reach, float row, vec3 point) {
  vec2 p = point.xy;
  vec2 d = p - origin;
  float dist = length(d);
  float index = (atan(d.y, d.x) + kPi) / kTau * kAngles - 0.5;
  float spread = kSoftness / kTau * kAngles / 6.0;
  float lit = 0.0;

  for (int k = -3; k <= 3; k++) {
    float at = index + float(k) * spread;
    float base = floor(at);
    float a = step(dist, hit(base, row, reach) + kBias + point.z);
    float b = step(dist, hit(base + 1.0, row, reach) + kBias + point.z);
    lit += mix(a, b, at - base);
  }

  return lit / 7.0;
}

void main() {
  vec3 finalColor = vec3(0.0);
  vec4 texel = vec4(outTint.bgr * outTint.a, outTint.a);
  vec4 texture = texture2D(uMainSampler, outTexCoord);
  vec4 color = texture * texel;

  if (outTintEffect == 1.0) color.rgb = mix(texture.rgb, outTint.bgr * outTint.a, texture.a);
  else if (outTintEffect == 2.0) color = texel;

  vec3 normalMap = texture2D(uNormSampler, outTexCoord).rgb;
  vec3 normal = normalize(uInverseRotationMatrix * vec3(normalMap * 2.0 - 1.0));
  vec2 res = vec2(min(uResolution.x, uResolution.y)) * uCamera.w;
  vec2 world = toWorld(gl_FragCoord.xy);
  vec3 standing = uOcclusion > 0.5 ? ground(world) : vec3(world, 0.0);

  for (int index = 0; index < kMaxLights; ++index) {
    if (index >= uLightCount) break;

    Light light = uLights[index];
    vec3 lightDir = vec3((light.position / res) - (gl_FragCoord.xy / res), 0.1);
    float distToSurf = length(lightDir) * uCamera.w;
    float radius = (light.radius / res.x * uCamera.w) * uCamera.w;
    float attenuation = clamp(1.0 - distToSurf * distToSurf / (radius * radius), 0.0, 1.0);

    if (attenuation <= 0.0 || light.intensity <= 0.0) continue;
    if (uOcclusion > 0.5) attenuation *= shade(uOrigins[index], uReach[index], float(index), standing);

    float diffuseFactor = max(dot(normal, normalize(lightDir)), 0.0);
    vec3 contribution = attenuation * light.color * diffuseFactor * light.intensity * uBoost;
    finalColor += contribution - min(finalColor, vec3(1.0)) * min(contribution, vec3(1.0));
  }

  gl_FragColor = color * vec4(uAmbientLightColor + finalColor, 1.0);
}
`;
