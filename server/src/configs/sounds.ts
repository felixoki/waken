import { AmbienceName, MusicName, SoundName } from "../types/sounds";

export const sounds = {
  sfx: {
    [SoundName.RUSTLE]: {
      volume: 0.1,
      folder: "misc",
      variants: [
        "rustle1",
        "rustle2",
        "rustle3",
        "rustle4",
        "rustle5",
        "rustle6",
        "rustle7",
        "rustle8",
        "rustle9",
        "rustle10",
        "rustle11",
        "rustle12",
        "rustle13",
        "rustle14",
        "rustle15",
        "rustle16",
        "rustle17",
        "rustle18",
        "rustle19",
        "rustle20",
      ],
    },
    [SoundName.SOW]: {
      volume: 0.15,
      folder: "misc",
    },
    [SoundName.WATER]: {
      volume: 0.15,
      folder: "misc",
      variants: ["watering"],
    },
    [SoundName.CHOP]: {
      volume: 1,
      folder: "misc",
      variants: ["chop"],
    },
    [SoundName.MINE]: {
      volume: 0.5,
      folder: "misc",
      variants: ["mine"],
    },
    [SoundName.FOOTSTEP]: {
      volume: 0.1,
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
    [SoundName.REVIVE]: {
      volume: 2,
      folder: "spells",
      variants: ["revive1", "revive2"],
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

    [SoundName.BLINK]: {
      volume: 0.6,
      folder: "spells",
    },
    [SoundName.FIRE_BREATH]: {
      volume: 0.6,
      folder: "spells",
      variants: ["breath_fire1", "breath_fire2", "breath_fire3"],
    },
    [SoundName.HURT_SHADOWS]: {
      volume: 0.7,
      folder: "spells",
    },
    [SoundName.LIGHTNING_STRIKE]: {
      volume: 0.7,
      folder: "spells",
    },
    [SoundName.SHIELD]: {
      volume: 0.7,
      folder: "spells",
    },

    [SoundName.ORC_IDLE]: {
      volume: 0.5,
      folder: "creatures",
      variants: ["orc_idle1"],
    },
    [SoundName.ORC_SLASH]: {
      volume: 0.5,
      folder: "creatures",
      variants: ["orc_slash1", "orc_slash2"],
    },
    [SoundName.SHADOW_WANDERER_IDLE]: {
      volume: 0.7,
      folder: "creatures",
      variants: ["shadow_wanderer_idle1"],
    },
    [SoundName.BEAR_IDLE]: {
      volume: 0.5,
      folder: "animals",
    },
    [SoundName.BEAR_SLASH]: {
      volume: 0.5,
      folder: "animals",
    },
    [SoundName.BOAR_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: ["boar_idle1", "boar_idle2"],
    },
    [SoundName.BOAR_SLASH]: {
      volume: 0.5,
      folder: "animals",
    },
    [SoundName.CHICKEN_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: [
        "chicken_idle1",
        "chicken_idle2",
        "chicken_idle3",
        "chicken_idle4",
      ],
    },
    [SoundName.COW_IDLE]: {
      volume: 0.5,
      folder: "animals",
      variants: ["cow_idle1", "cow_idle2", "cow_idle3", "cow_idle4"],
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
    [SoundName.COLLECT]: { volume: 0.6, folder: "misc" },
    [SoundName.DOOR]: { volume: 0.6, folder: "misc" },
    [SoundName.DRINK]: { volume: 0.6, folder: "misc" },
    [SoundName.EQUIP]: { volume: 0.1, folder: "misc" },
    [SoundName.GRAB]: { volume: 0.05, folder: "misc" },
    [SoundName.PICKUP]: { volume: 0.5, folder: "misc", variants: ["pop"] },
    [SoundName.FIRE]: { volume: 0.05, folder: "misc" },
  },

  music: {
    [MusicName.SWEET_VILLAGE]: { volume: 0.5 },
    [MusicName.AFTER_RAIN]: { volume: 0.5 },
    [MusicName.INTO_THE_MIST]: { volume: 0.5 },
    [MusicName.AT_DAYBREAK]: { volume: 0.5 },
    [MusicName.THE_DEPTHS]: { volume: 0.5 },
  },

  ambience: {
    [AmbienceName.RAIN]: { volume: 0.05 },
    [AmbienceName.BIRDS]: {
      volume: 0.1,
      variants: ["birds1", "birds2", "birds3"],
    },
    [AmbienceName.CANALS]: { volume: 1.2 },
  },
};
