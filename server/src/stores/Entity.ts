import { EntityConfig, MapName } from "../types";

export class EntityStore {
  private entities: Map<string, EntityConfig> = new Map();

  add(id: string, config: EntityConfig): void {
    this.entities.set(id, config);
  }

  get(id: string): EntityConfig | undefined {
    return this.entities.get(id);
  }

  remove(id: string): void {
    this.entities.delete(id);
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
