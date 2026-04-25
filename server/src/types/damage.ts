export enum DamageType {
  PHYSICAL = "physical",
  PIERCING = "piercing",
  BURNING = "burning",
  COLD = "cold",
  ILLUMINATED = "illuminated",
}

export interface Damage {
  type: DamageType;
  amount: number;
}
