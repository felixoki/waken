export const getIlluminateFrag = (): string => `
precision mediump float;

uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

void main(void) {
  vec4 color = texture2D(uMainSampler, outTexCoord);
  
  // Just brighten everything by 30%
  vec3 lit = color.rgb * 1.3;
  
  gl_FragColor = vec4(lit, color.a);
}
`;
