export enum EffectName {
  BURNING = "burning",
  WET = "wet",
  COLD = "cold",
  POISONED = "poisoned",
  ILLUMINATED = "illuminated",
}

export interface Effect {
  name: EffectName;
  expiresAt: number;
  lastTickAt?: number;
}
