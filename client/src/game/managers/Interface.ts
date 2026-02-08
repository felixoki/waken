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

    const all = [
      ...this.scene.managers.entities.all,
      ...this.scene.managers.players.others.values(),
    ].filter(
      (entity) =>
        entity &&
        entity.map === this.scene.scene.key &&
        entity.getComponent(ComponentName.DAMAGEABLE),
    );

    const data = this._getScreenData(all, player);
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
