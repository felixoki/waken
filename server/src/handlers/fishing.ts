import { Server, Socket } from "socket.io";
import {
  ChoiceId,
  ComponentName,
  DialogueChoice,
  EntityName,
  Event,
  FishName,
  Item,
  NodeId,
  ZoneName,
} from "../types";
import { FISHING_LANDING_DISTANCE } from "../globals.js";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs";

const names = Object.values(FishName) as string[];

const label = (name: EntityName) =>
  configs.entities[name]?.metadata?.displayName ?? name;

export const fishing = {
  isFish: (name: EntityName | string): boolean =>
    names.includes(name as string),

  toFishName: (name: EntityName | string): FishName | null =>
    fishing.isFish(name) ? (name as unknown as FishName) : null,

  toEntityName: (name: FishName): EntityName => name as unknown as EntityName,

  catch: (
    data: {
      name: EntityName;
      x: number;
      y: number;
      originX: number;
      originY: number;
      weight?: number;
    },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const species = fishing.toFishName(data.name);
    if (!species) return;

    const dx = data.x - player.x;
    const dy = data.y - player.y;

    if (Math.sqrt(dx * dx + dy * dy) > FISHING_LANDING_DISTANCE) return;

    const zone = world.entities.getByMap(player.map).find((entity) => {
      if (entity.zone?.type !== ZoneName.FISH) return false;

      const { width, height } = entity.zone;

      return (
        Math.abs(data.originX - entity.x) <= width / 2 &&
        Math.abs(data.originY - entity.y) <= height / 2
      );
    });

    if (!zone || !(zone.zone!.fish as string[] | undefined)?.includes(data.name))
      return;

    const { min, max } = configs.fish[species].weight;
    const weight =
      Math.round(Math.min(max, Math.max(min, Number(data.weight) || min)) * 10) /
      10;

    const party = world.parties.getByPlayerId(player.id);
    const partyId = configs.maps[player.map].isInstanced ? party?.id : undefined;

    handlers.entity.create(
      {
        name: data.name,
        map: player.map,
        x: data.x,
        y: data.y,
        health: 1,
        maxHealth: 1,
        isLocked: false,
        weight,
      },
      socket,
      io,
      world,
      partyId,
    );
  },

  turnIn: (
    data: { entityId: string; action?: "give" | "records" },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const entity = world.entities.get(data.entityId);
    const collector = entity
      ? configs.entities[entity.name]?.components.find(
          (component) => component.name === ComponentName.COLLECTOR,
        )
      : undefined;

    const accepts =
      collector?.name === ComponentName.COLLECTOR
        ? collector.config.accepts
        : [];

    const takes = (name: EntityName) =>
      fishing.isFish(name) && accepts.includes(name);

    const records = { ...(player.records ?? {}) };
    const respond = (text: string) => {
      const goodbye = handlers.dialogue.resolve.choice({
        ref: ChoiceId.GOODBYE,
      });

      const choices: DialogueChoice[] = [
        { text: "Anything else?", next: NodeId.GREETING },
        ...(goodbye ? [goodbye] : []),
      ];

      socket.emit(Event.ENTITY_DIALOGUE_RESPONSE, {
        entityId: data.entityId,
        nodeId: NodeId.GREETING,
        text,
        choices,
      });
    };

    if (data.action === "records") {
      const lines = (Object.values(FishName) as FishName[])
        .map((name) => {
          const best = records[name];
          return best
            ? `${label(fishing.toEntityName(name))} at ${best.toFixed(1)} kg`
            : `${label(fishing.toEntityName(name))}, nothing yet`;
        })
        .join("\n");

      respond(`Let's see what you've landed.\n\n${lines}`);
      return;
    }

    const caught = player.inventory.filter(
      (slot): slot is Item => !!slot && takes(slot.name),
    );

    if (!caught.length) {
      respond("You've nothing in the creel. Come back with a catch.");
      return;
    }

    const best = new Map<FishName, number>();

    for (const item of caught) {
      const name = fishing.toFishName(item.name);
      if (!name) continue;

      const weight = item.weight ?? 0;
      if (weight > (best.get(name) ?? 0)) best.set(name, weight);
    }

    const awarded: EntityName[] = [];
    const beaten: string[] = [];

    for (const [name, weight] of best) {
      const previous = records[name] ?? 0;
      if (weight <= previous) continue;

      for (const trophy of configs.fish[name].trophies)
        if (trophy.minWeight > previous && trophy.minWeight <= weight)
          awarded.push(trophy.item);

      records[name] = weight;
      beaten.push(
        `${label(fishing.toEntityName(name))} at ${weight.toFixed(1)} kg`,
      );
    }

    player.inventory = player.inventory.map((slot) =>
      slot && takes(slot.name) ? null : slot,
    );
    player.records = records;

    for (const item of awarded)
      player.inventory = handlers.storage.add(player.inventory, {
        name: item,
        quantity: 1,
        stackable: false,
      });

    socket.emit(Event.INVENTORY_SYNC, player.inventory);
    handlers.item.donate(
      caught.map((slot) => ({ name: slot.name, quantity: 1 })),
      io,
      world,
    );

    const parts = [
      `${caught.length} fish for the village, much obliged.`,
      beaten.length ? `New best: ${beaten.join(", ")}.` : "",
      awarded.length
        ? `Take ${awarded.map((item) => label(item)).join(" and ")} for that.`
        : "",
    ].filter(Boolean);

    respond(parts.join("\n\n"));
  },
};
