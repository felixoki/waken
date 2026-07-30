export enum SoundName {
  FOOTSTEP = "footstep",
  GOBLIN_IDLE = "goblin_idle",
  GOBLIN_SLASH = "goblin_slash",
  ORC_IDLE = "orc_idle",
  ORC_SLASH = "orc_slash",
  SHADOW_WANDERER_IDLE = "shadow_wanderer_idle",
  SLASH = "slash",
  SHARD_CHARGE = "shard_charge",
  SHARD_HOLD = "shard_hold",
  SHARD_LAUNCH = "shard_launch",
  SHARD_HIT = "shard_hit",
  BLINK = "blink",
  FIRE_BREATH = "fire_breath",
  HURT_SHADOWS = "hurt_shadows",
  LIGHTNING_STRIKE = "lightning_strike",
  SHIELD = "shield",
  BEAR_IDLE = "bear_idle",
  BEAR_SLASH = "bear_slash",
  BOAR_IDLE = "boar_idle",
  BOAR_SLASH = "boar_slash",
  COW_IDLE = "cow_idle",
  GOAT_IDLE = "goat_idle",
  DEER_IDLE = "deer_idle",
  DUCK_IDLE = "duck_idle",
  GOOSE_IDLE = "goose_idle",
  GROUSE_IDLE = "grouse_idle",
  CHICKEN_IDLE = "chicken_idle",
  COLLECT = "collect",
  DOOR = "door",
  DRINK = "drink",
  EQUIP = "equip",
  GRAB = "grab",
  PICKUP = "pickup",
  FIRE = "fire",
  RUSTLE = "rustle",
  SOW = "sow",
  WATER = "water",
  CHOP = "chop",
  MINE = "mine",
  REVIVE = "revive",
}

export enum MusicName {
  SWEET_VILLAGE = "sweet_village",
  AFTER_RAIN = "after_rain",
  INTO_THE_MIST = "into_the_mist",
  AT_DAYBREAK = "at_daybreak",
  THE_DEPTHS = "the_depths",
}

export enum AmbienceName {
  RAIN = "rain",
  BIRDS = "birds",
  CANALS = "canals",
}

export enum AmbienceDomain {
  MAP = "map",
  WEATHER = "weather",
}

export enum ChannelName {
  SFX = "sfx",
  MUSIC = "music",
  AMBIENCE = "ambience",
}

export interface SoundConfig {
  music?: MusicName[];
  ambience?: AmbienceName[];
}

export interface SfxConfig {
  volume: number;
  folder: string;
  variants?: string[];
}

export interface AmbientSoundConfig {
  name: SoundName;
  interval?: [number, number];
  loop?: boolean;
}

export interface AudioConfig {
  volume: number;
  variants?: string[];
}
