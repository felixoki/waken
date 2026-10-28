import { Server, Socket } from "socket.io";
import { World } from "../World";
import { handlers } from ".";
import { configs } from "../configs";
import { conditions } from "../story/conditions.js";
import {
  ENCOUNTER_APPROACH,
  ENCOUNTER_DISTANCE,
  ENCOUNTER_READY_TIMEOUT,
  ENCOUNTER_SPACING,
} from "../globals.js";
import {
  Direction,
  DirectionVectors,
  Encounter,
  EncounterPhase,
  EncounterSlot,
  EncounterStart,
  EntityConfig,
  Event,
  NodeId,
  PlayerConfig,
  SpotName,
} from "../types";

export const encounter = {
  find: (world: World, entityId: string): Encounter | undefined => {
    for (const data of world.encounters.values())
      if (data.entityId === entityId) return data;
  },

  stage: (
    world: World,
    entity: EntityConfig,
    members: PlayerConfig[],
  ): { x: number; y: number; facing: Direction } => {
    const spot = world.spots.get(SpotName.ISLES_ENCOUNTER);

    if (spot && spot.map === entity.map)
      return {
        x: spot.x,
        y: spot.y,
        facing: spot.y < entity.y ? Direction.UP : Direction.DOWN,
      };

    const cy = members.reduce((sum, m) => sum + m.y, 0) / members.length;
    const facing = cy < entity.y ? Direction.UP : Direction.DOWN;

    return {
      x: entity.x,
      y: entity.y + DirectionVectors[facing].y * ENCOUNTER_DISTANCE,
      facing,
    };
  },

  slots: (
    stage: { x: number; y: number; facing: Direction },
    members: PlayerConfig[],
  ): Record<string, EncounterSlot> => {
    const back = DirectionVectors[stage.facing].y * ENCOUNTER_APPROACH;
    const sorted = [...members].sort((a, b) => a.x - b.x);
    const slots: Record<string, EncounterSlot> = {};

    sorted.forEach((member, i) => {
      const x = stage.x + (i - (sorted.length - 1) / 2) * ENCOUNTER_SPACING;

      slots[member.id] = {
        from: { x, y: stage.y + back },
        to: { x, y: stage.y },
      };
    });

    return slots;
  },

  start: (entityId: string, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    const entity = world.entities.get(entityId);
    if (!player || !entity || entity.map !== player.map) return;

    const party = world.parties.getByPlayerId(player.id);
    if (!party) return;

    const existing = world.encounters.get(party.id);
    if (existing) {
      if (existing.phase === EncounterPhase.FIGHT)
        socket.emit(Event.CUTSCENE_END, existing.entityId);
      return;
    }

    const members = party.members.flatMap((id) => {
      const member = world.players.get(id);
      return member && member.map === entity.map && !member.isDead
        ? [member]
        : [];
    });
    if (!members.length) return;

    const stage = encounter.stage(world, entity, members);
    const facing = stage.facing;

    const data: Encounter = {
      entityId,
      partyId: party.id,
      phase: EncounterPhase.GATHERING,
      facing,
      slots: encounter.slots(stage, members),
      ready: [],
      nodeId: NodeId.GREETING,
    };

    data.timer = setTimeout(
      () => encounter.converse(data, io, world),
      ENCOUNTER_READY_TIMEOUT,
    );
    world.encounters.set(party.id, data);

    entity.isLocked = true;
    entity.facing = facing;

    const start: EncounterStart = {
      entityId,
      x: entity.x,
      y: entity.y,
      facing,
      slots: data.slots,
    };

    io.to(`party:${party.id}`).emit(Event.ENTITY_LOCK, { entityId, facing });
    io.to(`party:${party.id}`).emit(Event.CUTSCENE_START, start);
  },

  ready: (socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    const party = world.parties.getByPlayerId(player.id);
    const data = party && world.encounters.get(party.id);
    if (!data || data.phase !== EncounterPhase.GATHERING) return;

    if (!data.ready.includes(player.id)) data.ready.push(player.id);

    encounter.gathered(data, io, world);
  },

  gathered: (data: Encounter, io: Server, world: World) => {
    const party = world.parties.get(data.partyId);
    if (!party) return;

    const waiting = Object.keys(data.slots).some(
      (id) => party.members.includes(id) && !data.ready.includes(id),
    );

    if (!waiting) encounter.converse(data, io, world);
  },

  converse: (data: Encounter, io: Server, world: World) => {
    if (data.phase !== EncounterPhase.GATHERING) return;

    clearTimeout(data.timer);
    data.timer = undefined;
    data.phase = EncounterPhase.DIALOGUE;

    encounter.say(data, NodeId.GREETING, io, world);
  },

  say: (data: Encounter, nodeId: string, io: Server, world: World) => {
    const party = world.parties.get(data.partyId);
    const entity = world.entities.get(data.entityId);
    if (!party || !entity) return;

    const definition = configs.entities[entity.name];
    const def = definition?.dialogue?.[nodeId];
    const leader = world.players.get(party.leader);
    if (!def || !leader) return encounter.fight(data, io, world);

    const story = handlers.story.context(world, leader, entity.name);
    const node = handlers.dialogue.resolve.node(def, story);
    if (!node) return encounter.fight(data, io, world);

    data.nodeId = nodeId;

    const mood = handlers.dialogue.getMood({
      world,
      playerId: leader.id,
      entityId: entity.id,
    });

    const choices = (node.choices ?? []).flatMap((entry) => {
      const choice = handlers.dialogue.resolve.choice(entry);
      if (!choice || !conditions.passes(choice.when, story)) return [];

      return [
        {
          text: handlers.dialogue.resolve.text(choice.text, mood),
          next: choice.next,
          effects: choice.effects,
        },
      ];
    });

    const response = {
      entityId: entity.id,
      nodeId,
      speaker: definition?.metadata?.name ?? definition?.metadata?.displayName,
      text: handlers.dialogue.resolve.text(node.text, mood),
      choices,
    };

    for (const id of party.members) {
      const member = world.players.get(id);
      if (!member) continue;

      io.sockets.sockets
        .get(member.socketId)
        ?.emit(Event.ENTITY_DIALOGUE_RESPONSE, {
          ...response,
          canChoose: id === party.leader,
        });
    }
  },

  choose: (
    data: Encounter,
    nodeId: string,
    socket: Socket,
    io: Server,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    const party = world.parties.get(data.partyId);
    if (!player || party?.leader !== player.id) return;
    if (data.phase !== EncounterPhase.DIALOGUE) return;

    encounter.say(data, nodeId, io, world);
  },

  end: (data: Encounter, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    const party = world.parties.get(data.partyId);
    if (!player || party?.leader !== player.id) return;
    if (data.phase !== EncounterPhase.DIALOGUE) return;

    encounter.fight(data, io, world);
  },

  fight: (data: Encounter, io: Server, world: World) => {
    clearTimeout(data.timer);
    data.timer = undefined;
    data.phase = EncounterPhase.FIGHT;

    const entity = world.entities.get(data.entityId);

    if (entity) {
      entity.isLocked = false;
      entity.facing = undefined;
    }

    io.to(`party:${data.partyId}`).emit(Event.ENTITY_UNLOCK, data.entityId);
    io.to(`party:${data.partyId}`).emit(Event.CUTSCENE_END, data.entityId);
  },

  leave: (partyId: string, io: Server, world: World) => {
    const data = world.encounters.get(partyId);
    if (!data) return;

    if (data.phase === EncounterPhase.GATHERING)
      encounter.gathered(data, io, world);
    else if (data.phase === EncounterPhase.DIALOGUE)
      encounter.say(data, data.nodeId, io, world);
  },

  clear: (partyId: string, world: World) => {
    const data = world.encounters.get(partyId);
    if (!data) return;

    clearTimeout(data.timer);
    world.encounters.delete(partyId);
  },
};
