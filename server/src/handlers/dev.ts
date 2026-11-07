import { Server, Socket } from "socket.io";
import {
  ComponentName,
  DevCommand,
  DialogueNode,
  DialogueText,
  Effect,
  EffectName,
  EntityName,
  Event,
  ImprovementName,
  MapName,
  StoryEffectName,
  StoryFlag,
  StoryScope,
  TimeState,
  VillageState,
} from "../types";
import { DAY, LEAN_TAKEN, MAX_HEALTH, PHASE_STARTS } from "../globals.js";
import { DEV_COMMANDS } from "../server.js";
import { configs } from "../configs/index.js";
import { World } from "../World";
import { handlers } from ".";
import { conditions } from "../story/conditions.js";
import { MapLoader } from "../loaders/Map.js";

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
    if (!command) return dev.fail(socket, `unknown command "${data.name}"`);

    command((data.args ?? []).map(String), socket, io, world);
  },

  reply: (socket: Socket, ...lines: string[]) => {
    socket.emit(Event.DEV_OUTPUT, { lines, error: false });
  },

  fail: (socket: Socket, ...lines: string[]) => {
    socket.emit(Event.DEV_OUTPUT, { lines, error: true });
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
        return dev.fail(_socket, `tier must be 1 to ${max}`);

      world.economy.setTier(value);
      handlers.broadcast.store(io, world);
      dev.reply(_socket, `tier ${value}`);
    },

    [DevCommand.IMPROVE]: ([name], socket, _io, world) => {
      const names = Object.values(ImprovementName) as string[];
      if (!names.includes(name))
        return dev.fail(
          socket,
          `improvement must be one of ${names.join(", ")}`,
        );

      world.economy.improve(name as ImprovementName);
      dev.reply(socket, `improved ${name}`);
    },

    [DevCommand.PHASE]: ([phase], _socket, io, world) => {
      const entry = PHASE_STARTS.find((p) => p.phase === phase);
      if (!entry)
        return dev.fail(
          _socket,
          `phase must be one of ${PHASE_STARTS.map((p) => p.phase).join(", ")}`,
        );

      dev.time(io, world, { current: entry.start * DAY, phase: entry.phase });
      dev.reply(_socket, `phase ${entry.phase}`);
    },

    [DevCommand.DAY]: ([day], _socket, io, world) => {
      const days = Number(day);
      if (!Number.isInteger(days) || days < 0)
        return dev.fail(_socket, "day must be 0 or more");

      dev.time(io, world, { days });
      dev.reply(_socket, `day ${days}`);
    },

    [DevCommand.EFFECT]: ([name, duration], socket, io, world) => {
      const player = world.players.getBySocketId(socket.id);
      if (!player) return dev.fail(socket, "no player");

      const names = Object.values(EffectName) as string[];
      if (!names.includes(name))
        return dev.fail(socket, `effect must be one of ${names.join(", ")}`);

      const now = Date.now();
      const effect: Effect = {
        name: name as EffectName,
        expiresAt: now + Number(duration ?? 8000),
        lastTickAt: now,
        ownerId: player.id,
      };

      const effects = (player.effects ?? []).filter((e) => e.name !== name);
      effects.push(effect);
      world.players.update(player.id, { effects });

      handlers.weather.announce(player.id, effect, world, io);
      dev.reply(socket, `effect ${name}`);
    },

    [DevCommand.RESEED]: ([name], socket, _io, world) => {
      const map = Object.values(MapName).find((value) => value === name);
      if (!map)
        return dev.fail(
          socket,
          `map must be one of ${Object.values(MapName).join(", ")}`,
        );

      for (const entity of world.entities.getByMap(map)) {
        world.chunks.removeEntity(entity.id);
        world.entities.remove(entity.id);
      }

      const loader = new MapLoader();
      const entities = loader.parseEntities(map, loader.load(configs.maps[map].json));

      for (const entity of entities) {
        entity.tame = handlers.taming.native(entity);
        world.entities.add(entity.id, entity);
        world.chunks.registerEntity(entity.id, entity.map, entity.x, entity.y);
      }

      dev.reply(
        socket,
        `reseeded ${map} with ${entities.length} entities, leave and re-enter to see them`,
      );
    },

    [DevCommand.FREECAST]: (_args, socket, _io, world) => {
      const player = world.players.getBySocketId(socket.id);
      if (!player) return dev.fail(socket, "no player");

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
        return dev.fail(socket, `can't give "${name}"`);

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
      if (!player || !flag) return dev.fail(socket, `unknown flag "${name}"`);

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
      if (!player || !entity) return dev.fail(socket, "talk to someone first");

      const dialogue = configs.entities[entity.name]?.dialogue;
      if (!dialogue) return dev.fail(socket, `${entity.name} has no dialogue`);

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
      if (!player || !entity) return dev.fail(socket, "talk to someone first");
      if (!Number.isInteger(value)) return dev.fail(socket, "bond needs a number");

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
      if (!entity) return dev.fail(socket, "talk to someone first");
      if (!Number.isInteger(value) || value < 0)
        return dev.fail(socket, "lean needs a number from 0");

      world.story.setLean(entity.name, value);
      dev.reply(socket, `lean ${value} for ${entity.name}`);
    },

    [DevCommand.GO]: ([name, tx, ty], socket, io, world) => {
      const map = Object.values(MapName).find((value) => value === name);
      if (!map)
        return dev.fail(
          socket,
          `map must be one of ${Object.values(MapName).join(", ")}`,
        );

      const spawn = configs.maps[map].spawn;
      const x = tx === undefined ? spawn.x : Number(tx);
      const y = ty === undefined ? spawn.y : Number(ty);
      if (!Number.isFinite(x) || !Number.isFinite(y))
        return dev.fail(socket, "x and y must be numbers");

      handlers.player.transition({ to: map, x, y }, io, socket, world);
      dev.reply(socket, `going to ${map}`);
    },

    [DevCommand.HIVE]: ([tree], socket, io, world) => {
      const player = world.players.getBySocketId(socket.id);
      const name = (tree ?? EntityName.TREE1) as EntityName;
      const fellable = configs.entities[name]?.components.find(
        (c) => c.name === ComponentName.FELLABLE,
      );

      if (!player || fellable?.name !== ComponentName.FELLABLE || !fellable.config.hive)
        return dev.fail(socket, `"${name}" can't carry a hive`);

      const maxHealth = configs.entities[name]?.maxHealth ?? MAX_HEALTH;
      const party = world.parties.getByPlayerId(player.id);

      handlers.entity.create(
        {
          name,
          map: player.map,
          x: player.x + 56,
          y: player.y - 16,
          health: maxHealth,
          maxHealth,
          isLocked: false,
          hive: true,
        },
        socket,
        io,
        world,
        configs.maps[player.map].isInstanced ? party?.id : undefined,
      );
      dev.reply(socket, `hive on ${name}`);
    },

    [DevCommand.SPAWN]: ([name], socket, io, world) => {
      const player = world.players.getBySocketId(socket.id);
      if (!player) return dev.fail(socket, "no player");

      const entity = Object.values(EntityName).find((value) => value === name);
      if (!entity || !configs.entities[entity])
        return dev.fail(socket, `unknown entity "${name}"`);

      const maxHealth = configs.entities[entity]?.maxHealth ?? MAX_HEALTH;
      const party = world.parties.getByPlayerId(player.id);
      const config = {
        name: entity,
        map: player.map,
        x: player.x + 48,
        y: player.y,
        health: maxHealth,
        maxHealth,
        isLocked: false,
      };

      handlers.entity.create(
        {
          ...config,
          tame: handlers.taming.native({ ...config, id: "", createdAt: 0 }),
        },
        socket,
        io,
        world,
        configs.maps[player.map].isInstanced ? party?.id : undefined,
      );
      dev.reply(socket, `spawned ${entity}`);
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
