export enum EffectName {
  BURNING = "burning",
  WET = "wet",
  COLD = "cold",
  POISONED = "poisoned",
  ILLUMINATED = "illuminated",
  REGAIN = "regain",
}

export interface Effect {
  name: EffectName;
  expiresAt: number;
  lastTickAt?: number;
}
