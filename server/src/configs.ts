import { StateName } from "./types";

export interface AnimationConfig {
  frameCount: number;
  frameRate: number;
  repeat: number;
}

export enum EntityName {
  PLAYER = "player",
}

export const ANIMATIONS: Record<string, Record<StateName, AnimationConfig>> = {
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
      frameRate: 15,
      repeat: -1,
    },
    [StateName.JUMPING]: {
      frameCount: 6,
      frameRate: 12,
      repeat: 0,
    },
    [StateName.SLASHING]: {
      frameCount: 5,
      frameRate: 10,
      repeat: 0,
    },
  },
};
