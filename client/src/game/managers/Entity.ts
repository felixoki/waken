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

  private _drain(): void {
    const start = performance.now();

    while (
      this.queue.length &&
      performance.now() - start < CHUNK_ACTIVATION_BUDGET
    ) {
      const config = this.queue[0];

      if (this.entities.has(config.id)) {
        this.queue.shift();
        this.queued.delete(config.id);
        continue;
      }

      const scene = this.main.scene.get(config.map) as Scene;
      if (!scene?.managers?.physics) break;

      this.queue.shift();
      this.queued.delete(config.id);
      this._create(config);
    }
  }

  private _create(config: EntityConfig): void {
    if (this.entities.has(config.id)) return;

    const scene = this.main.scene.get(config.map) as Scene;
    if (!scene?.managers?.physics) return;

    const definition = configs.entities[config.name];
    const entity = Factory.create(scene, { ...config, ...definition! });

    entity.map = config.map;
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
  }

  private _unregisterStatic(id: string, entity: Entity): void {
    if (!entity) return;

    const key = this._toChunkKey(entity.map, entity.x, entity.y);
    const chunk = this.grid.get(key);

    if (chunk) {
      chunk.delete(id);
      if (!chunk.size) this.grid.delete(key);
    }
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

    this.groups.forEach(({ group, collider }) => {
      collider.destroy();
      group.destroy(true);
    });
    this.groups.clear();

    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();
  }
}
