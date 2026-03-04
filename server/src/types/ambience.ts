export interface AmbienceConfig {
  ambient: number;
  lightIntensity: number;
  coolness: number;
  saturation: number;
  contrast: number;
  vignette: {
    strength: number;
  };
}

export interface LightConfig {
  radius: number;
  intensity: number;
  color: number;
}
