import { Socket } from "socket.io";
import { configs } from "../configs";
import { World } from "../World";
import { handlers } from ".";
import {
  BehaviorName,
  ComponentName,
  Direction,
  DialogueEffectName,
  Event,
  NeedName,
  DialogueChoice,
  DialogueContext,
  DialogueNode,
  DialogueReference,
  DialogueText,
  Mood,
  NodeId,
} from "../types";

export const dialogue = {
  getMood: (context: DialogueContext): Mood => {
    if (context.world.economy.isLow(NeedName.FOOD)) return Mood.HUNGRY;
    return Mood.HAPPY;
  },

  resolve: {
    text: (text: DialogueText, mood: Mood): string => {
      if (typeof text === "string") return text;

      if (Array.isArray(text))
        return text[Math.floor(Math.random() * text.length)];

      const selected = text[mood] || text[Mood.HAPPY];

      if (Array.isArray(selected))
        return selected[Math.floor(Math.random() * selected.length)];

      return selected;
    },

    choice: (
      choice: DialogueChoice | DialogueReference,
    ): DialogueChoice | null => {
      if ("ref" in choice) {
        let common =
          configs.dialogue.choices[
            choice.ref as keyof typeof configs.dialogue.choices
          ];

        if (!common) return null;

        if (Array.isArray(common))
          common = common[Math.floor(Math.random() * common.length)];

        return common;
      }

      return choice;
    },

    node: (
      node: DialogueNode | DialogueNode[] | DialogueReference,
    ): DialogueNode | null => {
      if ("ref" in node) {
        const common =
          configs.dialogue.nodes[
            node.ref as keyof typeof configs.dialogue.nodes
          ];
        if (!common || !common.length) return null;

        const resolved = common[Math.floor(Math.random() * common.length)];

        if (node.individual)
          return {
            ...resolved,
            choices: [...(resolved.choices || []), ...node.individual],
          };

        return resolved;
      }

      if (Array.isArray(node)) {
        const sorted = [...node].sort(
          (a, b) => (b.salience || 0) - (a.salience || 0),
        );

        return sorted[0];
      }

      return node;
    },
  },

  iterate: (
    entityId: string,
    socket: Socket,
    world: World,
    nodeId: NodeId,
    facing?: Direction,
  ) => {
    const entity = world.entities.get(entityId);
    if (!entity) return;

    const definition = configs.entities[entity.name];
    if (!definition) return;

    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (nodeId === NodeId.GREETING) {
      if (entity.isLocked && player.locked !== entityId) return;

      entity.isLocked = true;
      player.locked = entityId;

      const stay = definition.behaviors?.some(
        (b) => b.name === BehaviorName.STAY,
      );

      if (!stay && facing) entity.facing = facing;

      handlers.broadcast.toChunk(
        socket,
        world,
        Event.ENTITY_LOCK,
        { entityId, facing: entity.facing },
        entity.map,
        entity.x,
        entity.y,
        true,
      );
    }

    if (player.locked !== entityId) return;

    const context: DialogueContext = {
      world,
      playerId: player.id,
      entityId,
    };

    const mood = dialogue.getMood(context);

    const def = definition.dialogue?.[nodeId];
    if (!def) return;

    const node = dialogue.resolve.node(def);
    if (!node) return;

    const text = dialogue.resolve.text(node.text, mood);

    const choices = (node.choices || [])
      .map((choice) => dialogue.resolve.choice(choice))
      .filter((choice) => choice !== null)
      .map((choice) => ({
        text: choice!.text,
        next: choice!.next,
        effects: choice!.effects,
      }));

    const collectorConfig = definition.components
      ?.find((c) => c.name === ComponentName.COLLECTOR)
      ?.config as { accepts: string[] } | undefined;

    if (collectorConfig) {
      const giveChoices = player.inventory
        .filter(
          (item) =>
            item &&
            item.quantity > 0 &&
            collectorConfig.accepts.includes(item.name),
        )
        .map((item) => {
          const displayName =
            configs.entities[item!.name]?.metadata?.displayName || item!.name;
          return {
            text: `Give ${displayName} (${item!.quantity})`,
            next: NodeId.GREETING,
            effects: [
              {
                name: DialogueEffectName.ITEM_GIVE,
                params: { name: item!.name, quantity: item!.quantity },
              },
            ],
          };
        });

      choices.unshift(...giveChoices);
    }

    socket.emit(Event.ENTITY_DIALOGUE_RESPONSE, {
      entityId,
      nodeId,
      text,
      choices,
    });
  },

  end: (entityId: string, socket: Socket, world: World) => {
    const entity = world.entities.get(entityId);
    if (!entity) return;

    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    if (player.locked !== entityId) return;

    entity.isLocked = false;
    entity.facing = undefined;
    player.locked = undefined;

    handlers.broadcast.toChunk(
      socket,
      world,
      Event.ENTITY_UNLOCK,
      entityId,
      entity.map,
      entity.x,
      entity.y,
      true,
    );
  },
};
