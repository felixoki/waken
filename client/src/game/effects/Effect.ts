import { EffectName } from "@server/types";

export abstract class Effect {
  abstract name: EffectName;

  attach(): void {}
  detach(): void {}
}
