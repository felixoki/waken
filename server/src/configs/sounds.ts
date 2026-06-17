import { AmbienceName, MusicName, SoundName } from "../types/sounds";

export const sounds = {
  sfx: {
    [SoundName.FOOTSTEP]: {
      volume: 0.25,
      folder: "footsteps",
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
    [SoundName.GOBLIN_IDLE]: {
      volume: 0.7,
      folder: "creatures",
      variants: [
        "goblin_idle1",
        "goblin_idle2",
        "goblin_idle3",
        "goblin_idle4",
        "goblin_idle5",
        "goblin_idle6",
        "goblin_idle7",
        "goblin_idle8",
        "goblin_idle9",
        "goblin_idle10",
      ],
    },
    [SoundName.GOBLIN_SLASH]: {
      volume: 0.7,
      folder: "creatures",
      variants: [
        "goblin_slash1",
        "goblin_slash2",
        "goblin_slash3",
        "goblin_slash4",
        "goblin_slash5",
        "goblin_slash6",
        "goblin_slash7",
        "goblin_slash8",
      ],
    },
    [SoundName.SLASH]: {
      volume: 0.8,
      folder: "spells",
      variants: ["slash1", "slash2", "slash3"],
    },

    [SoundName.SHARD_CHARGE]: {
      volume: 0.6,
      folder: "spells",
    },
    [SoundName.SHARD_HOLD]: {
      volume: 0.4,
      folder: "spells",
    },
    [SoundName.SHARD_LAUNCH]: {
      volume: 0.7,
      folder: "spells",
      variants: ["shard_launch1", "shard_launch2", "shard_launch3"],
    },
    [SoundName.SHARD_HIT]: {
      volume: 0.7,
      folder: "spells",
      variants: ["shard_hit1", "shard_hit2", "shard_hit3"],
    },

    [SoundName.ORC_IDLE]: {
      volume: 0.7,
      folder: "creatures",
      variants: ["orc_idle1"],
    },
    [SoundName.ORC_SLASH]: {
      volume: 0.7,
      folder: "creatures",
      variants: ["orc_slash1", "orc_slash2"],
    },
    [SoundName.SHADOW_WANDERER_IDLE]: {
      volume: 0.7,
      folder: "creatures",
      variants: ["shadow_wanderer_idle1"],
    },

    [SoundName.BOAR_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: ["boar_idle1", "boar_idle2"],
    },
    [SoundName.BOAR_SLASH]: {
      volume: 0.7,
      folder: "animals",
    },
    [SoundName.GOAT_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: [
        "goat_idle1",
        "goat_idle2",
        "goat_idle3",
        "goat_idle4",
        "goat_idle5",
      ],
    },
    [SoundName.DEER_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: ["deer_idle1", "deer_idle2"],
    },
    [SoundName.DUCK_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: ["duck_idle1", "duck_idle2", "duck_idle3", "duck_idle4"],
    },
    [SoundName.GOOSE_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: ["goose_idle1", "goose_idle2", "goose_idle3"],
    },
    [SoundName.GROUSE_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: ["grouse_idle1", "grouse_idle2"],
    },

    [SoundName.COLLECT]: {
      volume: 0.6,
      folder: "misc",
    },
    [SoundName.DOOR]: {
      volume: 0.6,
      folder: "misc",
    },
    [SoundName.DRINK]: {
      volume: 0.6,
      folder: "misc",
    },
    [SoundName.EQUIP]: {
      volume: 0.6,
      folder: "misc",
    },
    [SoundName.PICKUP]: {
      volume: 0.6,
      folder: "misc",
    },
    [SoundName.FIRE]: {
      volume: 0.2,
      folder: "misc",
    },
  },

  music: {
    [MusicName.SWEET_VILLAGE]: {
      volume: 0.3,
    },
  },

  ambience: {
    [AmbienceName.RAIN]: {
      volume: 0.4,
    },
  },
};
