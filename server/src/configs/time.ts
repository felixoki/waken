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
      ambient: 0x667788,
      lightIntensity: 1.2,
      coolness: 0.4,
      saturation: 0.7,
      contrast: 0.85,
      vignette: {
        strength: 0.35,
      },
    },
  } satisfies Record<TimePhase, AmbienceConfig>,
};
