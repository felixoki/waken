import {
  ComponentName,
  Direction,
  Event,
  FishName,
  FishingPhase,
  Hooked,
  Reel,
  ReelOutcome,
  SoundName,
  StateName,
} from "@server/types";
import {
  DURATION_FISHING_WAIT_MIN,
  DURATION_FISHING_WAIT_MAX,
  DURATION_FISHING_WINDOW,
  FISHING_ARC_HEIGHT,
  FISHING_ARC_DURATION,
} from "@server/globals";
import { configs } from "@server/configs";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { Player } from "../Player";
import { handlers } from "../handlers";
import EventBus from "../EventBus";

export class Fishing implements State {
  public name = StateName.FISHING;

  private phase: FishingPhase = FishingPhase.CASTING;
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
  private reel: Reel | null = null;

  enter(entity: Entity): void {
    const water = handlers.fishing.findWater(entity);

    if (!water) {
      this._returnToIdle(entity);
      return;
    }

    entity.setState(this.name);
    entity.isLocked = true;

    this.phase = FishingPhase.CASTING;
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
    if (this.phase === FishingPhase.REELING) {
      this._updateReel(entity);
      return;
    }

    const justClicked = entity.pointerdown && !this.prevPointerdown;
    this.prevPointerdown = entity.pointerdown;

    if (!justClicked) return;

    if (this.phase === FishingPhase.WAITING) this._miss(entity);
    else if (this.phase === FishingPhase.BITE) this._hook(entity);
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
    this._endReel(entity);
    this._clearTimers();
    entity.isLocked = false;
  }

  private _startWaiting(entity: Entity): void {
    this.phase = FishingPhase.WAITING;
    entity
      .getComponent<AnimationComponent>(ComponentName.ANIMATION)
      ?.play(StateName.FISHING, this.facing);

    this.zoneFish = handlers.fishing.findZone(
      entity,
      this.bobberX,
      this.bobberY,
    );
    if (!this.zoneFish) return;

    const delay =
      DURATION_FISHING_WAIT_MIN +
      Math.random() * (DURATION_FISHING_WAIT_MAX - DURATION_FISHING_WAIT_MIN);

    this.waitTimer = entity.scene.time.delayedCall(delay, () => {
      this._startBite(entity);
    });
  }

  private _startBite(entity: Entity): void {
    this.phase = FishingPhase.BITE;
    this._playVariant(entity, "bite", 4, 8, -1);

    this.biteTimer = entity.scene.time.delayedCall(
      DURATION_FISHING_WINDOW,
      () => {
        this._miss(entity);
      },
    );
  }

  private _hook(entity: Entity): void {
    this._clearTimers();

    const hooked = handlers.fishing.roll(this.zoneFish);
    const isOwner = entity === entity.scene.managers.players.player;

    if (!hooked || !isOwner) {
      this._catch(entity, hooked);
      return;
    }

    this.phase = FishingPhase.REELING;
    this.reel = handlers.fishing.start(hooked);

    (entity as Player).inputManager?.setCapture(true);

    entity.scene.managers.sound.play.sfx(SoundName.WATER, {
      position: { x: entity.x, y: entity.y },
    });

    EventBus.emit(Event.FISHING_MINIGAME_START, {
      bar: this.reel.difficulty.bar,
    });
  }

  private _updateReel(entity: Entity): void {
    const reel = this.reel;
    if (!reel) return;

    const dt = Math.min(entity.scene.game.loop.delta / 1000, 0.05);
    const direction = (entity as Player).inputManager?.getReel() ?? 0;

    const { on, outcome } = handlers.fishing.step(
      reel,
      direction,
      dt,
      entity.scene.time.now,
    );

    EventBus.emit(Event.FISHING_MINIGAME_UPDATE, {
      bar: reel.barPos,
      fish: reel.fishPos,
      meter: reel.meter,
      on,
    });

    if (outcome === ReelOutcome.FIGHTING) return;

    const hooked: Hooked = {
      name: reel.name,
      weight: reel.weight,
      percentile: reel.percentile,
    };

    this._endReel(entity);

    if (outcome === ReelOutcome.ESCAPED) {
      this._miss(entity);
      return;
    }

    entity.scene.managers.sound.play.sfx(SoundName.COLLECT, {
      position: { x: entity.x, y: entity.y },
    });
    this._catch(entity, hooked);
  }

  private _endReel(entity: Entity): void {
    if (!this.reel) return;

    this.reel = null;
    (entity as Player).inputManager?.setCapture(false);
    EventBus.emit(Event.FISHING_MINIGAME_END);
  }

  private _catch(entity: Entity, hooked: Hooked | null): void {
    this.phase = FishingPhase.CATCHING;
    this._clearTimers();
    this._playVariant(entity, "catch", 6, 10, 0);

    this.onCatchComplete = () => {
      this.onCatchComplete = null;
      if (hooked) this._spawnFishArc(entity, hooked);
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
    this._endReel(entity);
    this._clearTimers();
    entity.isLocked = false;

    entity.states?.get(StateName.IDLE)?.enter(entity);
  }

  private _spawnFishArc(entity: Entity, hooked: Hooked): void {
    const entityName = handlers.fishing.toEntityName(hooked.name);
    const icon = configs.entities[entityName]?.metadata?.icon;
    if (!icon) return;

    const texture = entity.scene.textures.get(icon.spritesheet);
    const columns = Math.floor(texture.source[0].width / 16);
    const frameIndex = (icon.row - 1) * columns + (icon.col - 1);

    const originX = this.bobberX;
    const originY = this.bobberY;

    const fish = entity.scene.add.image(
      originX,
      originY,
      icon.spritesheet,
      frameIndex,
    );
    fish.setDepth(1000 + originY);

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
        fish.y = Phaser.Math.Linear(originY, endY, p) - arc;
        fish.setDepth(1000 + fish.y);
      },
      onComplete: () => {
        fish.destroy();

        if (!isOwner || !entity.active) return;

        entity.scene.game.events.emit(Event.ENTITY_FISH, {
          name: hooked.name,
          weight: hooked.weight,
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
