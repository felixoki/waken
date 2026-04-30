import { EntityManager } from "../managers/Entity";
import { PlayerManager } from "../managers/Player";
import SocketManager from "../managers/Socket";
import {
  Direction,
  EconomySnapshot,
  EntityConfig,
  EntityName,
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
  Effect as ActiveEffect,
  EffectName,
  Event,
  SpellName,
} from "@server/types";
import EventBus from "../EventBus";
import { handlers } from "../handlers";
import { InventoryComponent } from "../components/Inventory";
import { DialogueResponse, NodeId } from "@server/types/dialogue";
import { DamageableComponent } from "../components/Damageable";
import { effects } from "../effects";
import { AmbienceManager } from "../managers/Ambience";
import { ChunkManager } from "../managers/Chunk";
import { EffectFactory } from "../factory/Effect";
import { Player } from "../Player";
import type RealmScene from "./Realm";

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
      MapName.FISHING_HUT,
      MapName.FARM_HOUSE,
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
          const playerId = localStorage.getItem("playerId");
          this.socketManager.emit(Event.PLAYER_CREATE, playerId);
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
        this.socketManager.emit(Event.PLAYER_SPECTATE, {
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
    this.socketManager.on(Event.WORLD_TIME, (data: { phase: TimePhase }) => {
      this.ambienceManager.setPhase(data.phase, false);
    });

    this.socketManager.on(Event.WORLD_PHASE, (data: TimePhase) => {
      this.ambienceManager.setPhase(data, true);
    });

    /**
     * Players
     */
    this.socketManager.on(Event.PLAYER_CREATE_LOCAL, (data: PlayerConfig) => {
      this.playerManager.add(data, true);

      const map = this.scene.get(data.map);
      map.scene.setVisible(true);
      map.input.enabled = true;

      const player = this.playerManager.player!;

      this.game.events.emit(Event.CAMERA_FOLLOW, { key: data.map, player });

      EventBus.emit(Event.PLAYER_CREATE_LOCAL, data.id);
      EventBus.emit(Event.PLAYER_HEALTH, player.health);
      EventBus.emit(Event.PLAYER_MAX_HEALTH, player.maxHealth);
      EventBus.emit(Event.PLAYER_MANA, player.mana);

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      if (inventory && data.inventory?.length) inventory.set(data.inventory);
    });

    this.socketManager.on(
      Event.PLAYER_CREATE_OTHERS,
      (data: PlayerConfig[]) => {
        data.forEach((config) => {
          this.playerManager.add(config, false);
        });
      },
    );

    this.socketManager.on(Event.PLAYER_CREATE, (data: PlayerConfig) => {
      this.playerManager.add(data, false);
    });

    this.socketManager.on(Event.PLAYER_LEAVE, (data: string) => {
      this.playerManager.remove(data);
    });

    this.socketManager.on(Event.PLAYER_INPUT, (data: Input) => {
      this.playerManager.updateOther(data);
    });

    this.socketManager.on(Event.PLAYER_HURT, (data: Hurt) => {
      const player =
        this.playerManager.others.get(data.id) || this.playerManager.player;

      if (!player) return;

      handlers.combat.hurt(player, data.health);
      handlers.combat.knockback(player, data.knockback);

      if (player === this.playerManager.player)
        EventBus.emit(Event.PLAYER_HEALTH, player.health);
    });

    this.socketManager.on(Event.PLAYER_TRANSITION, (data: PlayerConfig) => {
      handlers.player.transition(data, this);
    });

    this.socketManager.on(Event.PLAYER_AUTHORITY, (data: boolean) => {
      const player = this.playerManager.player;
      if (!player) return;

      player.isAuthority = data;
    });

    this.game.events.on(Event.PLAYER_INPUT, (data: Input) => {
      this.socketManager.emit(Event.PLAYER_INPUT, data);
    });

    this.game.events.on(Event.PLAYER_TRANSITION, (data: Transition) => {
      const player = this.playerManager.player;
      if (!player) return;

      player.isLocked = true;

      this.socketManager.emit(Event.PLAYER_TRANSITION, data);
    });

    /**
     * Entities
     */
    this.socketManager.on(Event.ENTITY_CREATE, (data: EntityConfig) => {
      this.entityManager.add(data);
    });

    this.socketManager.on(Event.ENTITY_CREATE_ALL, (data: EntityConfig[]) => {
      this.entityManager.batch(data);
    });

    this.socketManager.on(Event.ENTITY_DESTROY, (data: string) => {
      const entity = this.entityManager.entities.get(data);

      if (entity) {
        const damageable = entity.getComponent<DamageableComponent>(
          ComponentName.DAMAGEABLE,
        );

        if (damageable) effects.emitters.dissolve(entity);
      }

      this.entityManager.remove(data);
    });

    this.socketManager.on(Event.ENTITY_DESPAWN, (data: string) => {
      this.entityManager.remove(data);
    });

    this.socketManager.on(Event.ENTITY_INPUT, (data: Partial<Input>) => {
      const entity = this.entityManager.get(data.id!);
      entity?.update(data);
    });

    this.socketManager.on(Event.ENTITY_HURT, (data: Hurt) => {
      const entity = this.entityManager.entities.get(data.id);
      if (!entity) return;

      handlers.behavior.react(entity, data.attackerId);
      handlers.combat.hurt(entity, data.health);
      handlers.combat.knockback(entity, data.knockback);
    });

    this.socketManager.on(
      Event.EFFECT_APPLY,
      (data: { id: string; effect: ActiveEffect }) => {
        const target =
          this.entityManager.entities.get(data.id) ||
          this.playerManager.others.get(data.id) ||
          (this.playerManager.player?.id === data.id
            ? this.playerManager.player
            : undefined);
        if (!target) return;

        target.addEffect(
          EffectFactory.create(data.effect.name as EffectName, target),
        );

        if (this.playerManager.player?.id === data.id)
          EventBus.emit(Event.EFFECT_APPLY, data.effect);
      },
    );

    this.socketManager.on(
      Event.EFFECT_REMOVE,
      (data: { id: string; name: EffectName }) => {
        const target =
          this.entityManager.entities.get(data.id) ||
          this.playerManager.others.get(data.id) ||
          (this.playerManager.player?.id === data.id
            ? this.playerManager.player
            : undefined);

        if (!target) return;

        target.removeEffect(data.name);

        if (this.playerManager.player?.id === data.id)
          EventBus.emit(Event.EFFECT_REMOVE, data.name);
      },
    );

    this.socketManager.on(
      Event.ENTITY_DIALOGUE_RESPONSE,
      (data: DialogueResponse) => {
        handlers.dialogue.start(data);
      },
    );

    this.socketManager.on(Event.ENTITY_SPOTTED_PLAYER, (data: Spot) => {
      const entity = this.entityManager.get(data.entityId);
      if (!entity) return;

      handlers.behavior.react(entity, data.playerId);
    });

    this.socketManager.on(
      Event.ENTITY_LOCK,
      (data: { entityId: string; facing?: Direction }) => {
        const entity = this.entityManager.get(data.entityId);
        if (!entity) return;

        if (data.facing) entity.setFacing(data.facing);

        entity.isLocked = true;
        entity.moving = [];

        if (entity.state !== StateName.IDLE)
          entity.transitionTo(StateName.IDLE);
        else entity.states?.get(StateName.IDLE)?.update(entity);
      },
    );

    this.socketManager.on(Event.ENTITY_UNLOCK, (data: string) => {
      const entity = this.entityManager.get(data);
      if (!entity) return;

      entity.isLocked = false;
    });

    this.game.events.on(Event.ENTITY_INPUT, (data: Partial<Input>) => {
      this.socketManager.emit(Event.ENTITY_INPUT, data);
    });

    this.game.events.on(Event.ENTITY_PICKUP, (data: string) => {
      this.socketManager.emit(Event.ENTITY_PICKUP, data);
    });

    this.game.events.on(Event.ENTITY_PLANT, (data: any) => {
      this.socketManager.emit(Event.ENTITY_PLANT, data);
    });

    this.game.events.on(Event.ENTITY_HARVEST, (data: any) => {
      this.socketManager.emit(Event.ENTITY_HARVEST, data);
    });

    this.game.events.on(Event.ENTITY_FISH, (data: any) => {
      this.socketManager.emit(Event.ENTITY_FISH, data);
    });

    this.game.events.on(
      Event.ENTITY_FELL,
      (data: { id: string; x: number; y: number }) => {
        this.socketManager.emit(Event.ENTITY_FELL, data);
      },
    );

    this.game.events.on(
      Event.ENTITY_DIALOGUE_START,
      (data: { entityId: string; facing: Direction }) => {
        this.socketManager.emit(Event.ENTITY_DIALOGUE_ITERATE, {
          entityId: data.entityId,
          nodeId: NodeId.GREETING,
          facing: data.facing,
        });
      },
    );

    this.game.events.on(Event.ENTITY_SPOTTED_PLAYER, (data: Spot) => {
      this.socketManager.emit(Event.ENTITY_SPOTTED_PLAYER, data);
    });

    this.game.events.on(Event.ENTITY_FLEE, (data: string) => {
      this.socketManager.emit(Event.ENTITY_FLEE, data);
    });

    EventBus.on(
      Event.ENTITY_DIALOGUE_CHOICE,
      (data: { entityId: string; nodeId: NodeId }) => {
        this.socketManager.emit(Event.ENTITY_DIALOGUE_ITERATE, data);
      },
    );

    EventBus.on(Event.ENTITY_DIALOGUE_END, (data: string) => {
      this.socketManager.emit(Event.ENTITY_DIALOGUE_END, data);
    });

    /**
     * Chunks
     */
    this.socketManager.on(Event.CHUNK_DEACTIVATE, (data: string[]) => {
      this.entityManager.deactivate(data);
    });

    /**
     * Items
     */
    this.socketManager.on(Event.ITEM_REMOVE, (data: Item) => {
      const player = this.playerManager.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      if (!inventory) return;

      inventory.remove(data.name, data.quantity);
    });

    this.socketManager.on(Event.INVENTORY_SYNC, (data: (Item | null)[]) => {
      const player = this.playerManager.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(data);
    });

    EventBus.on(Event.ITEM_COLLECT, (data: Item) => {
      this.socketManager.emit(Event.ITEM_COLLECT, data);
    });

    /**
     * Spells
     */
    EventBus.on(
      Event.SPELL_LEARN,
      (data: { entityName: EntityName; spell: SpellName }) => {
        this.socketManager.emit(Event.SPELL_LEARN, { spell: data.spell });

        const player = this.playerManager.player;

        if (player) {
          const inventory = player.getComponent<InventoryComponent>(
            ComponentName.INVENTORY,
          );
          inventory?.remove(data.entityName);

          EventBus.emit(Event.SPELL_LEARN_CONFIRM, data.spell);
        }
      },
    );

    this.socketManager.on(Event.SPELLS_SYNC, (spells: SpellName[]) => {
      EventBus.emit(Event.SPELLS_SYNC, spells);
    });

    /**
     * Storage
     */
    this.game.events.on(
      Event.STORAGE_OPEN,
      (data: { entityId: string; slots: number }) => {
        this.socketManager.emit(Event.STORAGE_OPEN, {
          entityId: data.entityId,
        });
        EventBus.emit(Event.STORAGE_OPEN, data);
      },
    );

    EventBus.on(Event.STORAGE_CLOSE, (data: string) => {
      this.socketManager.emit(Event.STORAGE_CLOSE, { entityId: data });
      this.game.events.emit(Event.STORAGE_CLOSE, data);
    });

    EventBus.on(
      Event.STORAGE_DEPOSIT,
      (data: { entityId: string; item: Item }) => {
        this.socketManager.emit(Event.STORAGE_DEPOSIT, data);
      },
    );

    EventBus.on(
      Event.STORAGE_WITHDRAW,
      (data: { entityId: string; item: Item }) => {
        this.socketManager.emit(Event.STORAGE_WITHDRAW, data);
      },
    );

    /**
     * Collector
     */
    EventBus.on(
      Event.COLLECTOR_CRAFT,
      (data: { entityId: string; output: string }) => {
        this.socketManager.emit(Event.COLLECTOR_CRAFT, data);
      },
    );

    EventBus.on(Event.COLLECTOR_TIER_UPGRADE, () => {
      this.socketManager.emit(Event.COLLECTOR_TIER_UPGRADE);
    });

    this.socketManager.on(
      Event.STORAGE_SYNC,
      (data: { entityId: string; slots: (Item | null)[] }) => {
        EventBus.emit(Event.STORAGE_SYNC, data);
      },
    );

    /**
     * Economy
     */
    this.socketManager.on(Event.ECONOMY_UPDATE, (data: EconomySnapshot) => {
      EventBus.emit(Event.ECONOMY_UPDATE, data);
    });

    this.socketManager.on(Event.STORE_SYNC, (data: Record<string, number>) => {
      EventBus.emit(Event.STORE_SYNC, data);
    });

    /**
     * Shared
     */
    this.game.events.on(Event.HIT, (data: Hit) => {
      this.socketManager.emit(Event.HIT, data);
    });

    this.game.events.on(Event.PLAYER_CAST, (spell: string) => {
      this.socketManager.emit(Event.PLAYER_CAST, spell);
    });

    /**
     * Party
     */
    this.socketManager.on(Event.PARTY_START_LOADING, () => {
      EventBus.emit(Event.TRANSITION_START, true);
    });

    this.socketManager.on(
      Event.PARTY_START,
      (data: {
        tilemap: any;
        spawn: { x: number; y: number };
        entities: EntityConfig[];
        players: PlayerConfig[];
      }) => {
        const realm = this.scene.get(MapName.REALM) as RealmScene;

        const onReady = () => {
          this.entityManager.batch(data.entities);

          const localId = this.playerManager.player?.id;
          const config = data.players.find((p) => p.id === localId);

          if (config) {
            this.scene.bringToTop(MapName.REALM);
            handlers.player.swap(config, this);
          } else realm.scene.setVisible(false);

          data.players
            .filter((p) => p.id !== localId)
            .forEach((config) => this.playerManager.add(config, false));

          EventBus.emit(Event.PARTY_START_READY);
          EventBus.emit(Event.TRANSITION_END);
        };

        if (realm.scene.isActive()) {
          realm.rebuild(data.tilemap);
          onReady();
          return;
        }

        this.cache.tilemap.add(MapName.REALM, {
          format: Phaser.Tilemaps.Formats.TILED_JSON,
          data: data.tilemap,
        });

        this.scene.launch(MapName.REALM);
        realm.events.once(Phaser.Scenes.Events.CREATE, onReady);
      },
    );

    this.socketManager.on(Event.PARTY_LIST, (data: Party[]) => {
      EventBus.emit(Event.PARTY_LIST, data);
    });

    this.socketManager.on(Event.PARTY_CREATE, (data: Party) => {
      EventBus.emit(Event.PARTY_CREATE, data);
    });

    this.socketManager.on(Event.PARTY_UPDATE, (data: Party) => {
      EventBus.emit(Event.PARTY_UPDATE, data);
    });

    this.socketManager.on(Event.PARTY_LEAVE, () => {
      EventBus.emit(Event.PARTY_LEAVE);
    });

    EventBus.on(Event.PARTY_CREATE_REQUEST, () => {
      this.socketManager.emit(Event.PARTY_CREATE);
    });

    EventBus.on(Event.PARTY_JOIN_REQUEST, (id: string) => {
      this.socketManager.emit(Event.PARTY_JOIN, id);
    });

    EventBus.on(Event.PARTY_LEAVE_REQUEST, () => {
      this.socketManager.emit(Event.PARTY_LEAVE);
    });

    EventBus.on(Event.PARTY_START_REQUEST, () => {
      this.socketManager.emit(Event.PARTY_START);
    });

    /**
     * Death
     */
    this.socketManager.on(Event.PLAYER_DEATH, (data: Death) => {
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

        EventBus.emit(Event.PLAYER_HEALTH, 0);
      }

      EventBus.emit(Event.PLAYER_DEATH, data);
    });

    this.socketManager.on(
      Event.PLAYER_REVIVE,
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
          EventBus.emit(Event.PLAYER_HEALTH, data.health);

          this.spectate = null;

          this.game.events.emit(Event.CAMERA_FOLLOW, {
            key: this.playerManager.player!.map,
            player: this.playerManager.player!,
          });
        }

        EventBus.emit(Event.PLAYER_REVIVE, data);
      },
    );

    this.socketManager.on(Event.PLAYER_HEALTH, (health: number) => {
      const player = this.playerManager.player;
      if (!player) return;

      player.health = health;
      EventBus.emit(Event.PLAYER_HEALTH, health);
    });

    this.socketManager.on(Event.PLAYER_MANA, (mana: number) => {
      const player = this.playerManager.player;
      if (!player) return;

      player.mana = mana;
      EventBus.emit(Event.PLAYER_MANA, mana);
    });

    this.socketManager.on(Event.PLAYER_INVENTORY_WIPE, () => {
      const player = this.playerManager.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(new Array(20).fill(null));
    });

    this.socketManager.on(Event.PARTY_WIPE, () => {
      const player = this.playerManager.player;
      if (!player) return;

      this.spectate = null;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(new Array(20).fill(null));

      EventBus.emit(Event.PARTY_WIPE);
    });

    EventBus.on(Event.PLAYER_REVIVE_REQUEST, (id: string) => {
      this.socketManager.emit(Event.PLAYER_REVIVE, { id });
    });

    EventBus.on(Event.PLAYER_SPECTATE_REQUEST, (targetId: string) => {
      const target = this.playerManager.others.get(targetId);
      if (!target) return;

      this.spectate = target;

      this.game.events.emit(Event.CAMERA_FOLLOW, {
        key: target.map,
        player: target,
      });

      this.socketManager.emit(Event.PLAYER_SPECTATE, { targetId });
    });
  }

  shutdown(): void {
    this.socketManager.disconnect();
  }
}
