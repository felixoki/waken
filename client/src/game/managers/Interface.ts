import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import EventBus from "../EventBus";
import { ComponentName } from "@server/types";

export class InterfaceManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  update(): void {
    const player = this.scene.managers.players.player;
    if (!player || player.map !== this.scene.scene.key) return;

    const key = this.scene.scene.key;
    const entities: Entity[] = [];

    this.scene.managers.entities.entities.forEach((entity) => {
      if (entity.map === key && entity.hasComponent(ComponentName.DAMAGEABLE))
        entities.push(entity);
    });

    this.scene.managers.players.others.forEach((entity) => {
      if (entity.map === key && entity.hasComponent(ComponentName.DAMAGEABLE))
        entities.push(entity);
    });

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
