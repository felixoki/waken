export enum SoundName {
  FOOTSTEP = "footstep",
  GOBLIN = "goblin",
  SHARD = "shard",
  SLASH = "slash",
}

export enum MusicName {
  OBLIVION = "oblivion",
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
  variants?: string[];
}

export interface AudioConfig {
  volume: number;
}
