import {
  ComponentName,
  ConnectableConfig,
  EntityName,
  MapName,
  TextureConfig,
} from "@server/types";
import { TILE_SIZE } from "@server/globals";
import type { Entity } from "../Entity";
import type { ConnectableComponent } from "../components/Connectable";

export type ConnectIndex = Map<MapName, Map<number, Entity>>;

const NEIGHBOURS = [
  [0, -1, 1],
  [1, 0, 2],
  [0, 1, 4],
  [-1, 0, 8],
] as const;

const cell = (tx: number, ty: number): number => (ty << 16) | tx;

export const connect = {
  tile(v: number): number {
    return Math.floor(v / TILE_SIZE);
  },

  at(
    index: ConnectIndex,
    map: MapName,
    tx: number,
    ty: number,
  ): Entity | undefined {
    return index.get(map)?.get(cell(tx, ty));
  },

  mask(
    index: ConnectIndex,
    map: MapName,
    name: EntityName,
    tx: number,
    ty: number,
  ): number {
    let mask = 0;

    for (const [dx, dy, bit] of NEIGHBOURS)
      if (connect.at(index, map, tx + dx, ty + dy)?.name === name) mask |= bit;

    return mask;
  },

  link(
    index: ConnectIndex,
    entity: Entity,
    linked: boolean,
    relink = true,
  ): void {
    if (!entity.getComponent(ComponentName.CONNECTABLE)) return;

    const tx = connect.tile(entity.x);
    const ty = connect.tile(entity.y);
    const key = cell(tx, ty);

    let cells = index.get(entity.map);

    if (linked) {
      if (!cells) index.set(entity.map, (cells = new Map()));
      cells.set(key, entity);
    } else if (cells?.get(key) === entity) {
      cells.delete(key);
      if (!cells.size) index.delete(entity.map);
    }

    if (!relink) return;

    connect.relink(index, entity.map, tx, ty);
    for (const [dx, dy] of NEIGHBOURS)
      connect.relink(index, entity.map, tx + dx, ty + dy);
  },

  relink(index: ConnectIndex, map: MapName, tx: number, ty: number): void {
    const entity = connect.at(index, map, tx, ty);
    if (!entity) return;

    entity
      .getComponent<ConnectableComponent>(ComponentName.CONNECTABLE)
      ?.set(connect.mask(index, map, entity.name, tx, ty));
  },

  texture(config: ConnectableConfig, mask: number): TextureConfig {
    const row = Math.floor(mask / 4) + config.row;
    const col = (mask % 4) + config.col;

    return {
      spritesheet: config.spritesheet,
      tileSize: config.tileSize,
      tiles: [{ row, start: col, end: col }],
    };
  },

  key(name: EntityName, mask: number): string {
    return `${name}_${mask}`;
  },
};
