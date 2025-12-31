import { EntityName, StateName } from "./types";

export interface AnimationConfig {
  frameCount: number;
  frameRate: number;
  repeat: number;
}

export const ANIMATIONS: Record<
  string,
  Partial<Record<StateName, AnimationConfig>>
> = {
  [EntityName.PLAYER]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: -1,
    },
    [StateName.JUMPING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
    [StateName.CASTING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
  },
  [EntityName.ORC1]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 8,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: -1,
    },
    [StateName.SLASHING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
  },
};
