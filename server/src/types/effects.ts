export enum EffectName {
  BURNING = "burning",
  WET = "wet",
  COLD = "cold",
  POISONED = "poisoned",
  ILLUMINATED = "illuminated",
  REGAIN = "regain",
  DRAGON = "dragon",
  MOMENTUM = "momentum",
  REFLECT = "reflect",
  SHIELD = "shield",
  GREASE = "grease",
}

export interface Effect {
  name: EffectName;
  expiresAt: number;
  lastTickAt?: number;
  ownerId: string;
  absorb?: number;
}
