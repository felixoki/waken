import { Server } from "socket.io";
import {
  Effect,
  EffectName,
  EntityConfig,
  PlayerConfig,
  SurfaceName,
} from "../types/index.js";
import { configs } from "../configs/index.js";
import { World } from "../World.js";
import { handlers } from "./index.js";
import { COLD_DURATION, COLD_INTERVAL, SURFACE_OFFSET } from "../globals.js";

export const climate = {
  tick: (world: World, io: Server, now: number): void => {
    if (now < world.climate.chilled) return;

    world.climate.chilled = now + COLD_INTERVAL;

    for (const id of world.chilled)
      if (!world.players.get(id)) world.chilled.delete(id);

    for (const player of world.players.all) {
      if (player.isDead) continue;

      const surface = world.surfaces.at(
        player.map,
        player.x,
        player.y + SURFACE_OFFSET,
        climate.instance(world, player),
      );

      if (surface === SurfaceName.SNOW)
        climate.chill(player.id, world, io, now);
      else if (world.chilled.has(player.id))
        climate.thaw(player.id, world, io, now);
    }
  },

  instance: (
    world: World,
    target: EntityConfig | PlayerConfig,
  ): string | undefined => {
    const map = configs.maps[target.map];
    if (!map?.isInstanced) return undefined;

    if ("socketId" in target)
      return map.isPartyInstance
        ? world.parties.getByPlayerId(target.id)?.id
        : world.sublevels.entranceOf(target.id);

    return world.chunks.getPartyByEntity(target.id);
  },

  chill: (id: string, world: World, io: Server, now: number): void => {
    const player = world.players.get(id);
    if (!player) return;

    world.chilled.add(id);

    const effects: Effect[] = player.effects ?? [];
    const existing = effects.find((e) => e.name === EffectName.COLD);

    if (existing?.held) return;

    const effect: Effect = existing ?? {
      name: EffectName.COLD,
      expiresAt: 0,
      lastTickAt: now,
      ownerId: "",
    };

    effect.held = true;
    effect.expiresAt = now + COLD_DURATION;

    if (!existing) effects.push(effect);

    world.players.update(id, { effects });

    handlers.weather.announce(id, false, player.socketId, effect, world, io);
  },

  thaw: (id: string, world: World, io: Server, now: number): void => {
    world.chilled.delete(id);

    const player = world.players.get(id);
    const effects: Effect[] = player?.effects ?? [];
    const held = effects.find((e) => e.name === EffectName.COLD && e.held);

    if (!player || !held) return;

    held.held = false;
    held.expiresAt = now + COLD_DURATION;

    world.players.update(id, { effects });

    handlers.weather.announce(id, false, player.socketId, held, world, io);
  },
};
