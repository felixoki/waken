import {
  ComponentConfig,
  ComponentName,
  EntityName,
  Rect,
} from "@server/types";
import { configs } from "@server/configs";
import { TILE_SIZE } from "@server/globals";
import { TextureComponent } from "../components/Texture";
import { handlers } from ".";
import type { Entity } from "../Entity";
import type { Scene } from "../scenes/Scene";
import type { MainScene } from "../scenes/Main";

const TOLERANCE = 4;

const texture = (name: EntityName) =>
  configs.entities[name]?.components.find(
    (
      c,
    ): c is Extract<
      ComponentConfig,
      { name: ComponentName.TEXTURE | ComponentName.TEXTURE_ANIMATION }
    > =>
      c.name === ComponentName.TEXTURE ||
      c.name === ComponentName.TEXTURE_ANIMATION,
  );

const footprint = (name: EntityName): { cols: number; rows: number } => {
  const tiles = texture(name)?.config.tiles ?? [];

  return {
    cols: tiles.length ? Math.max(...tiles.map((t) => t.end - t.start + 1)) : 1,
    rows: tiles.length || 1,
  };
};

const snap = (v: number, n: number): number =>
  n % 2 === 0
    ? Math.round(v / TILE_SIZE) * TILE_SIZE
    : Math.floor(v / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

const bounds = (name: EntityName, x: number, y: number): Rect | null => {
  const body = configs.entities[name]?.components.find(
    (c): c is Extract<ComponentConfig, { name: ComponentName.BODY }> =>
      c.name === ComponentName.BODY,
  );
  const tex = texture(name);
  if (!body || !tex) return null;

  const { tileSize } = tex.config;
  const { cols, rows } = footprint(name);

  const left = x - (cols * tileSize) / 2 + body.config.offsetX;
  const top = y - (rows * tileSize) / 2 + body.config.offsetY;

  return {
    left,
    top,
    right: left + body.config.width,
    bottom: top + body.config.height,
  };
};

const inset = (name: EntityName, x: number, y: number): Rect | null => {
  const rect = bounds(name, x, y);
  if (!rect) return null;

  const ex = Math.min(TOLERANCE, (rect.right - rect.left) / 2);
  const ey = Math.min(TOLERANCE, (rect.bottom - rect.top) / 2);

  return {
    left: rect.left + ex,
    top: rect.top + ey,
    right: rect.right - ex,
    bottom: rect.bottom - ey,
  };
};

const contains = (rect: Rect, x: number, y: number): boolean =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

const intersects = (a: Rect, b: Rect): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export const build = {
  snap(name: EntityName, x: number, y: number): { x: number; y: number } {
    const { cols, rows } = footprint(name);
    return { x: snap(x, cols), y: snap(y, rows) };
  },

  bodyRect(entity: Entity): Rect | null {
    const body = entity.body;
    if (!body) return null;

    return {
      left: body.x,
      top: body.y,
      right: body.x + body.width,
      bottom: body.y + body.height,
    };
  },

  affordable(name: EntityName, store: Record<string, number>): boolean {
    const config = configs.buildable[name];
    if (!config) return false;

    return config.cost.every((c) => (store[c.item] ?? 0) >= c.quantity);
  },

  placeable(
    name: EntityName,
    x: number,
    y: number,
    player: Entity,
    main: MainScene,
    store: Record<string, number>,
  ): boolean {
    if (!configs.buildable[name]?.maps.includes(player.map)) return false;
    if (!build.affordable(name, store)) return false;

    const area = inset(name, x, y);
    if (!area) return false;

    const scene = player.scene as Scene;
    const tile = scene.managers.tile;

    if (!tile) return false;

    const replaces = configs.buildable[name]?.replaces;

    for (const collider of tile.colliders) {
      const body = collider.body as Phaser.Physics.Arcade.StaticBody;

      const wall: Rect = {
        left: body.x,
        top: body.y,
        right: body.x + body.width,
        bottom: body.y + body.height,
      };

      if (intersects(area, wall)) return false;
    }

    for (const e of main.managers.entities.all) {
      if (e.map !== player.map || replaces?.includes(e.name)) continue;
      const other = build.bodyRect(e);
      if (other && intersects(area, other)) return false;
    }

    return true;
  },

  clears(
    name: EntityName,
    x: number,
    y: number,
    player: Entity,
    main: MainScene,
  ): string[] {
    const replaces = configs.buildable[name]?.replaces;
    const area = inset(name, x, y);
    if (!replaces?.length || !area) return [];

    const ids: string[] = [];

    for (const e of main.managers.entities.all) {
      if (e.map !== player.map || !replaces.includes(e.name)) continue;
      const other = build.bodyRect(e);
      if (other && intersects(area, other)) ids.push(e.id);
    }

    return ids;
  },

  target(x: number, y: number, player: Entity, main: MainScene): string | null {
    for (const e of main.managers.entities.all) {
      if (e.map !== player.map || !configs.buildable[e.name]) continue;
      const rect = bounds(e.name, e.x, e.y);
      if (rect && contains(rect, x, y)) return e.id;
    }

    return null;
  },

  ghostTexture(
    scene: Scene,
    name: EntityName,
    x: number,
    y: number,
    player: Entity,
    main: MainScene,
  ): string | null {
    const connectable = configs.entities[name]?.components.find(
      (c): c is Extract<ComponentConfig, { name: ComponentName.CONNECTABLE }> =>
        c.name === ComponentName.CONNECTABLE,
    );

    if (connectable) {
      const mask = handlers.connect.mask(
        main.managers.entities.connected,
        player.map,
        name,
        handlers.connect.tile(x),
        handlers.connect.tile(y),
      );
      const key = handlers.connect.key(name, mask);
      TextureComponent.ensure(
        scene,
        handlers.connect.texture(connectable.config, mask),
        key,
      );

      return key;
    }

    const comp = texture(name);
    if (!comp) return null;

    const { spritesheet, tileSize, tiles } = comp.config;
    const key = `${name}_ghost`;
    TextureComponent.ensure(scene, { spritesheet, tileSize, tiles }, key);

    return key;
  },
};
