import SocketManager from "../managers/Socket";
import { PlayerManager } from "../managers/Player";
import {
  EntityConfig,
  PlayerConfig,
  Input,
  EntityPickup,
  EntityDestroy,
  Hit,
} from "@server/types";
import { PhsyicsManager } from "../managers/Physics";
import { EntityManager } from "../managers/Entity";
import { TileManager } from "../managers/Tile";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhsyicsManager;
  public playerManager!: PlayerManager;
  public entityManager!: EntityManager;
  public tileManager!: TileManager;
  public socketManager = SocketManager;

  create(): void {
    this.physicsManager = new PhsyicsManager(this);
    this.playerManager = new PlayerManager(this);
    this.entityManager = new EntityManager(this);

    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();

    /**
     * We should register this from within the player
     */
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      this.playerManager.player?.inputManager?.setTarget({
        x: target.x,
        y: target.y,
      });
    });
  }

  update(_time: number, delta: number): void {
    this.playerManager.update();
    this.entityManager.update();
    this.tileManager.update(delta);
  }

  private _registerEvents(): void {
    /**
     * Players
     */
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);

      const player = this.playerManager.player!;
      this.cameras.main.startFollow(player, false);
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

    this.socketManager.on("player:hurt", (data: any) => {
      console.log("Player hurt", data);
    })

    this.game.events.on("player:input", (data: Input) => {
      this.socketManager.emit("player:input", data);
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

    this.socketManager.on("entity:hurt", (data: any) => {
      console.log("Entity hurt", data);
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

  shutdown(): void {
    this.socketManager.off("player:create:local");
    this.socketManager.off("player:create:others");
    this.socketManager.off("player:create");
    this.socketManager.off("player:left");
    this.socketManager.off("player:input");
    this.socketManager.off("player:hurt");

    this.socketManager.off("entity:create");
    this.socketManager.off("entity:create:all");
    this.socketManager.off("entity:destroy");
    this.socketManager.off("entity:hurt");

    this.game.events.off("player:input");
    this.game.events.off("entity:pickup");
    
    this.game.events.off("hit");

    this.playerManager.destroy();
    this.socketManager.disconnect();
    this.tileManager.destroy();
  }
}
