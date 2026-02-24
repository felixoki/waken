import { EntityManager } from "../managers/Entity";
import { PlayerManager } from "../managers/Player";
import SocketManager from "../managers/Socket";
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
  Item,
  Transition,
  Spot,
  BehaviorName,
} from "@server/types";
import EventBus from "../EventBus";
import { handlers } from "../handlers";
import { InventoryComponent } from "../components/Inventory";
import { HotbarComponent } from "../components/Hotbar";
import { DialogueResponse, NodeId } from "@server/types/dialogue";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { Attack } from "../behavior/Attack";
import { DamageableComponent } from "../components/Damageable";
import { effects } from "../effects";

export class MainScene extends Phaser.Scene {
  public playerManager!: PlayerManager;
  public entityManager!: EntityManager;
  public socketManager = SocketManager;

  constructor() {
    super("main");
  }

  create(): void {
    this.cameras.main.setVisible(false);

    this.playerManager = new PlayerManager(this);
    this.entityManager = new EntityManager(this);

    const scenes = [MapName.VILLAGE, MapName.HERBALIST_HOUSE, MapName.HOME, MapName.REALM];
    const ready = new Set<string>();

    scenes.forEach((key) => {
      const scene = this.scene.get(key);

      scene.events.once(Phaser.Scenes.Events.CREATE, () => {
        ready.add(key);

        if (ready.size === scenes.length) {
          this._registerEvents();
          this.socketManager.emit("player:create");
        }
      });
    });

    scenes.forEach((key) => {
      this.scene.launch(key);
      this.scene.get(key).scene.setVisible(false);
    });

    if (scenes.length) this.scene.bringToTop(MapName.REALM);
  }

  update(_time: number, _delta: number): void {
    this.playerManager.update();
    this.entityManager.update();
  }

  private _registerEvents(): void {
    /**
     * Players
     */
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);

      const map = this.scene.get(data.map);
      map.scene.setVisible(true);

      const player = this.playerManager.player!;

      this.game.events.emit("camera:follow", { key: data.map, player });
    });

    this.socketManager.on("player:create:others", (data: PlayerConfig[]) => {
      data.forEach((config) => {
        this.playerManager.add(config, false);
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

    this.socketManager.on("player:transition", (data: PlayerConfig) => {
      const player = this.playerManager.player;

      if (!player) return;

      const prev = {
        inventory: player
          .getComponent<InventoryComponent>(ComponentName.INVENTORY)
          ?.get(),
        hotbar: player
          .getComponent<HotbarComponent>(ComponentName.HOTBAR)
          ?.get(),
        map: player.map,
        scene: player.scene,
      };

      this.playerManager.remove(player.id);
      this.playerManager.add(data, true);

      const updated = this.playerManager.player!;

      updated.isLocked = false;
      updated
        .getComponent<InventoryComponent>(ComponentName.INVENTORY)
        ?.set(prev.inventory!);
      updated
        .getComponent<HotbarComponent>(ComponentName.HOTBAR)
        ?.set(prev.hotbar);

      const scene = this.scene.get(data.map);

      prev.scene.scene.setVisible(false);
      scene.scene.setVisible(true);

      this.game.events.emit("camera:follow", {
        key: data.map,
        player: updated,
      });
    });

    this.socketManager.on("player:host:transfer", () => {
      const player = this.playerManager.player;
      if (!player) return;

      player.isHost = true;
    });

    this.game.events.on("player:input", (data: Input) => {
      this.socketManager.emit("player:input", data);
    });

    this.game.events.on("player:transition", (data: Transition) => {
      const player = this.playerManager.player;
      if (!player) return;

      player.isLocked = true;

      this.socketManager.emit("player:transition", data);
    });

    /**
     * Entities
     */
    this.socketManager.on("entity:create", (data: EntityConfig) => {
      this.entityManager.add(data);
    });

    this.socketManager.on("entity:create:all", (data: EntityConfig[]) => {
      data.forEach((config) => {
        this.entityManager.add(config);
      });
    });

    this.socketManager.on("entity:destroy", (data: EntityDestroy) => {
      const entity = this.entityManager.entities.get(data.id);

      if (entity) {
        const damageable = entity.getComponent<DamageableComponent>(
          ComponentName.DAMAGEABLE,
        );

        if (damageable)
          effects.emitters.death(entity.scene, entity.x, entity.y);
      }

      this.entityManager.remove(data.id);
    });

    this.socketManager.on("entity:input", (data: Partial<Input>) => {
      const entity = this.entityManager.get(data.id!);
      entity?.update(data);
    });

    this.socketManager.on("entity:hurt", (data: Hurt) => {
      const entity = this.entityManager.entities.get(data.id);
      if (!entity) return;

      handlers.combat.hurt(entity, data.health);
      handlers.combat.knockback(entity, data.knockback);
    });

    this.socketManager.on(
      "entity:dialogue:response",
      (data: DialogueResponse) => {
        handlers.dialogue.start(data);
      },
    );

    this.socketManager.on("entity:spotted:player", (data: Spot) => {
      const entity = this.entityManager.get(data.entityId);
      if (!entity) return;

      const queue = entity.getComponent<BehaviorQueue>(
        ComponentName.BEHAVIOR_QUEUE,
      );
      if (!queue) return;

      const attack = queue.get<Attack>(BehaviorName.ATTACK);
      if (!attack) return;

      attack.start(data.playerId);
      queue.shiftTo(BehaviorName.ATTACK);
    });

    this.game.events.on("entity:input", (data: Partial<Input>) => {
      this.socketManager.emit("entity:input", data);
    });

    this.game.events.on("entity:pickup", (data: EntityPickup) => {
      this.socketManager.emit("entity:pickup", data);
    });

    this.game.events.on("entity:dialogue:start", (data: string) => {
      this.socketManager.emit("entity:dialogue:iterate", {
        entityId: data,
        nodeId: NodeId.GREETING,
      });
    });

    this.game.events.on("entity:spotted:player", (data: Spot) => {
      this.socketManager.emit("entity:spotted:player", data);
    });

    EventBus.on(
      "entity:dialogue:choice",
      (data: { entityId: string; nodeId: NodeId }) => {
        this.socketManager.emit("entity:dialogue:iterate", data);
      },
    );

    EventBus.on("entity:collection:request", (data: string) => {
      const entity = this.entityManager.get(data);
      if (!entity) return;

      handlers.collection.open(entity);
    });

    /**
     * Items
     */
    this.socketManager.on("item:remove", (data: Item) => {
      const player = this.playerManager.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      if (!inventory) return;

      inventory.remove(data.name, data.quantity);
    });

    EventBus.on("item:collect", (data: Item) => {
      this.socketManager.emit("item:collect", data);
    });

    /**
     * Shared
     */
    this.game.events.on("hit", (data: Hit) => {
      this.socketManager.emit("hit", data);
    });
  }

  shutdown(): void {
    this.socketManager.disconnect();
  }
}
