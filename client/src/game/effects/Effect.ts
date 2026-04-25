import { EffectName } from "@server/types";

export abstract class Effect {
  abstract name: EffectName;

  attach(): void {}
  update(): void {}
  detach(): void {}
}
