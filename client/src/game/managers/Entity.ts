import { Direction, EntityConfig, EntityName, StateName } from "@server/types";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { Idle } from "../state/Idle";
import { Walking } from "../state/Walking";
import { Running } from "../state/Running";
import { Slashing } from "../state/Slashing";

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
    /**
     * We should introduce a factory pattern here later on
     */
    const entity = new Entity(
      this.scene,
      config.x,
      config.y,
      `${EntityName.ORC1}-${StateName.IDLE}`,
      config.id,
      EntityName.ORC1,
      Direction.DOWN,
      [],
      new Map([
        [StateName.IDLE, new Idle()],
        [StateName.WALKING, new Walking()],
        [StateName.RUNNING, new Running()],
        [StateName.SLASHING, new Slashing()],
      ])
    );

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
