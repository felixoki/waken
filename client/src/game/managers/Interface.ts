import { ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import EventBus from "../EventBus";

export class InterfaceManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  update(): void {
    const entities = [
      ...this.scene.entityManager.entities.values(),
      ...this.scene.playerManager.others.values(),
    ].filter((entity) => entity.getComponent(ComponentName.DAMAGEABLE));

    const player = this.scene.playerManager.player!;
    const data = this._getScreenData(entities, player);

    EventBus.emit("entities:update", data);
  }

  private _getScreenData(
    entities: Entity[],
    center: Entity,
  ): Array<{
    id: string;
    health: number;
    x: number;
    y: number;
  }> {
    const camera = this.scene.cameraManager;

    return entities
      .filter((e) => e.active)
      .map((e) => ({
        id: e.id,
        health: e.health,
        ...camera.getScreenPosition(e.x, e.y, center),
      }));
  }
}
