import { Entity } from "../Entity";
import { Villain } from "../Villain";
import { Scene } from "../scenes/Scene";
import EventBus from "../EventBus";
import { ComponentName, EntityName, Event } from "@server/types";
import { configs } from "@server/configs";

export class InterfaceManager {
  private scene: Scene;
  private last: string = "";
  private boss = { visible: false, health: -1, maxHealth: -1 };

  constructor(scene: Scene) {
    this.scene = scene;
    scene.events.on(Phaser.Scenes.Events.SLEEP, () => this._boss(null));
  }

  update(): void {
    const player = this.scene.managers.players.player;

    if (!player || player.map !== this.scene.scene.key) {
      if (this.last !== "[]") {
        this.last = "[]";
        EventBus.emit(Event.ENTITIES_UPDATE, []);
      }

      this._boss(null);
      return;
    }

    const key = this.scene.scene.key;
    const entities: Entity[] = [];
    let villain: Villain | null = null;

    this.scene.managers.entities.entities.forEach((entity) => {
      if (entity.map !== key || !entity.hasComponent(ComponentName.DAMAGEABLE))
        return;

      if (entity.name === EntityName.VILLAIN && entity instanceof Villain)
        villain = entity;
      else entities.push(entity);
    });

    this.scene.managers.players.others.forEach((entity) => {
      if (entity.map === key && entity.hasComponent(ComponentName.DAMAGEABLE))
        entities.push(entity);
    });

    this._boss(villain);

    const data = this._getScreenData(entities, player);
    const key2 = JSON.stringify(data);

    if (key2 === this.last) return;
    this.last = key2;

    EventBus.emit(Event.ENTITIES_UPDATE, data);
  }

  private _boss(villain: Villain | null): void {
    const visible =
      !!villain &&
      villain.active &&
      villain.health > 0 &&
      (villain.isEngaged || villain.health < villain.maxHealth);

    const health = visible ? villain!.health : -1;
    const maxHealth = visible ? villain!.maxHealth : -1;
    const boss = this.boss;

    if (
      boss.visible === visible &&
      boss.health === health &&
      boss.maxHealth === maxHealth
    )
      return;

    boss.visible = visible;
    boss.health = health;
    boss.maxHealth = maxHealth;

    EventBus.emit(
      Event.BOSS_UPDATE,
      visible
        ? {
            name:
              configs.entities[EntityName.VILLAIN]?.metadata?.name ?? "",
            health,
            maxHealth,
          }
        : null,
    );
  }

  private _getScreenData(
    entities: Entity[],
    center: Entity,
  ): Array<{
    id: string;
    health: number;
    maxHealth: number;
    x: number;
    y: number;
  }> {
    const camera = this.scene.cameraManager;

    return entities
      .filter((e) => e.active && e.health < e.maxHealth)
      .map((e) => ({
        id: e.id,
        health: e.health,
        maxHealth: e.maxHealth,
        ...camera.getScreenPosition(e.x, e.y, center),
      }));
  }
}
