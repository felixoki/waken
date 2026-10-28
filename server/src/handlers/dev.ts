import { Server, Socket } from "socket.io";
import {
  DevCommand,
  DialogueNode,
  DialogueText,
  EntityName,
  Event,
  ImprovementName,
  StoryEffectName,
  StoryFlag,
  StoryScope,
  TimeState,
  VillageState,
} from "../types";
import { DAY, LEAN_TAKEN, PHASE_STARTS } from "../globals.js";
import { DEV_COMMANDS } from "../server.js";
import { configs } from "../configs/index.js";
import { World } from "../World";
import { handlers } from ".";
import { conditions } from "../story/conditions.js";

type Command = (
  args: string[],
  socket: Socket,
  io: Server,
  world: World,
) => void;

export const dev = {
  run: (
    data: { name: DevCommand; args?: string[] },
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    if (!DEV_COMMANDS) return;

    const command: Command | undefined = dev.commands[data.name];
    if (!command) return dev.reply(socket, `unknown command "${data.name}"`);

    command((data.args ?? []).map(String), socket, io, world);
  },

  reply: (socket: Socket, ...lines: string[]) => {
    socket.emit(Event.DEV_OUTPUT, lines);
  },

  preview: (text: DialogueText): string => {
    const first =
      typeof text === "string"
        ? text
        : Array.isArray(text)
          ? text[0]
          : Object.values(text)[0];

    return String(Array.isArray(first) ? first[0] : (first ?? "")).slice(0, 50);
  },

  time: (io: Server, world: World, update: Partial<TimeState>) => {
    world.setTime({ ...world.getTime(), ...update });
    io.emit(Event.WORLD_TIME, world.getTime());
  },

  commands: {
    [DevCommand.TIER]: ([tier], _socket, io, world) => {
      const value = Number(tier);
      const max = Math.max(1, ...configs.tiers.map((t) => t.tier));
      if (!Number.isInteger(value) || value < 1 || value > max)
        return dev.reply(_socket, `tier must be 1 to ${max}`);

      world.economy.setTier(value);
      handlers.broadcast.store(io, world);
      dev.reply(_socket, `tier ${value}`);
    },

    [DevCommand.IMPROVE]: ([name], socket, _io, world) => {
      const names = Object.values(ImprovementName) as string[];
      if (!names.includes(name))
        return dev.reply(
          socket,
          `improvement must be one of ${names.join(", ")}`,
        );

      world.economy.improve(name as ImprovementName);
      dev.reply(socket, `improved ${name}`);
    },

    [DevCommand.PHASE]: ([phase], _socket, io, world) => {
      const entry = PHASE_STARTS.find((p) => p.phase === phase);
      if (!entry)
        return dev.reply(
          _socket,
          `phase must be one of ${PHASE_STARTS.map((p) => p.phase).join(", ")}`,
        );

      dev.time(io, world, { current: entry.start * DAY, phase: entry.phase });
      dev.reply(_socket, `phase ${entry.phase}`);
    },

    [DevCommand.DAY]: ([day], _socket, io, world) => {
      const days = Number(day);
      if (!Number.isInteger(days) || days < 0)
        return dev.reply(_socket, "day must be 0 or more");

      dev.time(io, world, { days });
      dev.reply(_socket, `day ${days}`);
    },

    [DevCommand.FREECAST]: (_args, socket, _io, world) => {
      const player = world.players.getBySocketId(socket.id);
      if (!player) return dev.reply(socket, "no player");

      const on = !world.freecast.has(player.id);
      if (on) world.freecast.add(player.id);
      else world.freecast.delete(player.id);

      socket.emit(Event.DEV_FREECAST, on);
      dev.reply(socket, `freecast ${on ? "on" : "off"}`);
    },

    [DevCommand.GIVE]: ([name, quantity], socket, _io, world) => {
      const player = world.players.getBySocketId(socket.id);
      const definition = configs.entities[name as EntityName];
      const amount = Number(quantity ?? 1);

      if (!player || !definition || !Number.isInteger(amount) || amount < 1)
        return dev.reply(socket, `can't give "${name}"`);

      handlers.item.give(
        player,
        [
          {
            name: name as EntityName,
            quantity: amount,
            stackable: definition.metadata?.stackable ?? false,
          },
        ],
        socket,
        world,
      );
      dev.reply(socket, `gave ${amount} ${name}`);
    },

    [DevCommand.FLAG]: ([name, action, scope], socket, _io, world) => {
      const player = world.players.getBySocketId(socket.id);
      const flag = Object.values(StoryFlag).find((value) => value === name);
      if (!player || !flag) return dev.reply(socket, `unknown flag "${name}"`);

      handlers.story.apply(
        [
          {
            name:
              action === "clear"
                ? StoryEffectName.FLAG_CLEAR
                : StoryEffectName.FLAG_SET,
            flag,
            scope:
              scope === StoryScope.WORLD ? StoryScope.WORLD : StoryScope.PLAYER,
          },
        ],
        { player, world, socket, io: _io },
      );
      dev.reply(socket, `${action === "clear" ? "cleared" : "set"} ${flag}`);
    },

    [DevCommand.WHY]: (_args, socket, _io, world) => {
      const player = world.players.getBySocketId(socket.id);
      const entity = player?.locked && world.entities.get(player.locked);
      if (!player || !entity) return dev.reply(socket, "talk to someone first");

      const dialogue = configs.entities[entity.name]?.dialogue;
      if (!dialogue) return dev.reply(socket, `${entity.name} has no dialogue`);

      const context = handlers.story.context(world, player, entity.name);
      const lines = [
        `why: ${entity.name} (bond ${context.bond(entity.name)})`,
      ];

      for (const [nodeId, def] of Object.entries(dialogue)) {
        if ("ref" in def) continue;

        const nodes: DialogueNode[] = (Array.isArray(def) ? def : [def]).flatMap(
          (entry) => {
            const resolved =
              "ref" in entry ? handlers.dialogue.resolve.ref(entry) : entry;
            return resolved ? [resolved] : [];
          },
        );
        const served = conditions.pick(nodes, context);

        for (const node of nodes) {
          const failures = conditions.explain(node.when, context);
          const mark = node === served ? "→" : failures.length ? "✗" : "·";

          lines.push(
            `  ${mark} ${nodeId} [${node.salience ?? 0}] "${dev.preview(node.text)}"`,
            ...failures.map((failure) => `      ${failure}`),
          );
        }
      }

      dev.reply(socket, ...lines);
    },

    [DevCommand.BOND]: ([amount], socket, _io, world) => {
      const player = world.players.getBySocketId(socket.id);
      const entity = player?.locked && world.entities.get(player.locked);
      const value = Number(amount);
      if (!player || !entity) return dev.reply(socket, "talk to someone first");
      if (!Number.isInteger(value)) return dev.reply(socket, "bond needs a number");

      player.story.bond[entity.name] = 0;
      handlers.story.bond(player, entity.name, value, world);
      dev.reply(
        socket,
        `bond ${player.story.bond[entity.name]} with ${entity.name}`,
      );
    },

    [DevCommand.LEAN]: ([amount], socket, _io, world) => {
      const player = world.players.getBySocketId(socket.id);
      const entity = player?.locked && world.entities.get(player.locked);
      const value = Number(amount);
      if (!entity) return dev.reply(socket, "talk to someone first");
      if (!Number.isInteger(value) || value < 0)
        return dev.reply(socket, "lean needs a number from 0");

      world.story.setLean(entity.name, value);
      dev.reply(socket, `lean ${value} for ${entity.name}`);
    },

    [DevCommand.VILLAGE]: (_args, socket, _io, world) => {
      handlers.village.day(world);

      const leaning = handlers.village
        .villagers(world)
        .filter((name) => world.story.leanOf(name) >= LEAN_TAKEN);

      dev.reply(
        socket,
        `village ${VillageState[world.story.village].toLowerCase()} (tier ${world.economy.getTier()})`,
        `leaning: ${leaning.join(", ") || "nobody"}`,
      );
    },
  } satisfies Record<DevCommand, Command>,
};
