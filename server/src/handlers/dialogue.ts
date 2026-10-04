import { Socket } from "socket.io";
import { configs } from "../configs";
import { World } from "../World";
import { handlers } from ".";
import {
  BehaviorName,
  ChoiceId,
  ComponentName,
  Direction,
  DialogueEffectName,
  Event,
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
    return context.world.economy.getMood();
  },

  resolve: {
    text: (text: DialogueText, mood: Mood): string => {
      if (typeof text === "string") return text;

      if (Array.isArray(text))
        return text[Math.floor(Math.random() * text.length)];

      const selected = text[mood] || text[Mood.HAPPY] || "";

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

  respond: (socket: Socket, entityId: string, text: string) => {
    const goodbye = dialogue.resolve.choice({ ref: ChoiceId.GOODBYE });

    socket.emit(Event.ENTITY_DIALOGUE_RESPONSE, {
      entityId,
      nodeId: NodeId.GREETING,
      text,
      choices: [
        { text: "Anything else?", next: NodeId.GREETING },
        ...(goodbye ? [goodbye] : []),
      ],
    });
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
      if (player.locked && player.locked !== entityId) {
        const previous = world.entities.get(player.locked);

        if (previous) {
          previous.isLocked = false;
          previous.facing = undefined;

          handlers.broadcast.toChunk(
            socket,
            world,
            Event.ENTITY_UNLOCK,
            previous.id,
            previous.map,
            previous.x,
            previous.y,
            true,
          );
        }

        player.locked = undefined;
      }

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

    const resolved = (node.choices || [])
      .map((choice) => ({
        isGoodbye: "ref" in choice && choice.ref === ChoiceId.GOODBYE,
        choice: dialogue.resolve.choice(choice),
      }))
      .filter((entry) => entry.choice !== null);

    const goodbye = resolved.find((entry) => entry.isGoodbye)?.choice ?? null;

    const choices = resolved
      .filter((entry) => !entry.isGoodbye)
      .map((entry) => ({
        text: dialogue.resolve.text(entry.choice!.text, mood),
        next: entry.choice!.next,
        effects: entry.choice!.effects,
      }));

    const crafts = definition.components.some(
      (component) => component.name === ComponentName.CRAFTER,
    );

    if (crafts)
      choices.push({
        text: "Craft",
        next: undefined,
        effects: [
          {
            name: DialogueEffectName.CRAFTER_OPEN,
            params: { entityId, entityName: entity.name },
          },
        ],
      });

    if (goodbye)
      choices.push({
        text: dialogue.resolve.text(goodbye.text, mood),
        next: goodbye.next,
        effects: goodbye.effects,
      });

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
