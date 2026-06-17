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
  Slot,
  SlotType,
  SlotReference,
  SlotZone,
  SoundName,
} from "@server/types";
import EventBus from "../EventBus";
import { handlers } from "../handlers";
import { configs } from "@server/configs";
import { InventoryComponent } from "../components/Inventory";
import { HotbarComponent } from "../components/Hotbar";
import { DialogueResponse, NodeId } from "@server/types/dialogue";
import { DamageableComponent } from "../components/Damageable";
import { DestructibleComponent } from "../components/Destructible";
import { vfx } from "../vfx";
import { AmbienceManager } from "../managers/Ambience";
import { ChunkManager } from "../managers/Chunk";
import { EffectFactory } from "../factory/Effect";
import { Player } from "../Player";
import { SoundManager } from "../managers/Sound";
import { Sound } from "../loaders/Sound";
import ForestScene from "./Forest";

export class MainScene extends Phaser.Scene {
  public playerManager!: PlayerManager;
  public entityManager!: EntityManager;
  public ambienceManager!: AmbienceManager;
  public chunkManager!: ChunkManager;
  public soundManager!: SoundManager;
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
      sound: this.soundManager,
    };
  }

  preload(): void {
    Sound.load(this);
  }

  create(): void {
    this.cameras.main.setVisible(false);

    this.playerManager = new PlayerManager(this);
    this.entityManager = new EntityManager(this);
    this.ambienceManager = new AmbienceManager(this);
    this.chunkManager = new ChunkManager();
    this.soundManager = new SoundManager(this);

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
          this.managers.socket.emit(Event.PLAYER_CREATE, playerId);
        }
      });
    });

    scenes.forEach((key) => {
      this.scene.launch(key);
    });

    if (scenes.length) this.scene.bringToTop(MapName.VILLAGE);
  }

  update(_time: number, _delta: number): void {
    const player = this.managers.players.player;
    const target = this.spectate || player;

    if (target) {
      const positions = [{ map: target.map, x: target.x, y: target.y }];

      if (player?.isAuthority)
        for (const other of this.managers.players.others.values())
          if (other.map === target.map)
            positions.push({ map: other.map, x: other.x, y: other.y });

      const changed = this.managers.chunks.updateFromPositions(positions);

      if (changed && this.spectate)
        this.managers.socket.emit(Event.PLAYER_SPECTATE, {
          targetId: this.spectate.id,
        });
    }

    this.managers.players.update();
    this.managers.entities.update();
  }

  private _registerEvents(): void {
    /**
     * World
     */
    this.managers.socket.on(Event.WORLD_TIME, (data: { phase: TimePhase }) => {
      this.managers.ambience.setPhase(data.phase, false);
    });

    this.managers.socket.on(Event.WORLD_PHASE, (data: TimePhase) => {
      this.managers.ambience.setPhase(data, true);
    });

    /**
     * Players
     */
    this.managers.socket.on(Event.PLAYER_CREATE_LOCAL, (data: PlayerConfig) => {
      this.managers.players.add(data, true);

      const map = this.scene.get(data.map);
      map.scene.setVisible(true);
      map.input.enabled = true;

      const player = this.managers.players.player!;

      this.game.events.emit(Event.CAMERA_FOLLOW, { key: data.map, player });

      EventBus.emit(Event.PLAYER_CREATE_LOCAL, data.id);
      EventBus.emit(Event.PLAYER_HEALTH, player.health);
      EventBus.emit(Event.PLAYER_MAX_HEALTH, player.maxHealth);
      EventBus.emit(Event.PLAYER_MANA, player.mana);

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      if (inventory && data.inventory?.length) inventory.set(data.inventory);

      const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
      if (hotbar && data.hotbar?.length) hotbar.setSlots(data.hotbar);

      handlers.ui.backdrop.hide(this, data.map);
    });

    this.managers.socket.on(
      Event.PLAYER_CREATE_OTHERS,
      (data: PlayerConfig[]) => {
        data.forEach((config) => {
          this.managers.players.add(config, false);
        });
      },
    );

    this.managers.socket.on(Event.PLAYER_CREATE, (data: PlayerConfig) => {
      this.managers.players.add(data, false);
    });

    this.managers.socket.on(Event.PLAYER_LEAVE, (data: string) => {
      if (this.spectate?.id === data) this.spectate = null;
      this.managers.players.remove(data);
    });

    this.managers.socket.on(Event.PLAYER_INPUT, (data: Input) => {
      this.managers.players.updateOther(data);
    });

    this.managers.socket.on(Event.PLAYER_HURT, (data: Hurt) => {
      const local = this.managers.players.player;
      const player =
        this.managers.players.others.get(data.id) ||
        (local?.id === data.id ? local : null);

      if (!player) return;

      handlers.combat.hurt(player, data.health);
      handlers.combat.knockback(player, data.knockback);

      if (player === local) EventBus.emit(Event.PLAYER_HEALTH, player.health);
    });

    this.managers.socket.on(
      Event.PLAYER_HEALTH_SYNC,
      (data: { id: string; health: number }) => {
        const player = this.managers.players.others.get(data.id);
        if (!player) return;
        player.health = data.health;
      },
    );

    this.managers.socket.on(Event.PLAYER_TRANSITION, (data: PlayerConfig) => {
      handlers.player.transition(data, this);
    });

    this.managers.socket.on(Event.PLAYER_AUTHORITY, (data: boolean) => {
      const player = this.managers.players.player;
      if (!player) return;

      player.isAuthority = data;
    });

    this.game.events.on(Event.PLAYER_INPUT, (data: Input) => {
      const player = this.managers.players.player;
      if (!player?.isTransitioning)
        this.managers.socket.emit(Event.PLAYER_INPUT, data);
    });

    this.game.events.on(Event.PLAYER_TRANSITION, (data: Transition) => {
      const player = this.managers.players.player;
      if (!player) return;

      player.isLocked = true;
      player.isTransitioning = true;

      this.managers.socket.emit(Event.PLAYER_TRANSITION, data);
    });

    /**
     * Entities
     */
    this.managers.socket.on(Event.ENTITY_CREATE, (data: EntityConfig) => {
      this.managers.entities.add(data);
    });

    this.managers.socket.on(Event.ENTITY_CREATE_ALL, (data: EntityConfig[]) => {
      this.managers.entities.batch(data);
    });

    this.managers.socket.on(Event.ENTITY_DESTROY, (data: string) => {
      const entity = this.managers.entities.entities.get(data);

      if (entity) {
        const damageable = entity.getComponent<DamageableComponent>(
          ComponentName.DAMAGEABLE,
        );
        const destructible = entity.getComponent<DestructibleComponent>(
          ComponentName.DESTRUCTIBLE,
        );

        if (destructible) vfx.emitters.break(entity);
        else if (damageable) vfx.emitters.dissolve(entity);
      }

      this.managers.entities.remove(data);
    });

    this.managers.socket.on(Event.ENTITY_DESPAWN, (data: string) => {
      this.managers.entities.remove(data);
    });

    this.managers.socket.on(Event.ENTITY_INPUT, (data: Partial<Input>) => {
      const entity = this.managers.entities.get(data.id!);
      entity?.update(data);
    });

    this.managers.socket.on(Event.ENTITY_HURT, (data: Hurt) => {
      const entity = this.managers.entities.entities.get(data.id);
      if (!entity) return;

      handlers.combat.damage(entity, data.health, data.isCritical);
      handlers.behavior.react(entity, data.attackerId);
      handlers.combat.hurt(entity, data.health);
      handlers.combat.knockback(entity, data.knockback);
    });

    this.managers.socket.on(
      Event.EFFECT_APPLY,
      (data: { id: string; effect: ActiveEffect }) => {
        const target =
          this.managers.entities.entities.get(data.id) ||
          this.managers.players.others.get(data.id) ||
          (this.managers.players.player?.id === data.id
            ? this.managers.players.player
            : undefined);

        if (!target) return;

        target.addEffect(
          EffectFactory.create(data.effect.name as EffectName, target),
        );

        if (this.managers.players.player?.id === data.id)
          EventBus.emit(Event.EFFECT_APPLY, data.effect);
      },
    );

    this.managers.socket.on(
      Event.EFFECT_REMOVE,
      (data: { id: string; name: EffectName }) => {
        const target =
          this.managers.entities.entities.get(data.id) ||
          this.managers.players.others.get(data.id) ||
          (this.managers.players.player?.id === data.id
            ? this.managers.players.player
            : undefined);

        if (!target) return;

        target.removeEffect(data.name);

        if (this.managers.players.player?.id === data.id)
          EventBus.emit(Event.EFFECT_REMOVE, data.name);
      },
    );

    this.managers.socket.on(
      Event.ENTITY_DIALOGUE_RESPONSE,
      (data: DialogueResponse) => {
        handlers.dialogue.start(data);
      },
    );

    this.managers.socket.on(Event.ENTITY_SPOTTED_PLAYER, (data: Spot) => {
      const entity = this.managers.entities.get(data.entityId);
      if (!entity) return;

      handlers.behavior.react(entity, data.playerId);
    });

    this.managers.socket.on(
      Event.ENTITY_LOCK,
      (data: { entityId: string; facing?: Direction }) => {
        const entity = this.managers.entities.get(data.entityId);
        if (!entity) return;

        if (data.facing) entity.setFacing(data.facing);

        entity.isLocked = true;
        entity.moving = [];

        if (entity.state !== StateName.IDLE)
          entity.transitionTo(StateName.IDLE);
        else entity.states?.get(StateName.IDLE)?.update(entity);
      },
    );

    this.managers.socket.on(Event.ENTITY_UNLOCK, (data: string) => {
      const entity = this.managers.entities.get(data);
      if (!entity) return;

      entity.isLocked = false;
    });

    this.game.events.on(Event.ENTITY_INPUT, (data: Partial<Input>) => {
      this.managers.socket.emit(Event.ENTITY_INPUT, data);
    });

    this.game.events.on(Event.ENTITY_PICKUP, (data: string) => {
      this.managers.socket.emit(Event.ENTITY_PICKUP, data);
      this.managers.sound.play.sfx(SoundName.PICKUP);
    });

    this.game.events.on(Event.ENTITY_PLANT, (data: any) => {
      this.managers.socket.emit(Event.ENTITY_PLANT, data);
    });

    this.game.events.on(Event.ENTITY_HARVEST, (data: any) => {
      this.managers.socket.emit(Event.ENTITY_HARVEST, data);
    });

    this.game.events.on(Event.ENTITY_FISH, (data: any) => {
      this.managers.socket.emit(Event.ENTITY_FISH, data);
    });

    this.game.events.on(
      Event.ENTITY_FELL,
      (data: { id: string; x: number; y: number }) => {
        this.managers.socket.emit(Event.ENTITY_FELL, data);
      },
    );

    this.game.events.on(
      Event.ENTITY_DIALOGUE_START,
      (data: { entityId: string; facing: Direction }) => {
        this.managers.socket.emit(Event.ENTITY_DIALOGUE_ITERATE, {
          entityId: data.entityId,
          nodeId: NodeId.GREETING,
          facing: data.facing,
        });
      },
    );

    this.game.events.on(Event.ENTITY_SPOTTED_PLAYER, (data: Spot) => {
      this.managers.socket.emit(Event.ENTITY_SPOTTED_PLAYER, data);
    });

    this.game.events.on(Event.ENTITY_FLEE, (data: string) => {
      this.managers.socket.emit(Event.ENTITY_FLEE, data);
    });

    EventBus.on(
      Event.ENTITY_DIALOGUE_CHOICE,
      (data: { entityId: string; nodeId: NodeId }) => {
        this.managers.socket.emit(Event.ENTITY_DIALOGUE_ITERATE, data);
      },
    );

    EventBus.on(Event.ENTITY_DIALOGUE_END, (data: string) => {
      this.managers.socket.emit(Event.ENTITY_DIALOGUE_END, data);
    });

    /**
     * Chunks
     */
    this.managers.socket.on(Event.CHUNK_DEACTIVATE, (data: string[]) => {
      this.managers.entities.deactivate(data);
    });

    /**
     * Items
     */
    this.managers.socket.on(Event.ITEM_REMOVE, (data: Item) => {
      const player = this.managers.players.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      if (!inventory) return;

      inventory.remove(data.name, data.quantity);
    });

    this.managers.socket.on(Event.INVENTORY_SYNC, (data: (Item | null)[]) => {
      const player = this.managers.players.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(data);
    });

    this.managers.socket.on(Event.HOTBAR_SYNC, (data: (Slot | null)[]) => {
      const player = this.managers.players.player;
      if (!player) return;

      const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
      hotbar?.setSlots(data);
    });

    this.managers.socket.on(Event.SPELLBOOK_SYNC, (spells: SpellName[]) => {
      EventBus.emit(Event.SPELLBOOK_SYNC, spells);
    });

    EventBus.on(Event.ITEM_COLLECT, (data: Item) => {
      this.managers.socket.emit(Event.ITEM_COLLECT, data);
    });

    EventBus.on(Event.ITEM_CONSUME, (data: { name: string }) => {
      this.managers.socket.emit(Event.ITEM_CONSUME, data);
      this.managers.sound.play.sfx(SoundName.DRINK);
    });

    EventBus.on(
      Event.SLOT_MOVE,
      (data: {
        source: SlotReference;
        target: SlotReference;
        type: SlotType;
      }) => {
        this.managers.socket.emit(Event.SLOT_MOVE, data);

        if (
          data.target.zone === SlotZone.HOTBAR &&
          data.source.zone !== SlotZone.HOTBAR
        )
          this.managers.sound.play.sfx(SoundName.EQUIP);
      },
    );

    /**
     * Spells
     */
    EventBus.on(
      Event.SPELL_LEARN,
      (data: { entityName: EntityName; spell: SpellName }) => {
        this.managers.socket.emit(Event.SPELL_LEARN, {
          spell: data.spell,
          entity: data.entityName,
        });

        const player = this.managers.players.player;

        if (player) {
          const inventory = player.getComponent<InventoryComponent>(
            ComponentName.INVENTORY,
          );
          inventory?.remove(data.entityName);

          EventBus.emit(Event.SPELL_LEARN_CONFIRM, data.spell);
        }
      },
    );

    this.managers.socket.on(Event.SPELLS_SYNC, (spells: SpellName[]) => {
      EventBus.emit(Event.SPELLS_SYNC, spells);
    });

    /**
     * Storage
     */
    this.game.events.on(Event.STORAGE_OPEN, (data: { entityId: string }) => {
      this.managers.socket.emit(Event.STORAGE_OPEN, {
        entityId: data.entityId,
      });
    });

    EventBus.on(Event.STORAGE_CLOSE, (data: string) => {
      this.managers.socket.emit(Event.STORAGE_CLOSE, { entityId: data });
      this.game.events.emit(Event.STORAGE_CLOSE, data);
    });

    /**
     * Collector
     */
    EventBus.on(
      Event.COLLECTOR_CRAFT,
      (data: { entityId: string; output: string }) => {
        this.managers.socket.emit(Event.COLLECTOR_CRAFT, data);
        this.managers.sound.play.sfx(SoundName.COLLECT);
      },
    );

    EventBus.on(Event.COLLECTOR_TIER_UPGRADE, () => {
      this.managers.socket.emit(Event.COLLECTOR_TIER_UPGRADE);
    });

    this.managers.socket.on(
      Event.STORAGE_SYNC,
      (data: { entityId: string; slots: (Item | null)[] }) => {
        this.game.events.emit(Event.STORAGE_CONFIRM, data.entityId);
        EventBus.emit(Event.STORAGE_OPEN, {
          entityId: data.entityId,
          slots: data.slots.length,
        });
        EventBus.emit(Event.STORAGE_SYNC, data);
      },
    );

    /**
     * Economy
     */
    this.managers.socket.on(Event.ECONOMY_UPDATE, (data: EconomySnapshot) => {
      EventBus.emit(Event.ECONOMY_UPDATE, data);
    });

    this.managers.socket.on(
      Event.STORE_SYNC,
      (data: Record<string, number>) => {
        EventBus.emit(Event.STORE_SYNC, data);
      },
    );

    /**
     * Shared
     */
    this.game.events.on(Event.HIT, (data: Hit) => {
      this.managers.socket.emit(Event.HIT, data);
    });

    this.game.events.on(Event.PLAYER_CAST, (spell: string) => {
      this.managers.socket.emit(Event.PLAYER_CAST, spell);

      const sound = configs.spells[spell as SpellName]?.sounds?.cast;
      if (sound) this.managers.sound.play.sfx(sound);
    });

    /**
     * Party
     */
    this.managers.socket.on(Event.PARTY_START_LOADING, (map: MapName) => {
      handlers.ui.backdrop.show({ tips: true, map });
    });

    this.managers.socket.on(
      Event.PARTY_START,
      (data: {
        map: MapName;
        tilemap: any;
        spawn: { x: number; y: number };
        players: PlayerConfig[];
      }) => {
        const scene = this.scene.get(data.map) as ForestScene;

        const onReady = () => {
          if (this.managers.ambience.phase)
            this.managers.ambience.setPhase(
              this.managers.ambience.phase,
              false,
            );

          const localId = this.managers.players.player?.id;
          const config = data.players.find((p) => p.id === localId);

          if (config) {
            this.scene.bringToTop(data.map);
            handlers.player.swap(config, this);
          } else scene.scene.setVisible(false);

          data.players
            .filter((p) => p.id !== localId)
            .forEach((config) => this.managers.players.add(config, false));

          EventBus.emit(Event.PARTY_START_READY);
          handlers.ui.backdrop.hide(this, data.map);
        };

        if (scene.scene.isActive()) {
          scene.rebuild(data.tilemap);
          onReady();
          return;
        }

        this.cache.tilemap.add(data.map, {
          format: Phaser.Tilemaps.Formats.TILED_JSON,
          data: data.tilemap,
        });

        this.scene.launch(data.map);
        scene.events.once(Phaser.Scenes.Events.CREATE, onReady);
      },
    );

    this.managers.socket.on(Event.PARTY_LIST, (data: Party[]) => {
      EventBus.emit(Event.PARTY_LIST, data);
    });

    this.managers.socket.on(Event.PARTY_CREATE, (data: Party) => {
      EventBus.emit(Event.PARTY_CREATE, data);
    });

    this.managers.socket.on(Event.PARTY_UPDATE, (data: Party) => {
      EventBus.emit(Event.PARTY_UPDATE, data);
    });

    this.managers.socket.on(Event.PARTY_LEAVE, () => {
      EventBus.emit(Event.PARTY_LEAVE);
    });

    EventBus.on(Event.PARTY_CREATE_REQUEST, () => {
      this.managers.socket.emit(Event.PARTY_CREATE);
    });

    EventBus.on(Event.PARTY_JOIN_REQUEST, (id: string) => {
      this.managers.socket.emit(Event.PARTY_JOIN, id);
    });

    EventBus.on(Event.PARTY_LEAVE_REQUEST, () => {
      this.managers.socket.emit(Event.PARTY_LEAVE);
    });

    EventBus.on(Event.PARTY_START_REQUEST, () => {
      this.managers.socket.emit(Event.PARTY_START);
    });

    /**
     * Death
     */
    this.managers.socket.on(Event.PLAYER_DEATH, (data: Death) => {
      const isLocal = this.managers.players.player?.id === data.id;
      const player = isLocal
        ? this.managers.players.player
        : this.managers.players.others.get(data.id);

      if (player) player.transitionTo(StateName.DEAD);

      if (isLocal && this.managers.players.player) {
        const inventory =
          this.managers.players.player.getComponent<InventoryComponent>(
            ComponentName.INVENTORY,
          );

        if (inventory) inventory.set(new Array(20).fill(null));

        EventBus.emit(Event.PLAYER_HEALTH, 0);
      }

      EventBus.emit(Event.PLAYER_DEATH, data);
    });

    this.managers.socket.on(
      Event.PLAYER_REVIVE,
      (data: { id: string; x: number; y: number; health: number }) => {
        const isLocal = this.managers.players.player?.id === data.id;
        const player = isLocal
          ? this.managers.players.player
          : this.managers.players.others.get(data.id);

        if (player) {
          player.setPosition(data.x, data.y);
          player.health = data.health;
          player.transitionTo(StateName.IDLE);
        }

        if (isLocal) {
          EventBus.emit(Event.PLAYER_HEALTH, data.health);

          this.spectate = null;

          this.game.events.emit(Event.CAMERA_FOLLOW, {
            key: this.managers.players.player!.map,
            player: this.managers.players.player!,
          });
        }

        EventBus.emit(Event.PLAYER_REVIVE, data);
      },
    );

    this.managers.socket.on(Event.PLAYER_HEALTH, (health: number) => {
      const player = this.managers.players.player;
      if (!player) return;

      player.health = health;
      EventBus.emit(Event.PLAYER_HEALTH, health);
    });

    this.managers.socket.on(Event.PLAYER_MANA, (mana: number) => {
      const player = this.managers.players.player;
      if (!player) return;

      player.mana = mana;
      EventBus.emit(Event.PLAYER_MANA, mana);
    });

    this.managers.socket.on(Event.PLAYER_INVENTORY_WIPE, () => {
      const player = this.managers.players.player;
      if (!player) return;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(new Array(20).fill(null));
    });

    this.managers.socket.on(Event.PARTY_WIPE, () => {
      const player = this.managers.players.player;
      if (!player) return;

      this.spectate = null;

      const inventory = player.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
      inventory?.set(new Array(20).fill(null));

      EventBus.emit(Event.PARTY_WIPE);
    });

    EventBus.on(Event.PLAYER_REVIVE_REQUEST, (id: string) => {
      this.managers.socket.emit(Event.PLAYER_REVIVE, { id });
    });

    EventBus.on(Event.PLAYER_SPECTATE_REQUEST, (targetId: string) => {
      const target = this.managers.players.others.get(targetId);
      if (!target) return;

      this.spectate = target;

      this.game.events.emit(Event.CAMERA_FOLLOW, {
        key: target.map,
        player: target,
      });

      this.managers.socket.emit(Event.PLAYER_SPECTATE, { targetId });
    });
  }

  shutdown(): void {
    this.managers.socket.disconnect();
  }
}
