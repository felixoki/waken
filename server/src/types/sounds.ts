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
  BOAR_IDLE = "boar_idle",
  BOAR_SLASH = "boar_slash",
  GOAT_IDLE = "goat_idle",
  DEER_IDLE = "deer_idle",
  DUCK_IDLE = "duck_idle",
  GOOSE_IDLE = "goose_idle",
  GROUSE_IDLE = "grouse_idle",
  COLLECT = "collect",
  DOOR = "door",
  DRINK = "drink",
  EQUIP = "equip",
  PICKUP = "pickup",
  FIRE = "fire",
}

export enum MusicName {
  SWEET_VILLAGE = "sweet_village",
}

export enum AmbienceName {
  RAIN = "rain",
}

export enum ChannelName {
  SFX = "sfx",
  MUSIC = "music",
  AMBIENCE = "ambience",
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
}
