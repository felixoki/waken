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

export enum AmbienceLayer {
  DAYCYCLE = "daycycle",
  WEATHER = "weather",
}

export interface MapAmbienceConfig {
  brightness?: number;
  coolness?: number;
  saturation?: number;
  contrast?: number;
  vignette?: { radius: number; strength: number };
  fog?: {
    color: [number, number, number];
    strength: number;
    speed: number;
    scale: number;
  };
  eclipse?: { radius: number; softness: number; strength: number };
}
