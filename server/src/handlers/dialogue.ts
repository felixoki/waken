import { Server, Socket } from "socket.io";
import { configs } from "../configs";
import { World } from "../World";
import { handlers } from ".";
import { conditions, StoryContext } from "../story/conditions.js";
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
    const entity = context.world.entities.get(context.entityId);
    return context.world.economy.getMood(entity?.name);
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

    ref: (node: DialogueReference): DialogueNode | null => {
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
    },

    node: (
      node: DialogueNode | Array<DialogueNode | DialogueReference> | DialogueReference,
      context: StoryContext,
    ): DialogueNode | null => {
      if (Array.isArray(node))
        return conditions.pick(
          node.flatMap((entry) => {
            const resolved = "ref" in entry ? dialogue.resolve.ref(entry) : entry;
            return resolved ? [resolved] : [];
          }),
          context,
        );

      if ("ref" in node) return dialogue.resolve.ref(node);

      return conditions.passes(node.when, context) ? node : null;
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
    io: Server,
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

    const def = definition.dialogue?.[nodeId];
    if (!def) return;

    const story = handlers.story.context(world, player, entity.name);

    const node = dialogue.resolve.node(def, story);
    if (!node) return;

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

    if (nodeId === NodeId.GREETING)
      handlers.story.talk(player, entity.name, world);

    handlers.story.apply(node.story ?? [], {
      player,
      world,
      socket,
      io,
      villager: entity.name,
    });

    const text = handlers.story.errand.fill(
      dialogue.resolve.text(node.text, mood),
      player,
    );

    const resolved = (node.choices || [])
      .map((choice) => ({
        isGoodbye: "ref" in choice && choice.ref === ChoiceId.GOODBYE,
        choice: dialogue.resolve.choice(choice),
      }))
      .filter(
        (entry) =>
          entry.choice !== null &&
          conditions.passes(entry.choice.when, story),
      );

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
      speaker:
        definition.metadata?.name ?? definition.metadata?.displayName,
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
