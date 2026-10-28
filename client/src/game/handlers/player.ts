import {
  ComponentName,
  EffectName,
  EntityName,
  Event,
  Slot,
  SlotType,
  MapName,
  PlayerConfig,
  StateName,
  SoundName,
} from "@server/types";
import { InventoryComponent } from "../components/Inventory";
import { HotbarComponent } from "../components/Hotbar";
import { AnimationComponent } from "../components/Animation";
import { FollowComponent } from "../components/Follow";
import { LightComponent } from "../components/Light";
import { TrailComponent } from "../components/Trail";
import { StorageComponent } from "../components/Storage";
import type { MainScene } from "../scenes/Main";
import { Entity } from "../Entity";
import { Factory } from "../factory/Factory";
import { handlers } from ".";
import EventBus from "../EventBus";
import { configs } from "@server/configs";
import type { Player } from "../Player";
import ForestScene from "../scenes/Forest";
import { DURATION_JUMPING, HEIGHT_JUMPING } from "@server/globals";

const FALL_DURATION = 450;
const FALL_GRAVITY = 0.0006;

export const player = {
  nearest: (
    entity: Entity,
    vision?: { distance: number; fov: number; rays?: number },
  ): {
    player: { x: number; y: number; id: string };
    distance: number;
  } | null => {
    const players = entity.scene.managers.players.all.filter(
      (p) => p && p.map === entity.map && p.state !== StateName.DEAD,
    );

    let nearest: { x: number; y: number; id: string } | null = null;
    let nearestDist = Infinity;

    for (const p of players) {
      if (
        vision &&
        !handlers.vision.canSee(
          entity.scene,
          entity,
          p,
          vision.distance,
          vision.fov,
          vision.rays ?? 5,
        )
      )
        continue;

      const dist = Phaser.Math.Distance.Between(entity.x, entity.y, p.x, p.y);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = p;
      }
    }

    if (!nearest) return null;
    return { player: nearest, distance: nearestDist };
  },

  swap: (data: PlayerConfig, main: MainScene): void => {
    const current = main.managers.players.player;
    if (!current) return;

    if (current.hasEffect(EffectName.DRAGON))
      current.removeEffect(EffectName.DRAGON);

    const prev = {
      inventory: current
        .getComponent<InventoryComponent>(ComponentName.INVENTORY)
        ?.get(),
      hotbar: current
        .getComponent<HotbarComponent>(ComponentName.HOTBAR)
        ?.getSlots(),
      active: current
        .getComponent<HotbarComponent>(ComponentName.HOTBAR)
        ?.getActive(),
      robe: current.robe,
      map: current.map,
      scene: current.scene,
    };

    main.managers.players.remove(current.id);
    main.managers.players.add(data, true);

    const updated = main.managers.players.player!;

    updated.isLocked = false;
    updated
      .getComponent<InventoryComponent>(ComponentName.INVENTORY)
      ?.set(prev.inventory!);
    updated
      .getComponent<HotbarComponent>(ComponentName.HOTBAR)
      ?.setSlots(prev.hotbar!);
    updated
      .getComponent<HotbarComponent>(ComponentName.HOTBAR)
      ?.setActive(prev.active ?? 0);

    updated.setRobe(prev.robe);

    const scene = main.scene.get(data.map);

    prev.scene.scene.setVisible(false);
    prev.scene.input.enabled = false;

    scene.scene.setVisible(true);
    scene.input.enabled = true;

    main.game.events.emit(Event.CAMERA_FOLLOW, {
      key: data.map,
      player: updated,
    });

    EventBus.emit(Event.PLAYER_HEALTH, updated.health);
    EventBus.emit(Event.PLAYER_MANA, updated.mana);
    EventBus.emit(Event.PLAYER_MAP, data.map);

    main.managers.entities.removeByMap(prev.map as MapName);

    main.managers.players.others.forEach((other) => {
      if (other.map === prev.map) main.managers.players.remove(other.id);
    });

    const enteringSublevel =
      configs.maps[data.map].isInstanced &&
      !configs.maps[data.map].isPartyInstance;

    const leavingSublevel =
      configs.maps[prev.map].isInstanced &&
      !configs.maps[prev.map].isPartyInstance &&
      data.map !== MapName.FOREST;

    if (
      configs.maps[prev.map].isInstanced &&
      configs.maps[prev.map].json === "" &&
      !enteringSublevel &&
      prev.map !== data.map
    )
      main.time.delayedCall(0, () => {
        (main.scene.get(prev.map) as ForestScene).teardown();
      });

    if (leavingSublevel) {
      main.managers.entities.removeByMap(MapName.FOREST);

      main.time.delayedCall(0, () => {
        (main.scene.get(MapName.FOREST) as ForestScene).teardown();
      });
    }

    handlers.sound.sync(main, data.map as MapName);
  },

  lantern: {
    sync: (p: Player, equipped: Slot | null | undefined): void => {
      const id = `lantern-${p.id}`;
      const exists = !!p.scene.managers.entities.get(id);
      const isLantern =
        equipped?.type === SlotType.ENTITY &&
        equipped?.item.name === EntityName.LANTERN;

      if (isLantern && !exists) player.lantern.equip(p);
      else if (!isLantern && exists) player.lantern.unequip(p);

      if (isLantern) {
        const entity = p.scene.managers.entities.get(id);
        const light = entity?.getComponent<LightComponent>(ComponentName.LIGHT);
        const active =
          p.state === StateName.IDLE || p.state === StateName.WALKING;
        light?.setActive(active);
      }
    },

    equip: (p: Player): void => {
      const def = configs.entities[EntityName.LANTERN_LIGHT];
      if (!def) return;

      const id = `lantern-${p.id}`;
      const entity = Factory.create(p.scene, {
        ...def,
        id,
        map: p.map,
        x: p.x,
        y: p.y,
        name: EntityName.LANTERN_LIGHT,
        health: 1,
        maxHealth: 1,
        createdAt: 0,
        isLocked: false,
        facing: p.facing,
        moving: [],
      });

      entity.map = p.map;
      p.scene.managers.entities.entities.set(id, entity);

      entity.getComponent<FollowComponent>(ComponentName.FOLLOW)?.setTarget(p);

      const anim = p.getComponent<AnimationComponent>(ComponentName.ANIMATION);
      anim?.setVariant("lantern");
      anim?.play(p.state, p.facing);
    },

    unequip: (p: Player): void => {
      p.scene.managers.entities.remove(`lantern-${p.id}`);

      const anim = p.getComponent<AnimationComponent>(ComponentName.ANIMATION);
      anim?.setVariant(null);
      anim?.play(p.state, p.facing);
    },
  },

  compass: {
    sync: (p: Player, equipped: Slot | null | undefined): void => {
      const trail = p.getComponent<TrailComponent>(ComponentName.TRAIL);
      if (!trail) return;

      trail.setEnabled(
        equipped?.type === SlotType.ENTITY &&
          equipped.item.name === EntityName.COMPASS,
      );
    },
  },

  footing: (player: Player): void => {
    const ground = configs.maps[player.map]?.ground;
    const tiles = player.scene.tileManager;

    if (
      !ground ||
      !tiles ||
      player.falling ||
      player.isTransitioning ||
      player.cutscene ||
      player.z > 0 ||
      player.state === StateName.JUMPING ||
      player.state === StateName.FLYING ||
      player.state === StateName.DEAD
    )
      return;

    const map = tiles.map;
    const { x, y } = handlers.path.position(player);
    const tx = Math.floor(x / map.tileWidth);
    const ty = Math.floor(y / map.tileHeight);

    if (ground.some((layer) => (map.getTileAt(tx, ty, false, layer)?.index ?? -1) > 0))
      return;

    player.scene.game.events.emit(Event.PLAYER_FALL);
    handlers.player.fall(player);
  },

  fall: (player: Player): Promise<void> => {
    if (player.falling) return player.falling;

    player.transitionTo(StateName.IDLE);
    player.isLocked = true;
    (player.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 0);

    const origin = player.displayOriginY;
    const speed = (HEIGHT_JUMPING * Math.PI) / DURATION_JUMPING;
    const behind = handlers.player.behind(
      player,
      speed * FALL_DURATION + 0.5 * FALL_GRAVITY * FALL_DURATION ** 2,
    );
    if (behind !== null) player.setDepth(behind);

    player.falling = new Promise((resolve) => {
      player.scene.tweens.addCounter({
        from: 0,
        to: FALL_DURATION,
        duration: FALL_DURATION,
        onUpdate: (tween) => {
          const ms = tween.getValue() ?? 0;
          const t = ms / FALL_DURATION;
          player.displayOriginY =
            origin - speed * ms - 0.5 * FALL_GRAVITY * ms * ms;
          player.setAlpha(1 - t * t);
        },
        onComplete: () => {
          player.displayOriginY = origin;
          resolve();
        },
      });
    });

    return player.falling;
  },

  behind: (player: Player, drop: number): number | null => {
    const ground = configs.maps[player.map]?.ground;
    const tiles = player.scene.tileManager;
    if (!ground || !tiles) return null;

    const map = tiles.map;
    const { x, y } = handlers.path.position(player);
    const tx = Math.floor(x / map.tileWidth);
    const ty = Math.floor(y / map.tileHeight);
    const reach = Math.ceil(drop / map.tileHeight);

    for (let dy = 1; dy <= reach; dy++)
      if (ground.some((layer) => (map.getTileAt(tx, ty + dy, false, layer)?.index ?? -1) > 0))
        return (
          Math.min(
            ...ground.map(
              (layer) => map.getLayer(layer)?.tilemapLayer?.depth ?? Infinity,
            ),
          ) - 1
        );

    return null;
  },

  land: (player: Player, x: number, y: number): void => {
    handlers.player.fall(player).then(() => {
      if (!player.scene) return;

      const spawn = configs.maps[player.map].spawn;

      player.falling = null;
      player.transitionTo(StateName.DEAD);
      player.setDepth(1000 + y);

      if (x === spawn.x && y === spawn.y) player.setPosition(x, y);
      else player.setAlpha(0);
    });
  },

  transition: (data: PlayerConfig, main: MainScene): void => {
    if (!main.managers.players.player) return;

    EventBus.emit(Event.ENTITY_DIALOGUE_END);
    StorageComponent.close();

    main.managers.players.player.isLocked = true;
    main.managers.players.player.isTransitioning = true;

    main.managers.sound.play.sfx(SoundName.DOOR);

    handlers.ui.backdrop.show();

    let torn = false;

    const proceed = () => {
      if (torn) return;
      torn = true;

      EventBus.off(Event.FADE_OUT_DONE, proceed);

      main.managers.players.player!.isTransitioning = false;
      player.swap(data, main);
      handlers.ui.backdrop.hide(main, data.map);
    };

    EventBus.once(Event.FADE_OUT_DONE, proceed);
    main.time.delayedCall(1500, proceed);
  },
};
