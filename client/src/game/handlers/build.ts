import {
  ComponentConfig,
  ComponentName,
  EntityName,
  Rect,
} from "@server/types";
import { configs } from "@server/configs";
import { TextureComponent } from "../components/Texture";
import type { Entity } from "../Entity";
import type { Scene } from "../scenes/Scene";
import type { MainScene } from "../scenes/Main";
import type { InventoryComponent } from "../components/Inventory";

const TOLERANCE = 4;

const bounds = (name: EntityName, x: number, y: number): Rect | null => {
  const def = configs.entities[name];
  if (!def) return null;

  const body = def.components.find(
    (c): c is Extract<ComponentConfig, { name: ComponentName.BODY }> =>
      c.name === ComponentName.BODY,
  );
  const texture = def.components.find(
    (
      c,
    ): c is Extract<
      ComponentConfig,
      { name: ComponentName.TEXTURE | ComponentName.TEXTURE_ANIMATION }
    > =>
      c.name === ComponentName.TEXTURE ||
      c.name === ComponentName.TEXTURE_ANIMATION,
  );
  if (!body || !texture) return null;

  const { tiles, tileSize } = texture.config;
  const cols = tiles.length
    ? Math.max(...tiles.map((t) => t.end - t.start + 1))
    : 1;
  const rows = tiles.length || 1;

  const left = x - (cols * tileSize) / 2 + body.config.offsetX;
  const top = y - (rows * tileSize) / 2 + body.config.offsetY;

  return {
    left,
    top,
    right: left + body.config.width,
    bottom: top + body.config.height,
  };
};

const contains = (rect: Rect, x: number, y: number): boolean =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

const intersects = (a: Rect, b: Rect): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export const build = {
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

  affordable(name: EntityName, player: Entity): boolean {
    const config = configs.buildable[name];
    if (!config) return false;

    const inventory =
      player.getComponent<InventoryComponent>(ComponentName.INVENTORY)?.get() ??
      [];

    return config.cost.every((c) => {
      const total = inventory.reduce(
        (sum, item) => (item?.name === c.item ? sum + item.quantity : sum),
        0,
      );

      return total >= c.quantity;
    });
  },

  placeable(
    name: EntityName,
    x: number,
    y: number,
    player: Entity,
    main: MainScene,
  ): boolean {
    if (!build.affordable(name, player)) return false;

    const rect = bounds(name, x, y);
    if (!rect) return false;

    const scene = player.scene as Scene;
    const tile = scene.managers.tile;

    if (!tile) return false;

    const ex = Math.min(TOLERANCE, (rect.right - rect.left) / 2);
    const ey = Math.min(TOLERANCE, (rect.bottom - rect.top) / 2);

    const inset: Rect = {
      left: rect.left + ex,
      top: rect.top + ey,
      right: rect.right - ex,
      bottom: rect.bottom - ey,
    };

    for (const collider of tile.colliders) {
      const body = collider.body as Phaser.Physics.Arcade.StaticBody;

      const wall: Rect = {
        left: body.x,
        top: body.y,
        right: body.x + body.width,
        bottom: body.y + body.height,
      };

      if (intersects(inset, wall)) return false;
    }

    for (const e of main.managers.entities.all) {
      if (e.map !== player.map) continue;
      const other = build.bodyRect(e);
      if (other && intersects(inset, other)) return false;
    }

    return true;
  },

  target(x: number, y: number, player: Entity, main: MainScene): string | null {
    for (const e of main.managers.entities.all) {
      if (e.map !== player.map || !configs.buildable[e.name]) continue;
      const rect = bounds(e.name, e.x, e.y);
      if (rect && contains(rect, x, y)) return e.id;
    }

    return null;
  },

  ghostTexture(scene: Scene, name: EntityName): string | null {
    const def = configs.entities[name];
    const comp = def?.components.find(
      (
        c,
      ): c is Extract<
        ComponentConfig,
        { name: ComponentName.TEXTURE | ComponentName.TEXTURE_ANIMATION }
      > =>
        c.name === ComponentName.TEXTURE ||
        c.name === ComponentName.TEXTURE_ANIMATION,
    );
    if (!comp) return null;

    const { spritesheet, tileSize, tiles } = comp.config;
    const key = `${name}_ghost`;
    TextureComponent.ensure(scene, { spritesheet, tileSize, tiles }, key);

    return key;
  },
};
