import { EntityConfig, MapName, SpawnerState } from "../types";

export class EntityStore {
  private entities: Map<string, EntityConfig> = new Map();
  public readonly spawners: Map<string, SpawnerState> = new Map();

  add(id: string, config: EntityConfig): void {
    this.entities.set(id, config);

    if (config.spawner || config.textureSpawner)
      this.spawners.set(id, { lastAt: Date.now(), children: new Set() });
  }

  get(id: string): EntityConfig | undefined {
    return this.entities.get(id);
  }

  remove(id: string): void {
    this.entities.delete(id);
    this.spawners.delete(id);
  }

  update(id: string, updates: Partial<EntityConfig>): void {
    const entity = this.entities.get(id);
    if (entity) Object.assign(entity, updates);
  }

  get all(): EntityConfig[] {
    return [...this.entities.values()];
  }

  getByMap(map: MapName): EntityConfig[] {
    return [...this.entities.values()].filter((entity) => entity.map === map);
  }
}
