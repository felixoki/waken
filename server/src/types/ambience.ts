export interface AmbienceConfig {
  ambient: number;
  lightIntensity: number;
  coolness: number;
  saturation: number;
  contrast: number;
  vignette: {
    strength: number;
  };
  sun: {
    color: number;
    intensity: number;
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
  LIGHTNING = "lightning",
}

export enum WeatherName {
  CLEAR = "clear",
  CLOUDY = "cloudy",
  RAIN = "rain",
  STORM = "storm",
}

export interface WeatherState {
  current: WeatherName;
  remaining: number;
  lightning: number;
  soaked: number;
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
