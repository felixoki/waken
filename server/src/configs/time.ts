import { AmbienceConfig, TimePhase } from "../types";

export const time = {
  phases: {
    [TimePhase.DAWN]: {
      ambient: 0xd9cfc8,
      lightIntensity: 0.4,
      coolness: 0.15,
      saturation: 0.9,
      contrast: 0.95,
      vignette: {
        strength: 0.15,
      },
      sun: { color: 0xffd9c4, intensity: 1.0 },
    },
    [TimePhase.DAY]: {
      ambient: 0xffffff,
      lightIntensity: 0.2,
      coolness: 0.1,
      saturation: 1.0,
      contrast: 1.0,
      vignette: {
        strength: 0.1,
      },
      sun: { color: 0xfffaf0, intensity: 0.65 },
    },
    [TimePhase.DUSK]: {
      ambient: 0xd0c7bc,
      lightIntensity: 0.6,
      coolness: 0.25,
      saturation: 0.85,
      contrast: 0.95,
      vignette: {
        strength: 0.2,
      },
      sun: { color: 0xffc793, intensity: 1.0 },
    },
    [TimePhase.NIGHT]: {
      ambient: 0x4a566c,
      depth: 0x2c3546,
      lightIntensity: 1.2,
      coolness: 0.4,
      saturation: 0.8,
      contrast: 1.0,
      vignette: {
        strength: 0,
      },
      sun: { color: 0xc2d4ff, intensity: 0.0 },
    },
  } satisfies Record<TimePhase, AmbienceConfig>,
};
