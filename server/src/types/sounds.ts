export enum SoundName {
  FOOTSTEP = "footstep",
  FOOTSTEP_SNOW = "footstep_snow",
  FOOTSTEP_GRASS = "footstep_grass",
  FOOTSTEP_STONE = "footstep_stone",
  HIT = "hit",
  JUMP = "jump",
  LAND = "land",
  GOBLIN_IDLE = "goblin_idle",
  GOBLIN_SLASH = "goblin_slash",
  ORC_IDLE = "orc_idle",
  ORC_SLASH = "orc_slash",
  TROLL_IDLE = "troll_idle",
  TROLL_SLASH = "troll_slash",
  SHADOW_WANDERER_IDLE = "shadow_wanderer_idle",
  BLOODGEIST_HIT = "bloodgeist_hit",
  SLASH = "slash",
  SWORD_SWING = "sword_swing",
  DAGGER_SWING = "dagger_swing",
  SHARD_CHARGE = "shard_charge",
  SHARD_HOLD = "shard_hold",
  SHARD_LAUNCH = "shard_launch",
  SHARD_HIT = "shard_hit",
  BLINK = "blink",
  FIRE_BREATH = "fire_breath",
  HURT_SHADOWS = "hurt_shadows",
  LIGHTNING_STRIKE = "lightning_strike",
  METEOR = "meteor",
  SHIELD = "shield",
  BEAR_IDLE = "bear_idle",
  BEAR_SLASH = "bear_slash",
  BOAR_IDLE = "boar_idle",
  BOAR_SLASH = "boar_slash",
  WOLF_IDLE = "wolf_idle",
  WOLF_SLASH = "wolf_slash",
  WOLF_WARNING = "wolf_warning",
  COW_IDLE = "cow_idle",
  GOAT_IDLE = "goat_idle",
  DEER_IDLE = "deer_idle",
  DUCK_IDLE = "duck_idle",
  DOG_IDLE = "dog_idle",
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
  TREE_FALL = "tree_fall",
  FISHING_CAST = "fishing_cast",
  FISHING_BITE = "fishing_bite",
  FISHING_REEL = "fishing_reel",
  FISHING_SPLASH = "fishing_splash",
  MINE = "mine",
  WOOD_BREAK = "wood_break",
  VASES_BREAK = "vases_break",
  REVIVE = "revive",
  GAIN_MOMENTUM = "gain_momentum",
  REFLECT_DAMAGE = "reflect_damage",
  HEAL_PARTY = "heal_party",
  ILLUMINATE = "illuminate",
  GREASE = "grease",
  GRASP = "grasp",
  ABSORB_LIFE = "absorb_life",
  FIRE_WAVE = "fire_wave",
  CATCH_SOUL = "catch_soul",
  PEOPLE = "people",
}

export enum MusicName {
  SWEET_VILLAGE = "sweet_village",
  BRAIDED_LIGHTS = "braided_lights",
  AFTER_RAIN = "after_rain",
  INTO_THE_MIST = "into_the_mist",
  AT_DAYBREAK = "at_daybreak",
  THE_DEPTHS = "the_depths",
}

export enum AmbienceName {
  RAIN = "rain",
  STORM = "storm",
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
