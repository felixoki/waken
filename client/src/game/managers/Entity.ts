import {
  ComponentName,
  EntityConfig,
  EntityName,
  MapName,
} from "@server/types";
import { Entity } from "../Entity";
import { Factory } from "../factory/Factory";
import { Scene } from "../scenes/Scene";
import type { MainScene } from "../scenes/Main";
import { configs } from "@server/configs";
import { CHUNK_ACTIVATION_BUDGET, CHUNK_PIXEL_SIZE } from "@server/globals";

type Rect = { x: number; y: number; width: number; height: number };

export class EntityManager {
  private main: MainScene;
  private queue: EntityConfig[] = [];
  private queued: Set<string> = new Set();
  private grid: Map<string, Map<string, Rect>> = new Map();
  private merged: Map<MapName, number[][]> = new Map();
  private dirty: Set<MapName> = new Set();
  private groups: Map<
    string,
    {
      group: Phaser.Physics.Arcade.StaticGroup;
      collider: Phaser.Physics.Arcade.Collider;
    }
  > = new Map();

  public entities: Map<string, Entity> = new Map();

  constructor(main: MainScene) {
    this.main = main;
  }

  get(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  get all(): Entity[] {
    return [...this.entities.values()];
  }

  get isPending(): boolean {
    return !!this.queue.length;
  }

  update(): void {
    this._drain();

    this.entities.forEach((entity) => {
      if (!entity.isStatic) entity.update();
    });
  }

  add(config: EntityConfig): void {
    if (this.entities.has(config.id) || this.queued.has(config.id)) return;

    this.queue.push(config);
    this.queued.add(config.id);
  }

  batch(configs: EntityConfig[]): void {
    for (const config of configs) this.add(config);
    this._sort();
  }

  private _sort(): void {
    const player = this.main.managers.players.player;
    if (!player) return;

    this.queue.sort((a, b) => {
      const as = this._isStaticDef(a.name);
      const bs = this._isStaticDef(b.name);

      if (as !== bs) return as ? -1 : 1;

      return (
        (a.x - player.x) ** 2 +
        (a.y - player.y) ** 2 -
        ((b.x - player.x) ** 2 + (b.y - player.y) ** 2)
      );
    });
  }

  private _isStaticDef(name: EntityName): boolean {
    const def = configs.entities[name];

    return (
      def?.components.some(
        (c) => c.name === ComponentName.BODY && c.config?.static,
      ) ?? false
    );
  }

  private _blocksPathing(name: EntityName): boolean {
    const def = configs.entities[name];

    return (
      def?.components.some(
        (c) =>
          c.name === ComponentName.BODY &&
          c.config?.static &&
          (c.config?.collides ?? true),
      ) ?? false
    );
  }

  private _drain(): void {
    let created = 0;

    while (this.queue.length && created < CHUNK_ACTIVATION_BUDGET) {
      const config = this.queue.shift()!;
      this.queued.delete(config.id);

      if (this.entities.has(config.id)) continue;

      this._create(config);
      created++;
    }
  }

  private _create(config: EntityConfig): void {
    if (this.entities.has(config.id)) return;

    const scene = this.main.scene.get(config.map) as Scene;
    if (!scene?.managers?.physics) return;

    const definition = configs.entities[config.name];
    
    const merged = { ...definition!, ...config };
    if (!config.facing) merged.facing = definition!.facing;

    const entity = Factory.create(scene, merged);

    entity.map = config.map;
    entity.isLocked = config.isLocked;
    this.entities.set(config.id, entity);

    if (entity.isStatic) this._registerStatic(entity, config, scene);
  }

  private _registerStatic(
    entity: Entity,
    config: EntityConfig,
    scene: Scene,
  ): void {
    const key = this._toChunkKey(config.map, config.x, config.y);
    const group = this._getChunkGroup(scene, key);

    group.add(entity);

    if (!entity.body || !scene.managers.tile) return;
    if (!this._blocksPathing(config.name)) return;

    const body = entity.body;
    const tw = scene.managers.tile.map.tileWidth;
    const th = scene.managers.tile.map.tileHeight;

    if (!this.grid.has(key)) this.grid.set(key, new Map());

    this.grid.get(key)!.set(config.id, {
      x: Math.floor(body.x / tw),
      y: Math.floor(body.y / th),
      width: Math.ceil((body.x + body.width) / tw) - Math.floor(body.x / tw),
      height: Math.ceil((body.y + body.height) / th) - Math.floor(body.y / th),
    });

    this.dirty.add(config.map);
  }

  private _unregisterStatic(id: string, entity: Entity): void {
    if (!entity) return;

    const key = this._toChunkKey(entity.map, entity.x, entity.y);
    const chunk = this.grid.get(key);

    if (chunk) {
      chunk.delete(id);
      if (!chunk.size) this.grid.delete(key);
    }

    this.dirty.add(entity.map);
  }

  getMergedGrid(scene: Scene, map: MapName): number[][] {
    const cached = this.merged.get(map);
    if (cached && !this.dirty.has(map)) return cached;

    const tile = scene.managers.tile;
    if (!tile) return cached ?? [];

    const base = tile.getCollisionGrid();
    const grid = base.map((row) => [...row]);

    const prefix = `${map}:`;

    for (const [key, chunk] of this.grid) {
      if (!key.startsWith(prefix)) continue;

      for (const { x, y, width, height } of chunk.values())
        for (let dy = 0; dy < height; dy++)
          for (let dx = 0; dx < width; dx++)
            if (grid[y + dy]?.[x + dx] !== undefined) grid[y + dy][x + dx] = 1;
    }

    this.merged.set(map, grid);
    this.dirty.delete(map);

    return grid;
  }

  getStatic(map: MapName, x: number, y: number, radius: number = 2): Rect[] {
    const cx = Math.floor(x / CHUNK_PIXEL_SIZE);
    const cy = Math.floor(y / CHUNK_PIXEL_SIZE);

    const entities: Rect[] = [];

    for (let dx = -radius; dx <= radius; dx++)
      for (let dy = -radius; dy <= radius; dy++) {
        const chunk = this.grid.get(`${map}:${cx + dx}:${cy + dy}`);
        if (chunk) for (const rect of chunk.values()) entities.push(rect);
      }

    return entities;
  }

  private _toChunkKey(map: MapName, x: number, y: number): string {
    return `${map}:${Math.floor(x / CHUNK_PIXEL_SIZE)}:${Math.floor(y / CHUNK_PIXEL_SIZE)}`;
  }

  private _getChunkGroup(
    scene: Scene,
    key: string,
  ): Phaser.Physics.Arcade.StaticGroup {
    if (!this.groups.has(key)) {
      const group = scene.physics.add.staticGroup();
      const collider = scene.physics.add.collider(
        scene.managers.physics.groups.players,
        group,
      );
      this.groups.set(key, { group, collider });
    }

    return this.groups.get(key)!.group;
  }

  remove(id: string): void {
    this.queued.delete(id);

    const entity = this.entities.get(id);

    if (entity) {
      this._unregisterStatic(id, entity);
      entity.destroy();
      this.entities.delete(id);
    }
  }

  removeByMap(map: MapName): void {
    this.queue = this.queue.filter((c) => {
      if (c.map === map) {
        this.queued.delete(c.id);
        return false;
      }

      return true;
    });

    this.entities.forEach((entity, id) => {
      if (entity.map === map) {
        this._unregisterStatic(id, entity);
        entity.destroy();
        this.entities.delete(id);
      }
    });

    const prefix = `${map}:`;

    for (const [key, entry] of this.groups)
      if (key.startsWith(prefix)) {
        entry.collider.destroy();
        entry.group.destroy(true);
        this.groups.delete(key);
      }
  }

  deactivate(ids: string[]): void {
    const set = new Set(ids);

    this.queue = this.queue.filter((c) => {
      if (set.has(c.id)) {
        this.queued.delete(c.id);
        return false;
      }

      return true;
    });

    const affected = new Set<string>();

    for (const id of ids) {
      const entity = this.entities.get(id);
      if (!entity) continue;

      if (entity.isStatic) {
        const key = this._toChunkKey(entity.map, entity.x, entity.y);
        affected.add(key);
        this._unregisterStatic(id, entity);
      }

      entity.destroy();
      this.entities.delete(id);
    }

    for (const key of affected) {
      const entry = this.groups.get(key);

      if (entry && !entry.group.getLength()) {
        entry.collider.destroy();
        entry.group.destroy(true);
        this.groups.delete(key);
      }
    }
  }

  destroy(): void {
    this.queue.length = 0;
    this.queued.clear();
    this.grid.clear();
    this.merged.clear();
    this.dirty.clear();

    this.groups.forEach(({ group, collider }) => {
      collider.destroy();
      group.destroy(true);
    });
    this.groups.clear();

    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();
  }
}
