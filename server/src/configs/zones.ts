import { DamageType } from "../types/damage.js";
import { ZoneName } from "../types/zones.js";

export interface ZoneDefinition {
  interactions?: Partial<Record<DamageType, number>>;
}

export const zones: Record<ZoneName, ZoneDefinition> = {
  [ZoneName.LIGHT]: { interactions: { [DamageType.ILLUMINATED]: 1.5 } },
};
