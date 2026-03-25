import {
  ComponentName,
  GrowableConfig,
  GrowthStageConfig,
} from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { TextureComponent } from "./Texture";
import { effects } from "../effects";

export class GrowableComponent extends Component {
  private entity: Entity;
  private config: GrowableConfig;
  private elapsed: number = 0;
  private stageIndex: number = 0;

  public name = ComponentName.GROWABLE;

  constructor(entity: Entity, config: GrowableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    if (this.entity.createdAt)
      this.elapsed = Date.now() - this.entity.createdAt;

    const progress = Math.min(this.elapsed / this.config.duration, 1);
    this.stageIndex = this.getStageIndex(progress);
    this.applyStage(this.config.stages[this.stageIndex]);
    this.entity.on("pointed", this.harvest, this);
  }

  update(): void {
    if (this.config.needsWater) return;

    this.elapsed += this.entity.scene.game.loop.delta;

    const progress = Math.min(this.elapsed / this.config.duration, 1);
    const index = this.getStageIndex(progress);

    if (index !== this.stageIndex) {
      this.stageIndex = index;
      this.applyStage(this.config.stages[index]);
    }
  }

  detach(): void {
    this.entity.off("pointed", this.harvest, this);
  }

  private harvest(): void {
    const last = this.config.stages[this.config.stages.length - 1];
    if (this.config.stages[this.stageIndex] !== last) return;

    this.entity.scene.game.events.emit("entity:harvest", {
      entityId: this.entity.id,
      yield: this.config.yield,
    });

    effects.shaders.stretch(this.entity, () => {
      this.entity.scene.managers.entities.remove(this.entity.id);
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
