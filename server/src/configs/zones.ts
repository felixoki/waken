import { DamageType } from "../types/damage.js";
import { TemporaryZoneName } from "../types/zones.js";

export interface ZoneDefinition {
  interactions?: Partial<Record<DamageType, number>>;
}

export const zones: Record<TemporaryZoneName, ZoneDefinition> = {
  [TemporaryZoneName.LIGHT]: { interactions: { [DamageType.ILLUMINATED]: 1.5 } },
};
