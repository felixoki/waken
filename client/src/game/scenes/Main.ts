import { EntityManager } from "../managers/Entity";
import { PlayerManager } from "../managers/Player";
import SocketManager from "../managers/Socket";
import {
  EntityConfig,
  PlayerConfig,
  Input,
  Hit,
  Hurt,
  MapName,
  ComponentName,
  Item,
  Transition,
  Spot,
  Party,
  TimePhase,
  StateName,
  Death,
} from "@server/types";
import EventBus from "../EventBus";
import { handlers } from "../handlers";
import { InventoryComponent } from "../components/Inventory";
import { DialogueResponse, NodeId } from "@server/types/dialogue";
import { DamageableComponent } from "../components/Damageable";
import { effects } from "../effects";
import { AmbienceManager } from "../managers/Ambience";
import { ChunkManager } from "../managers/Chunk";
import { Player } from "../Player";

export class MainScene extends Phaser.Scene {
  public playerManager!: PlayerManager;
  public entityManager!: EntityManager;
  public ambienceManager!: AmbienceManager;
  public chunkManager!: ChunkManager;
  public socketManager = SocketManager;
  public spectate: Player | null = null;

  constructor() {
    super("main");
  }

  get managers() {
    return {
      players: this.playerManager,
      entities: this.entityManager,
      ambience: this.ambienceManager,
      socket: this.socketManager,
      chunks: this.chunkManager,
    };
  }

  create(): void {
    this.cameras.main.setVisible(false);

    this.playerManager = new PlayerManager(this);
    this.entityManager = new EntityManager(this);
    this.ambienceManager = new AmbienceManager(this);
    this.chunkManager = new ChunkManager();

    const scenes = [
      MapName.VILLAGE,
      MapName.HERBALIST_HOUSE,
      MapName.HOME,
      MapName.BLACKSMITH_HOUSE,
      MapName.TAVERN,
      MapName.GLASSBLOWER_HOUSE,
    ];
    const ready = new Set<string>();

    scenes.forEach((key) => {
      const scene = this.scene.get(key);

      scene.events.once(Phaser.Scenes.Events.CREATE, () => {
        scene.scene.setVisible(false);
        scene.input.enabled = false;
        ready.add(key);

        if (ready.size === scenes.length) {
          this._registerEvents();
          this.socketManager.emit("player:create");
        }
      });
    });

    scenes.forEach((key) => {
      this.scene.launch(key);
    });

    if (scenes.length) this.scene.bringToTop(MapName.VILLAGE);
  }

  update(_time: number, _delta: number): void {
    const player = this.playerManager.player;
    const target = this.spectate || player;

    if (target) {
      const positions = [{ map: target.map, x: target.x, y: target.y }];

      if (player?.isAuthority)
        for (const other of this.playerManager.others.values())
          if (other.map === target.map)
            positions.push({ map: other.map, x: other.x, y: other.y });

      const changed = this.chunkManager.updateFromPositions(positions);

      if (changed && this.spectate)
        this.socketManager.emit("player:spectate", {
          targetId: this.spectate.id,
        });
    }

    this.playerManager.update();
    this.entityManager.update();
  }

  private _registerEvents(): void {
    /**
     * World
     */
    this.socketManager.on("world:time", (data: { phase: TimePhase }) => {
      this.ambienceManager.setPhase(data.phase, false);
    });

    this.socketManager.on("world:phase", (data: TimePhase) => {
      this.ambienceManager.setPhase(data, true);
    });

    /**
     * Players
     */
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);

      const map = this.scene.get(data.map);
      map.scene.setVisible(true);
      map.input.enabled = true;

      const player = this.playerManager.player!;

      this.game.events.emit("camera:follow", { key: data.map, player });

      EventBus.emit("player:create:local", data.id);
      EventBus.emit("player:health", player.health);
      EventBus.emit("player:mana", player.mana);
    });

    this.socketManager.on("player:create:others", (data: PlayerConfig[]) => {
      data.forEach((config) => {
        this.playerManager.add(config, false);
      });
    });

    this.socketManager.on("player:create", (data: PlayerConfig) => {
      this.playerManager.add(data, false);
    });

    this.socketManager.on("player:leave", (data: string) => {
      this.playerManager.remove(data);
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

      if (player === this.playerManager.player)
        EventBus.emit("player:health", player.health);
    });

    this.socketManager.on("player:transition", (data: PlayerConfig) => {
      handlers.player.transition(data, this);
    });

    this.socketManager.on("player:authority", (data: boolean) => {
      const player = this.playerManager.player;
      if (!player) return;

      player.isAuthority = data;
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
      this.entityManager.batch(data);
    });

    this.socketManager.on("entity:destroy", (data: string) => {
      const entity = this.entityManager.entities.get(data);

      if (entity) {
        const damageable = entity.getComponent<DamageableComponent>(
          ComponentName.DAMAGEABLE,
        );

        if (damageable) effects.emitters.dissolve(entity);
      }

      this.entityManager.remove(data);
    });

    this.socketManager.on("entity:despawn", (data: string) => {
      this.entityManager.remove(data);
    });

    this.socketManager.on("entity:input", (data: Partial<Input>) => {
      const entity = this.entityManager.get(data.id!);
      entity?.update(data);
    });

    this.socketManager.on("entity:hurt", (data: Hurt) => {
      const entity = this.entityManager.entities.get(data.id);
      if (!entity) return;

      handlers.behavior.react(entity, data.attackerId);
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

      handlers.behavior.react(entity, data.playerId);
    });

    this.game.events.on("entity:input", (data: Partial<Input>) => {
      this.socketManager.emit("entity:input", data);
    });

    this.game.events.on("entity:pickup", (data: string) => {
      this.socketManager.emit("entity:pickup", data);
    });

    this.game.events.on("entity:plant", (data: any) => {
      this.socketManager.emit("entity:plant", data);
    });

    this.game.events.on("entity:harvest", (data: any) => {
      this.socketManager.emit("entity:harvest", data);
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

    this.game.events.on("entity:flee", (data: string) => {
      this.socketManager.emit("entity:flee", data);
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
     * Chunks
     */
    this.socketManager.on("chunk:deactivate", (data: string[]) => {
      this.entityManager.deactivate(data);
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
     * Economy
     */
    this.socketManager.on("economy:update", (data: Record<string, number>) => {
      EventBus.emit("economy:update", data);
    });

    /**
     * Shared
     */
    this.game.events.on("hit", (data: Hit) => {
      this.socketManager.emit("hit", data);
    });

    /**
     * Party
     */
    this.socketManager.on("party:start:loading", () => {
      EventBus.emit("party:start:loading");
    });

    this.socketManager.on(
      "party:start",
      (data: {
        tilemap: any;
        spawn: { x: number; y: number };
        entities: EntityConfig[];
        players: PlayerConfig[];
      }) => {
        this.cache.tilemap.add(MapName.REALM, {
          format: Phaser.Tilemaps.Formats.TILED_JSON,
          data: data.tilemap,
        });

        this.scene.launch(MapName.REALM);

        const scene = this.scene.get(MapName.REALM);

        scene.events.once(Phaser.Scenes.Events.CREATE, () => {
          this.entityManager.batch(data.entities);

          const localId = this.playerManager.player?.id;
          const config = data.players.find((p) => p.id === localId);

          if (config) {
            this.scene.bringToTop(MapName.REALM);
            handlers.player.transition(config, this);
          } else scene.scene.setVisible(false);

          data.players
            .filter((p) => p.id !== localId)
            .forEach((config) => this.playerManager.add(config, false));

          EventBus.emit("party:start:ready");
        });
      },
    );

    this.socketManager.on("party:list", (data: Party[]) => {
      EventBus.emit("party:list", data);
    });

    this.socketManager.on("party:create", (data: Party) => {
      EventBus.emit("party:create", data);
    });

    this.socketManager.on("party:update", (data: Party) => {
      EventBus.emit("party:update", data);
    });

    this.socketManager.on("party:leave", () => {
      EventBus.emit("party:leave");
    });

    EventBus.on("party:create:request", () => {
      this.socketManager.emit("party:create");
    });

    EventBus.on("party:join:request", (id: string) => {
      this.socketManager.emit("party:join", id);
    });

    EventBus.on("party:leave:request", () => {
      this.socketManager.emit("party:leave");
    });

    EventBus.on("party:start:request", () => {
      this.socketManager.emit("party:start");
    });

    /**
     * Death
     */
    this.socketManager.on("player:death", (data: Death) => {
      const isLocal = this.playerManager.player?.id === data.id;
      const player = isLocal
        ? this.playerManager.player
        : this.playerManager.others.get(data.id);

      if (player) player.transitionTo(StateName.DEAD);

      if (isLocal && this.playerManager.player) {
        const inventory =
          this.playerManager.player.getComponent<InventoryComponent>(
            ComponentName.INVENTORY,
          );

        if (inventory) inventory.set(new Array(20).fill(null));

        EventBus.emit("player:health", 0);
      }

      EventBus.emit("player:death", data);
    });

    this.socketManager.on(
      "player:revive",
      (data: { id: string; x: number; y: number; health: number }) => {
        const isLocal = this.playerManager.player?.id === data.id;
        const player = isLocal
          ? this.playerManager.player
          : this.playerManager.others.get(data.id);

        if (player) {
          player.setPosition(data.x, data.y);
          player.health = data.health;
          player.transitionTo(StateName.IDLE);
        }

        if (isLocal) {
          EventBus.emit("player:health", data.health);

          this.spectate = null;

          this.game.events.emit("camera:follow", {
            key: this.playerManager.player!.map,
            player: this.playerManager.player!,
          });
        }

        EventBus.emit("player:revive", data);
      },
    );

    this.socketManager.on("player:mana", (mana: number) => {
      const player = this.playerManager.player;
      if (!player) return;

      player.mana = mana;
      EventBus.emit("player:mana", mana);
    });

    this.socketManager.on("player:inventory:wipe", () => {
      const player = this.playerManager.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(new Array(20).fill(null));
    });

    this.socketManager.on("party:wipe", () => {
      const player = this.playerManager.player;
      if (!player) return;

      this.spectate = null;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(new Array(20).fill(null));

      EventBus.emit("party:wipe");
    });

    EventBus.on("player:revive:request", (id: string) => {
      this.socketManager.emit("player:revive", { id });
    });

    EventBus.on("player:spectate:request", (targetId: string) => {
      const target = this.playerManager.others.get(targetId);
      if (!target) return;

      this.spectate = target;

      this.game.events.emit("camera:follow", {
        key: target.map,
        player: target,
      });

      this.socketManager.emit("player:spectate", { targetId });
    });
  }

  shutdown(): void {
    this.socketManager.disconnect();
  }
}
