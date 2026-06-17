import {
  ComponentName,
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
import type { MainScene } from "../scenes/Main";
import { Entity } from "../Entity";
import { Factory } from "../factory/Factory";
import { handlers } from ".";
import EventBus from "../EventBus";
import { configs } from "@server/configs";
import type { Player } from "../Player";
import ForestScene from "../scenes/Forest";

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

    const prev = {
      inventory: current
        .getComponent<InventoryComponent>(ComponentName.INVENTORY)
        ?.get(),
      hotbar: current
        .getComponent<HotbarComponent>(ComponentName.HOTBAR)
        ?.getSlots(),
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

    main.managers.entities.removeByMap(prev.map as MapName);

    if (configs.maps[prev.map].isInstanced)
      main.time.delayedCall(0, () => {
        (main.scene.get(prev.map) as ForestScene).teardown();
      });
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
      const def = configs.entities[EntityName.LANTERN];
      if (!def) return;

      const id = `lantern-${p.id}`;
      const entity = Factory.create(p.scene, {
        ...def,
        id,
        map: p.map,
        x: p.x,
        y: p.y,
        name: EntityName.LANTERN,
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

  transition: (data: PlayerConfig, main: MainScene): void => {
    if (!main.managers.players.player) return;

    EventBus.emit(Event.ENTITY_DIALOGUE_END);

    main.managers.players.player.isLocked = true;
    main.managers.players.player.isTransitioning = true;

    main.managers.sound.play.sfx(SoundName.DOOR);

    handlers.ui.backdrop.show();

    main.time.delayedCall(300, () => {
      main.managers.players.player!.isTransitioning = false;
      player.swap(data, main);
      handlers.ui.backdrop.hide(main, data.map);
    });
  },
};
