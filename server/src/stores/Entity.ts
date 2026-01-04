import { MapName, PlayerConfig } from "../types";

export class EntityStore {
  private entities: Map<string, any> = new Map();

  add(id: string, config: any): void {
    this.entities.set(id, config);
  }

  get(id: string): any | undefined {
    return this.entities.get(id);
  }

  remove(id: string): void {
    this.entities.delete(id);
  }

  update(id: string, updates: Partial<any>): void {
    const entity = this.entities.get(id);
    if (entity) Object.assign(entity, updates);
  }

  getAll(): any[] {
    return Array.from(this.entities.values());
  }

  getByMap(map: MapName): PlayerConfig[] {
    return Array.from(this.entities.values()).filter(
      (entity) => entity.map === map
    );
  }
}
