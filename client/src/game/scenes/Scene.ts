import SocketManager from "../managers/Socket";
import { PlayerManager } from "../managers/Player";
import {
  EntityConfig,
  EntityHit,
  PlayerConfig,
  PlayerHit,
  Input,
} from "@server/types";
import { PhsyicsManager } from "../managers/Physics";
import { EntityManager } from "../managers/Entity";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhsyicsManager;
  public playerManager!: PlayerManager;
  public entityManager!: EntityManager;
  public socketManager = SocketManager;

  create(): void {
    this.physicsManager = new PhsyicsManager(this);
    this.playerManager = new PlayerManager(this);
    this.entityManager = new EntityManager(this);

    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();
  }

  update(): void {
    this.playerManager.update();
    this.entityManager.update();
  }

  private _registerEvents(): void {
    /**
     * Players
     */
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);
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

    this.game.events.on("player:input", (data: Input) => {
      this.socketManager.emit("player:input", data);
    });

    this.game.events.on("player:hit", (data: PlayerHit) => {
      this.socketManager.emit("player:hit", data);
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

    this.game.events.on("entity:hit", (data: EntityHit) => {
      this.socketManager.emit("entity:hit", data);
    });

    /**
     * Shutdown
     */
    this.game.events.once("destroy", this.shutdown, this);
  }

  shutdown(): void {
    this.socketManager.off("player:create:local");
    this.socketManager.off("player:create:others");
    this.socketManager.off("player:create");
    this.socketManager.off("player:left");
    this.socketManager.off("player:input");
    this.socketManager.off("entity:create");
    this.socketManager.off("entity:create:all");

    this.game.events.off("player:input");
    this.game.events.off("player:hit");
    this.game.events.off("entity:hit");

    this.playerManager.destroy();
    this.socketManager.disconnect();
  }
}
