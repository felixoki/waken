import { configs } from "../configs";
import { DAY, MAX_STACK } from "../globals";
import { ConverterConfig, EntityName, Item, TimeState } from "../types";

type Slots = (Item | null)[];

export const converter = {
  clock: (time: TimeState): number => time.days * DAY + time.current,

  count: (slots: Slots, name: EntityName): number =>
    slots.reduce(
      (sum, slot) => sum + (slot?.name === name && !slot.soul ? slot.quantity : 0),
      0,
    ),

  amount: (slots: Slots, config: ConverterConfig): number =>
    config.inputs.reduce(
      (sum, input) => sum + converter.count(slots, input.item),
      0,
    ),

  ready: (at: number, now: number, config: ConverterConfig): boolean =>
    now - at >= config.days * DAY,

  convert: (slots: Slots, config: ConverterConfig): Slots => {
    const batches = Math.min(
      ...config.inputs.map((input) =>
        Math.floor(converter.count(slots, input.item) / input.quantity),
      ),
    );
    if (batches <= 0) return slots;

    let result = slots.map((slot) => (slot ? { ...slot } : null));

    for (const input of config.inputs)
      result = converter.remove(result, input.item, input.quantity * batches);

    return converter.add(
      result,
      config.output.item,
      config.output.quantity * batches,
    );
  },

  remove: (slots: Slots, name: EntityName, quantity: number): Slots => {
    let remaining = quantity;

    return slots.map((slot) => {
      if (!slot || slot.name !== name || slot.soul || remaining <= 0) return slot;

      const taken = Math.min(slot.quantity, remaining);
      remaining -= taken;

      return slot.quantity === taken
        ? null
        : { ...slot, quantity: slot.quantity - taken };
    });
  },

  add: (slots: Slots, name: EntityName, quantity: number): Slots => {
    const stackable = configs.entities[name]?.metadata?.stackable ?? false;
    const result = [...slots];
    let remaining = quantity;

    if (stackable)
      for (let i = 0; i < result.length && remaining > 0; i++) {
        const slot = result[i];
        if (!slot || slot.name !== name || slot.soul) continue;

        const added = Math.min(MAX_STACK - slot.quantity, remaining);
        result[i] = { ...slot, quantity: slot.quantity + added };
        remaining -= added;
      }

    for (let i = 0; i < result.length && remaining > 0; i++) {
      if (result[i]) continue;

      const added = stackable ? Math.min(MAX_STACK, remaining) : 1;
      result[i] = { name, quantity: added, stackable };
      remaining -= added;
    }

    return result;
  },
};
