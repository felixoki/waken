import { WeaponConfig, WeaponName } from "@server/types";
import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";

type WeaponHandler = (
  entity: Entity,
  config: WeaponConfig,
  direction: { x: number; y: number },
) => void;

export const weapons: Record<WeaponName, WeaponHandler> = {
  [WeaponName.SLASH]: (
    entity: Entity,
    config: WeaponConfig,
    direction: { x: number; y: number },
  ) => {
    new Hitbox(
      entity.scene,
      entity.x + direction.x,
      entity.y + direction.y,
      config.hitbox?.width || 16,
      config.hitbox?.height || 16,
      entity.id,
      config,
    );
  },
};
