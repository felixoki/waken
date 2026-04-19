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
      frameRate: 16,
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
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.GLASSBLOWER]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
  },
  [EntityName.GREENGROCER]: {
    [StateName.IDLE]: {
      frameCount: 9,
      frameRate: 9,
      repeat: -1,
    },
  },
  [EntityName.BLACKSMITH]: {
    [StateName.IDLE]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.ORC1]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 8,
      repeat: -1,
    },
    [StateName.SLASHING]: {
      frameCount: 8,
      frameRate: 8,
      repeat: 0,
    },
  },
  [EntityName.GOBLIN1]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 8,
      frameRate: 8,
      repeat: -1,
    },
    [StateName.SLASHING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: 0,
    },
  },
  [EntityName.SHADOW_WANDERER]: {
    [StateName.IDLE]: {
      frameCount: 6,
      frameRate: 8,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 4,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.DASHING]: {
      frameCount: 5,
      frameRate: 7,
      repeat: 0,
    },
    [StateName.CASTING]: {
      frameCount: 6,
      frameRate: 8,
      repeat: 0,
    },
  },
  [EntityName.DRAKE]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.DUCK]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.GOOSE]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.FOX]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.DEER]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.BOAR]: {
    [StateName.IDLE]: {
      frameCount: 4,
      frameRate: 4,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
    [StateName.RUNNING]: {
      frameCount: 5,
      frameRate: 5,
      repeat: -1,
    },
    [StateName.SLASHING]: {
      frameCount: 5,
      frameRate: 5,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN1]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN2]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN3]: {
    [StateName.IDLE]: {
      frameCount: 10,
      frameRate: 10,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN4]: {
    [StateName.IDLE]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN5]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN6]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN7]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN8]: {
    [StateName.IDLE]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    }
  },
  [EntityName.CITIZEN9]: {
    [StateName.IDLE]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    }
  },
  [EntityName.CITIZEN10]: {
    [StateName.IDLE]: {
      frameCount: 8,
      frameRate: 8,
      repeat: -1,
    }
  },
  [EntityName.CITIZEN11]: {
    [StateName.IDLE]: {
      frameCount: 7,
      frameRate: 7,
      repeat: -1,
    }
  },
  [EntityName.CITIZEN12]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.CITIZEN13]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
    [StateName.WALKING]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.HOST]: {
    [StateName.IDLE]: {
      frameCount: 6,
      frameRate: 6,
      repeat: -1,
    },
  },
  [EntityName.BAKER]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
  },
  [EntityName.BEVERAGE_SALER]: {
    [StateName.IDLE]: {
      frameCount: 12,
      frameRate: 12,
      repeat: -1,
    },
  },
};
