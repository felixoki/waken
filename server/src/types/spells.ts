export enum SpellName {
  SHARD = "shard",
  SLASH = "slash",
  ILLUMINATE = "illuminate",
  HURT_SHADOWS = "hurt_shadows",
  METEOR_SHOWER = "meteor_shower",
}

export interface SpellConfig {
  name: SpellName;
  damage: number;
  knockback: number;
  speed?: number;
  range?: number;
  duration?: number;
  radius?: number;
  hitbox?: {
    width: number;
    height: number;
  };
}
