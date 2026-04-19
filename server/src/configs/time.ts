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
    },
    [TimePhase.DUSK]: {
      ambient: 0xccc0b0,
      lightIntensity: 0.6,
      coolness: 0.25,
      saturation: 0.85,
      contrast: 0.95,
      vignette: {
        strength: 0.2,
      },
    },
    [TimePhase.NIGHT]: {
      ambient: 0x3b4757,
      lightIntensity: 1.2,
      coolness: 0.4,
      saturation: 0.62,
      contrast: 0.83,
      vignette: {
        strength: 0.42,
      },
    },
  } satisfies Record<TimePhase, AmbienceConfig>,
};
