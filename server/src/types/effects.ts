export enum EffectName {
  BURNING = "burning",
  WET = "wet",
  COLD = "cold",
  POISONED = "poisoned",
  ILLUMINATED = "illuminated",
  REGAIN = "regain",
  DRAGON = "dragon",
}

export interface Effect {
  name: EffectName;
  expiresAt: number;
  lastTickAt?: number;
}
