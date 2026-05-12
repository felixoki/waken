import { AmbienceName, MusicName, SoundName } from "../types/sounds";

export const sounds = {
  sfx: {
    [SoundName.FOOTSTEP]: {
      volume: 0.5,
      variants: [
        "stepdirt1",
        "stepdirt2",
        "stepdirt3",
        "stepdirt4",
        "stepdirt5",
        "stepdirt6",
        "stepdirt7",
        "stepdirt8",
      ],
    },
    [SoundName.GOBLIN]: {
      volume: 0.7,
      variants: [
        "goblin1",
        "goblin2",
        "goblin3",
        "goblin4",
        "goblin5",
        "goblin6",
        "goblin7",
        "goblin8",
        "goblin9",
        "goblin10",
        "goblin11",
        "goblin12",
        "goblin13",
        "goblin14",
        "goblin15",
        "goblin16",
        "goblin17",
        "goblin18",
      ],
    },
    [SoundName.SHARD]: {
      volume: 0.6,
    },
    [SoundName.SLASH]: {
      volume: 0.8,
      variants: ["slash1", "slash2", "slash3"],
    },
  },

  music: {
    [MusicName.OBLIVION]: {
      volume: 0.3,
    },
  },

  ambience: {
    [AmbienceName.RAIN]: {
      volume: 0.4,
    },
  },
};
