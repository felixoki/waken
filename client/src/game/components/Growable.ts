import {
  ComponentName,
  CropState,
  Event,
  GrowableConfig,
  GrowthStageConfig,
} from "@server/types";
import { DURATION_CROP_DEHYDRATION } from "@server/globals";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { TextureComponent } from "./Texture";
import { vfx } from "../vfx";
import EventBus from "../EventBus";

const THIRSTY_TINT = 0xd9c39a;
const DEPTH_BIAS = -10;

export class GrowableComponent extends Component {
  private entity: Entity;
  private config: GrowableConfig;
  private crop?: CropState;
  private elapsed: number = 0;
  private stageIndex: number = 0;
  private isHarvesting = false;
  private watered = false;
  private lastWateredAt = 0;
  private withering = false;
  private hinted = false;

  public name = ComponentName.GROWABLE;

  constructor(entity: Entity, config: GrowableConfig, crop?: CropState) {
    super();

    this.entity = entity;
    this.config = config;
    this.crop = crop;
  }

  attach(): void {
    this._init();

    this.applyStage(this.config.stages[this.stageIndex]);

    this.entity.depthOffset = DEPTH_BIAS;
    this.entity.setDepth(1000 + this.entity.y + DEPTH_BIAS);

    if (this.config.needsWater && !this.isMature() && !this.watered)
      this._setThirsty();
  }

  private _init(): void {
    const duration = this.config.duration;
    const last = this.config.stages.length - 1;

    if (this.crop) {
      this.stageIndex = Math.min(Math.max(this.crop.growth ?? 0, 0), last);
      this.watered = this.crop.watered ?? false;

      const base = this.config.stages[this.stageIndex].at * duration;

      if (this.watered && this.stageIndex < last && this.crop.wateredAt) {
        const nextAt = this.config.stages[this.stageIndex + 1].at * duration;
        this.elapsed = Math.min(
          base + (Date.now() - this.crop.wateredAt),
          nextAt,
        );
      } else this.elapsed = base;

      this.lastWateredAt =
        this.crop.wateredAt ?? this.entity.createdAt ?? Date.now();

      return;
    }

    if (!this.config.needsWater) {
      this.elapsed = this.entity.createdAt
        ? Date.now() - this.entity.createdAt
        : 0;
      this.stageIndex = this.getStageIndex(
        Math.min(this.elapsed / duration, 1),
      );
      this.watered = true;
      this.lastWateredAt = Date.now();

      return;
    }

    this.elapsed = 0;
    this.stageIndex = 0;
    this.watered = false;
    this.lastWateredAt = this.entity.createdAt || Date.now();
  }

  update(): void {
    if (this.isMature()) return;

    if (this.config.needsWater && !this.watered) {
      this._checkDehydration();
      return;
    }

    this.elapsed += this.entity.scene.game.loop.delta;

    const progress = Math.min(this.elapsed / this.config.duration, 1);
    const index = this.getStageIndex(progress);

    if (index !== this.stageIndex) {
      this.stageIndex = index;
      this.applyStage(this.config.stages[index]);

      const player = this.entity.scene.managers.players.player;

      if (player?.isAuthority)
        this.entity.scene.game.events.emit(Event.ENTITY_GROW, {
          id: this.entity.id,
          stage: index,
        });

      if (this.config.needsWater && !this.isMature()) this._setThirsty();
      else if (this.isMature()) this.entity.clearTint();

      this._refreshHint();
    }
  }

  detach(): void {
    if (this.hinted) EventBus.emit(Event.TOOLTIP_TOGGLE, null);
  }

  public isMature(): boolean {
    return this.stageIndex === this.config.stages.length - 1;
  }

  public needsWater(): boolean {
    return !!this.config.needsWater && !this.watered && !this.isMature();
  }

  public water(): void {
    if (this.isMature() || this.watered) return;

    this.watered = true;
    this.lastWateredAt = Date.now();
    this.entity.clearTint();

    this._refreshHint();
  }

  public harvest(): void {
    if (this.isHarvesting || !this.isMature()) return;

    this.isHarvesting = true;

    this.entity.scene.game.events.emit(Event.ENTITY_HARVEST, {
      entityId: this.entity.id,
      yield: this.config.yield,
    });

    vfx.shaders.stretch(this.entity, () => {
      this.entity.scene.managers.entities.remove(this.entity.id);
    });
  }

  public showHint(): void {
    this.hinted = true;
    this._refreshHint();
  }

  public hideHint(): void {
    this.hinted = false;
    EventBus.emit(Event.TOOLTIP_TOGGLE, null);
  }

  private _refreshHint(): void {
    if (!this.hinted) return;

    const needsWater = this.needsWater();

    const cam = this.entity.scene.cameras.main;
    const x = (this.entity.x - cam.worldView.x) * cam.zoom;
    const y = (this.entity.y - cam.worldView.y) * cam.zoom;

    EventBus.emit(Event.TOOLTIP_TOGGLE, {
      text: needsWater ? "Needs water" : "Healthy",
      x,
      y,
    });
  }

  private _setThirsty(): void {
    this.watered = false;
    this.entity.setTint(THIRSTY_TINT);
  }

  private _checkDehydration(): void {
    if (this.withering) return;

    const player = this.entity.scene.managers.players.player;
    if (!player?.isAuthority) return;

    if (Date.now() - this.lastWateredAt < DURATION_CROP_DEHYDRATION) return;

    this.withering = true;
    this.entity.scene.game.events.emit(Event.ENTITY_WITHER, {
      id: this.entity.id,
    });
  }

  private getStageIndex(progress: number): number {
    let index = 0;

    for (let i = 0; i < this.config.stages.length; i++)
      if (progress >= this.config.stages[i].at) index = i;

    return index;
  }

  private applyStage(stage: GrowthStageConfig): void {
    const texture = this.entity.getComponent<TextureComponent>(
      ComponentName.TEXTURE,
    );

    const { spritesheet, tileSize } = this.config;
    const key = `${this.entity.name}_${stage.stage}`;

    texture?.swap({ spritesheet, tileSize, tiles: stage.tiles }, key);

    const height = stage.tiles.length * tileSize;
    const offset = stage.offsetY ?? 0;
    this.entity.setOrigin(0.5, 0.5 - offset / height);
  }
}
