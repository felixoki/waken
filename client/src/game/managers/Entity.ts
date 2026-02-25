import { EntityConfig, MapName } from "@server/types";
import { Entity } from "../Entity";
import { Factory } from "../factory/Factory";
import { configs } from "@server/configs";
import { Scene } from "../scenes/Scene";
import type { MainScene } from "../scenes/Main";

export class EntityManager {
  public entities: Map<string, Entity> = new Map();
  private main: MainScene;

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
    this.entities.forEach((entity) => {
      if (!entity.isStatic) entity.update();
    });
  }

  add(config: EntityConfig): void {
    const scene = this.main.scene.get(config.map) as Scene;

    if (!scene?.physicsManager) return;

    const definition = configs.definitions[config.name];
    const entity = Factory.create(scene, { ...config, ...definition! });

    entity.map = config.map;
    this.entities.set(config.id, entity);
  }

  remove(id: string): void {
    const entity = this.entities.get(id);

    if (entity) {
      entity.destroy();
      this.entities.delete(id);
    }
  }

  removeByMap(map: MapName): void {
    this.entities.forEach((entity, id) => {
      if (entity.map === map) {
        entity.destroy();
        this.entities.delete(id);
      }
    });
  }

  destroy(): void {
    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();
  }

  getStatic(
    scene: Scene,
    width: number,
    height: number,
  ): Array<{ x: number; y: number; width: number; height: number }> {
    return [...this.entities.values()].flatMap((entity) => {
      if (entity.scene !== scene) return [];

      const body = entity.body;
      if (!entity.body) return [];

      const left = body.x;
      const top = body.y;
      const right = body.x + body.width;
      const bottom = body.y + body.height;

      const startX = Math.floor(left / width);
      const startY = Math.floor(top / height);
      const endX = Math.ceil(right / width);
      const endY = Math.ceil(bottom / height);

      return [
        {
          x: startX,
          y: startY,
          width: endX - startX,
          height: endY - startY,
        },
      ];
    });
  }
}
