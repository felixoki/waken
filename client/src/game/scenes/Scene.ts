import SocketManager from "../managers/Socket";
import { PlayerManager } from "../managers/Player";
import {
  EntityConfig,
  PlayerConfig,
  Input,
  EntityPickup,
  EntityDestroy,
  Hit,
  Hurt,
  MapName,
  ComponentName,
} from "@server/types";
import { PhsyicsManager } from "../managers/Physics";
import { EntityManager } from "../managers/Entity";
import { TileManager } from "../managers/Tile";
import EventBus from "../EventBus";
import { handlers } from "../handlers";
import { CameraManager } from "../managers/Camera";
import { InventoryComponent } from "../components/Inventory";
import { HotbarComponent } from "../components/Hotbar";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhsyicsManager;
  public playerManager!: PlayerManager;
  public entityManager!: EntityManager;
  public tileManager!: TileManager;
  public cameraManager!: CameraManager;
  public socketManager = SocketManager;

  create(): void {
    this.physicsManager = new PhsyicsManager(this);
    this.playerManager = new PlayerManager(this);
    this.entityManager = new EntityManager(this);
    this.cameraManager = new CameraManager(this);

    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();

    /**
     * We should register this from within the player
     */
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const target = this.cameraManager.getWorldPoint(pointer.x, pointer.y);

      this.playerManager.player?.inputManager?.setTarget({
        x: target.x,
        y: target.y,
      });
    });
  }

  update(_time: number, delta: number): void {
    this.playerManager.update();
    this.entityManager.update();
    this.tileManager?.update(delta);

    this._updateInterface();
  }

  private _registerEvents(): void {
    /**
     * Players
     */
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);
      
      const player = this.playerManager.player!;
      const existing = this.registry.get("player");

      if (existing) {
        const inventory = player.getComponent<InventoryComponent>(
          ComponentName.INVENTORY
        );
        const hotbar = player.getComponent<HotbarComponent>(
          ComponentName.HOTBAR
        );

        inventory?.set(existing.inventory);
        hotbar?.set(existing.hotbar);

        this.registry.remove("player");
      }

      this.cameraManager.follow(player);
    });

    this.socketManager.on("player:create:others", (data: PlayerConfig[]) => {
      data.forEach((player) => {
        this.playerManager.add(player, false);
      });
    });

    this.socketManager.on("player:create", (data: PlayerConfig) => {
      this.playerManager.add(data, false);
    });

    this.socketManager.on("player:left", (data: { id: string }) => {
      this.playerManager.remove(data.id);
    });

    this.socketManager.on("player:input", (data: Input) => {
      this.playerManager.updateOther(data);
    });

    this.socketManager.on("player:hurt", (data: Hurt) => {
      const player =
        this.playerManager.others.get(data.id) || this.playerManager.player;

      if (!player) return;

      handlers.combat.hurt(player, data.health);
      handlers.combat.knockback(player, data.knockback);
    });

    this.socketManager.on("player:transition", (data: MapName) => {
      const player = this.playerManager.player;

      const inventory = player?.getComponent<InventoryComponent>(
        ComponentName.INVENTORY
      );
      const hotbar = player?.getComponent<HotbarComponent>(
        ComponentName.HOTBAR
      );

      this.registry.set("player", {
        inventory: inventory?.get(),
        hotbar: hotbar?.get(),
      });

      this._unregisterEvents();

      this.scene.stop();
      this.scene.start(data);
    });

    this.game.events.on("player:input", (data: Input) => {
      this.socketManager.emit("player:input", data);
    });

    this.game.events.on("player:transition", (data: { to: MapName }) => {
      this.socketManager.emit("player:transition", data.to);
    });

    /**
     * Entities
     */
    this.socketManager.on("entity:create", (data: EntityConfig) => {
      this.entityManager.add(data);
    });

    this.socketManager.on("entity:create:all", (data: EntityConfig[]) => {
      data.forEach((entity) => {
        this.entityManager.add(entity);
      });
    });

    this.socketManager.on("entity:destroy", (data: EntityDestroy) => {
      this.entityManager.remove(data.id);
    });

    this.socketManager.on("entity:hurt", (data: Hurt) => {
      const entity = this.entityManager.entities.get(data.id);

      if (!entity) return;

      handlers.combat.hurt(entity, data.health);
      handlers.combat.knockback(entity, data.knockback);
    });

    this.game.events.on("entity:pickup", (data: EntityPickup) => {
      this.socketManager.emit("entity:pickup", data);
    });

    /**
     * Shared
     */
    this.game.events.on("hit", (data: Hit) => {
      this.socketManager.emit("hit", data);
    });

    /**
     * Shutdown
     */
    this.game.events.once("destroy", this.shutdown, this);
  }

  /**
   * This should be interfaceManager.update() later on
   */
  private _updateInterface(): void {
    const entities = [
      ...this.entityManager.entities.values(),
      ...this.playerManager.others.values(),
    ];
    const player = this.playerManager.player;

    const data = this.cameraManager.getInterfaceData(entities, player!);
    EventBus.emit("entities:update", data);
  }

  private _unregisterEvents(): void {
    this.input.off("pointerdown");

    this.socketManager.off("player:create:local");
    this.socketManager.off("player:create:others");
    this.socketManager.off("player:create");
    this.socketManager.off("player:left");
    this.socketManager.off("player:input");
    this.socketManager.off("player:hurt");
    this.socketManager.off("player:transition");

    this.socketManager.off("entity:create");
    this.socketManager.off("entity:create:all");
    this.socketManager.off("entity:destroy");
    this.socketManager.off("entity:hurt");

    this.game.events.off("player:input");
    this.game.events.off("player:transition");
    this.game.events.off("entity:pickup");

    this.game.events.off("hit");
  }

  shutdown(): void {
    this._unregisterEvents();

    this.playerManager.destroy();
    this.entityManager.destroy();
    this.tileManager?.destroy();
    this.socketManager.disconnect();
  }
}
