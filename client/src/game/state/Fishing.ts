import {
  ComponentName,
  Direction,
  Event,
  FishName,
  StateName,
  ZoneName,
} from "@server/types";
import {
  DURATION_FISHING_WAIT_MIN,
  DURATION_FISHING_WAIT_MAX,
  DURATION_FISHING_WINDOW,
  FISHING_ARC_HEIGHT,
  FISHING_ARC_DURATION,
  FISHING_SCAN_TILES,
  TILE_SIZE,
} from "@server/globals";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { ZoneComponent } from "../components/Zone";
import { handlers } from "../handlers";

enum Phase {
  CASTING = "casting",
  WAITING = "waiting",
  BITE = "bite",
  CATCHING = "catching",
}

export class Fishing implements State {
  public name = StateName.FISHING;

  private phase: Phase = Phase.CASTING;
  private facing: Direction = Direction.DOWN;
  private prevPointerdown = false;
  private bobberX = 0;
  private bobberY = 0;
  private onThrowComplete:
    | ((anim: Phaser.Animations.Animation) => void)
    | null = null;
  private waitTimer: Phaser.Time.TimerEvent | null = null;
  private biteTimer: Phaser.Time.TimerEvent | null = null;
  private onCatchComplete:
    | ((anim: Phaser.Animations.Animation) => void)
    | null = null;
  private zoneFish: FishName[] | null = null;

  enter(entity: Entity): void {
    const water = this._findWater(entity);

    if (!water) {
      this._returnToIdle(entity);
      return;
    }

    entity.setState(this.name);
    entity.isLocked = true;

    this.phase = Phase.CASTING;
    this.facing = entity.facing;
    this.prevPointerdown = true;
    this.bobberX = water.x;
    this.bobberY = water.y;

    this._playVariant(entity, "throw", 4, 10, 0);

    this.onThrowComplete = () => {
      this._startWaiting(entity);
    };
    entity.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.onThrowComplete,
    );
  }

  update(entity: Entity): void {
    const justClicked = entity.pointerdown && !this.prevPointerdown;
    this.prevPointerdown = entity.pointerdown;

    if (!justClicked) return;

    if (this.phase === Phase.WAITING) this._miss(entity);
    else if (this.phase === Phase.BITE) this._catch(entity);
  }

  exit(entity: Entity): void {
    if (this.onThrowComplete)
      entity.off(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        this.onThrowComplete,
      );
    if (this.onCatchComplete)
      entity.off(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        this.onCatchComplete,
      );
    this._clearTimers();
    entity.isLocked = false;
  }

  private _findWater(entity: Entity): { x: number; y: number } | null {
    const tilemap = entity.scene.tileManager.map;
    const waterLayer = tilemap.getLayer("water");
    if (!waterLayer) return null;

    const step = handlers.direction.getDirectionalOffset(
      entity.facing,
      TILE_SIZE,
    );
    const camera = entity.scene.cameras.main;

    for (let i = 1; i <= FISHING_SCAN_TILES; i++) {
      const x = entity.x + step.x * i;
      const y = entity.y + step.y * i;
      const tile = tilemap.getTileAtWorldXY(x, y, false, camera, "water");
      if (tile) return { x, y };
    }

    return null;
  }

  private _findFishZone(
    entity: Entity,
    x: number,
    y: number,
  ): FishName[] | null {
    for (const other of entity.scene.managers.entities.all) {
      const zone = other.getComponent<ZoneComponent>(ComponentName.ZONE);

      if (!zone || zone.type !== ZoneName.FISH) continue;
      if (zone.contains(x, y)) return zone.data.fish ?? [];
    }

    return null;
  }

  private _startWaiting(entity: Entity): void {
    this.phase = Phase.WAITING;
    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(StateName.FISHING, this.facing);

    this.zoneFish = this._findFishZone(entity, this.bobberX, this.bobberY);
    if (!this.zoneFish) return;

    const delay =
      DURATION_FISHING_WAIT_MIN +
      Math.random() * (DURATION_FISHING_WAIT_MAX - DURATION_FISHING_WAIT_MIN);

    this.waitTimer = entity.scene.time.delayedCall(delay, () => {
      this._startBite(entity);
    });
  }

  private _startBite(entity: Entity): void {
    this.phase = Phase.BITE;
    this._playVariant(entity, "bite", 4, 8, -1);

    this.biteTimer = entity.scene.time.delayedCall(
      DURATION_FISHING_WINDOW,
      () => {
        this._miss(entity);
      },
    );
  }

  private _catch(entity: Entity): void {
    this.phase = Phase.CATCHING;
    this._clearTimers();
    this._playVariant(entity, "catch", 6, 10, 0);

    const available = this.zoneFish;
    const fishName =
      available && available.length
        ? available[Math.floor(Math.random() * available.length)]
        : null;

    this.onCatchComplete = () => {
      this.onCatchComplete = null;
      if (fishName) this._spawnFishArc(entity, fishName);
      this._returnToIdle(entity);
    };

    entity.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      this.onCatchComplete,
    );
  }

  private _miss(entity: Entity): void {
    this._returnToIdle(entity);
  }

  private _returnToIdle(entity: Entity): void {
    this._clearTimers();
    entity.isLocked = false;

    const idle = entity.states?.get(StateName.IDLE);
    if (idle) idle.enter(entity);
  }

  private _spawnFishArc(entity: Entity, fishName: FishName): void {
    const iconMap: Record<FishName, { row: number; col: number }> = {
      [FishName.CARP]: { row: 4, col: 13 },
      [FishName.PERCH]: { row: 2, col: 25 },
      [FishName.PIKE]: { row: 4, col: 7 },
    };
    const icon = iconMap[fishName];
    const texture = entity.scene.textures.get("icons1");
    const columns = Math.floor(texture.source[0].width / 16);
    const frameIndex = (icon.row - 1) * columns + (icon.col - 1);

    const originX = this.bobberX;
    const originY = this.bobberY;

    const fish = entity.scene.add.image(originX, originY, "icons1", frameIndex);
    fish.setDepth(1000 + originY);

    const startY = originY;
    const endX = entity.x;
    const endY = entity.y;
    const isOwner = entity === entity.scene.managers.players.player;

    entity.scene.tweens.add({
      targets: fish,
      x: endX,
      duration: FISHING_ARC_DURATION,
      ease: "Linear",
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const p = tween.progress;
        const arc = Math.sin(p * Math.PI) * FISHING_ARC_HEIGHT;
        fish.y = Phaser.Math.Linear(startY, endY, p) - arc;
        fish.setDepth(1000 + fish.y);
      },
      onComplete: () => {
        fish.destroy();

        if (!isOwner || !entity.active) return;

        entity.scene.game.events.emit(Event.ENTITY_FISH, {
          name: fishName,
          x: endX,
          y: endY + 8,
          originX,
          originY,
        });
      },
    });
  }

  private _playVariant(
    entity: Entity,
    variant: string,
    frameCount: number,
    frameRate: number,
    repeat: number,
  ): void {
    const textureKey = `player-fishing-${variant}`;
    if (!entity.scene.textures.exists(textureKey)) return;

    const dirIndex = Object.values(Direction).indexOf(this.facing);
    const animKey = `${textureKey}-${this.facing}`;

    if (!entity.scene.anims.exists(animKey)) {
      const frames = entity.scene.anims.generateFrameNumbers(textureKey, {
        start: dirIndex * frameCount,
        end: dirIndex * frameCount + frameCount - 1,
      });

      if (!frames.length) return;

      entity.scene.anims.create({ key: animKey, frames, frameRate, repeat });
    }

    if (entity.scene.anims.exists(animKey)) {
      entity.setTexture(textureKey);
      entity.play(animKey);
    }
  }

  private _clearTimers(): void {
    this.onThrowComplete = null;
    this.waitTimer?.destroy();
    this.biteTimer?.destroy();
    this.waitTimer = null;
    this.biteTimer = null;
  }
}
