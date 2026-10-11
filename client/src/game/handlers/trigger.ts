import {
  ComponentName,
  EntityName,
  Event,
  Trigger,
  TriggerName,
} from "@server/types";
import { configs } from "@server/configs";
import { Entity } from "../Entity";
import { InventoryComponent } from "../components/Inventory";
import { vfx } from "../vfx";

const DRAIN_LIFE = [0xff5a6e, 0xe0243f, 0x7a0f24];
const DRAIN_MANA = [0xd9a8ff, 0x9a4dff, 0x4a1a8c];

export const trigger = {
  resolve: (entity: Entity, on: TriggerName): Trigger[] => {
    const triggers: Trigger[] = [];
    const items = entity
      .getComponent<InventoryComponent>(ComponentName.INVENTORY)
      ?.get();

    if (!items) return triggers;

    for (const item of items) {
      const config = item && configs.entities[item.name]?.trigger;
      if (config && config.on === on) triggers.push(config);
    }

    return triggers;
  },

  fire: (
    entity: Entity,
    config: Trigger,
    x: number,
    y: number,
    struck?: Set<string>,
  ) => {
    const reach = config.radius * config.radius;

    for (const target of entity.scene.managers.entities.entities.values()) {
      if (struck?.has(target.id)) continue;
      if (target.health <= 0 || target.tame.isTamed) continue;
      if (!target.hasComponent(ComponentName.DAMAGEABLE)) continue;
      if (!configs.entities[target.name]?.attacks?.length) continue;

      const dx = target.x - x;
      const dy = target.y - y;

      if (dx * dx + dy * dy > reach) continue;

      struck?.add(target.id);

      entity.scene.game.events.emit(Event.HIT, {
        config,
        attackerId: entity.id,
        targetId: target.id,
      });

      trigger.show(config.name, entity, target);
    }
  },

  show: (name: EntityName, attacker: Entity, target: Entity) => {
    if (name === EntityName.WOOL_SOCK)
      vfx.emitters.spark(
        attacker.scene,
        attacker.x,
        attacker.y,
        target.x,
        target.y,
      );
    else if (name === EntityName.AMULET3)
      vfx.emitters.drain(
        target.scene,
        target.x,
        target.y,
        attacker,
        DRAIN_LIFE,
      );
  },

  reap: (entity: Entity, x: number, y: number) => {
    vfx.emitters.drain(entity.scene, x, y, entity, DRAIN_MANA);
  },

  echo: (target: Entity, name: EntityName, attackerId: string) => {
    const attacker = target.scene.managers.players.others.get(attackerId);
    if (attacker) trigger.show(name, attacker, target);
  },
};
