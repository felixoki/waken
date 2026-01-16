import { EntityConfig } from "@server/types";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { Factory } from "../factory/Factory";
import { configs } from "@server/configs";

export class EntityManager {
  private scene: Scene;
  public entities: Map<string, Entity> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Entities can receive exclusive updates from the server
   */
  updateOne(): void {}

  update(): void {
    this.entities.forEach((entity) => entity.update());
  }

  add(config: EntityConfig): void {
    const definition = configs.definitions[config.name];
    const entity = Factory.create(this.scene, { ...config, ...definition! });

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
    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();
  }
}
