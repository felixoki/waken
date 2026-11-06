import {
  ComponentName,
  Effect as ActiveEffect,
  EffectName,
  Event,
} from "@server/types";
import type { Entity } from "../Entity";
import type { InventoryComponent } from "../components/Inventory";
import { EffectFactory } from "../factory/Effect";
import EventBus from "../EventBus";
import { move } from "./move";

const local = (entity: Entity): boolean =>
  "isControllable" in entity && entity.isControllable === true;

const refresh = (entity: Entity): void => {
  const inventory = entity.getComponent<InventoryComponent>(
    ComponentName.INVENTORY,
  );

  if (inventory)
    entity.speed = move.speed(inventory.get(), entity.effects.keys());
};

export const effects = {
  apply: (entity: Entity, effect: ActiveEffect): void => {
    if (!entity.scene) return;

    entity.addEffect(EffectFactory.create(effect.name, entity));

    if (!local(entity)) return;

    refresh(entity);
    EventBus.emit(Event.EFFECT_APPLY, effect);
  },

  remove: (entity: Entity, name: EffectName): void => {
    entity.removeEffect(name);

    if (!local(entity)) return;

    refresh(entity);
    EventBus.emit(Event.EFFECT_REMOVE, name);
  },

  sync: (entity: Entity, active: ActiveEffect[] | undefined): void => {
    const list = active ?? [];

    for (const name of [...entity.effects.keys()])
      if (!list.some((effect) => effect.name === name))
        effects.remove(entity, name);

    for (const effect of list)
      if (!entity.hasEffect(effect.name)) effects.apply(entity, effect);
  },
};
