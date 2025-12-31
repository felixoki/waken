import { EntityConfig } from "@server/types";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { Factory } from "../factory/Factory";

export class EntityManager {
  private scene: Scene;
  private entities: Map<string, Entity> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Entities should receive data from the server
   */
  updateOne(): void {}

  update(): void {
    for (const entity of this.entities.values()) entity.update();
  }

  add(config: EntityConfig): void {
    const entity = Factory.create(this.scene, config);

    this.scene.physicsManager.groups.entities.add(entity);
    this.entities.set(config.id, entity);
  }

  remove(id: string): void {
    const entity = this.entities.get(id);

    if (entity) {
      entity.destroy();
      this.entities.delete(id);
    }
  }

  destroy(): void {
    for (const entity of this.entities.values()) entity.destroy();
    this.entities.clear();
  }
}
