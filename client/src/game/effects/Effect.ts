import { EffectName } from "@server/types";

export abstract class Effect {
  abstract name: EffectName;
  public tint?: number;

  attach(): void {}
  detach(): void {}
}
