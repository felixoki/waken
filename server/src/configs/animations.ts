import { AnimationConfig, EntityName, StateName } from "../types";

export const animations: Partial<
  Record<EntityName, Partial<Record<StateName, AnimationConfig>>>
> = {
  [EntityName.PLAYER]: {
    [StateName.IDLE]: {
      frameCount: 8,
      frameRate: 10,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 8,
      frameRate: 10,
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
    [StateName.ROLLING]: {
      frameCount: 8,
      frameRate: 10,
      repeat: 0,
    },
  },
  [EntityName.HERBALIST]: {
    [StateName.IDLE]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 8,
      repeat: -1,
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
  [EntityName.DRAKE]: {
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
  },
  [EntityName.DUCK]: {
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
  },
  [EntityName.FOX]: {
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
      frameCount: 6,
      frameRate: 8,
      repeat: -1,
    },
  },
  [EntityName.DEER]: {
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
      frameCount: 6,
      frameRate: 8,
      repeat: -1,
    },
  },
  [EntityName.BOAR]: {
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
      frameCount: 5,
      frameRate: 7,
      repeat: -1,
    },
    [StateName.SLASHING]: {
      frameCount: 5,
      frameRate: 7,
      repeat: -1,
    },
  },
};
