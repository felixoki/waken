import { ComponentName, EntityName, Event, HotbarSlotType } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import { BouncePipeline } from "../pipelines/Bounce";
import EventBus from "../EventBus";

const SHAKE_DURATION = 1200;

export class FellableComponent extends Component {
  private entity: Entity;
  private pipeline?: BouncePipeline;
  private isFelling: boolean = false;

  public name = ComponentName.FELLABLE;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this._fell, this);
    EventBus.on(Event.HOTBAR_UPDATE, this._onHotbarUpdate, this);

    this._sync();
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._fell, this);
    EventBus.off(Event.HOTBAR_UPDATE, this._onHotbarUpdate, this);

    this._cleanup();
  }

  private _onHotbarUpdate = () => {
    this._sync();
  };

  private _sync(): void {
    if (this._isAxeEquipped()) {
      this.entity.setInteractive();
      return;
    }

    this.entity.disableInteractive();
  }

  private _isAxeEquipped(): boolean {
    const player = this.entity.scene.managers.players.player;
    if (!player) return false;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    return (
      !!slot &&
      slot.type === HotbarSlotType.ENTITY &&
      slot.name === EntityName.AXE
    );
  }

  private _fell(): void {
    if (this.isFelling || !this._isAxeEquipped()) return;

    this.isFelling = true;

    const game = this.entity.scene.game;
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;

    const name = `fell_${this.entity.id}`;
    this.pipeline = new BouncePipeline(game, name);
    renderer.pipelines.add(name, this.pipeline);

    this.pipeline.trigger(0.12, 2.0, 1.5, 18.0);
    this.entity.setPipeline(name);

    this.entity.scene.time.delayedCall(SHAKE_DURATION, () => {
      this._cleanup();

      if (!this.entity.scene) return;

      this.entity.scene.game.events.emit(Event.ENTITY_FELL, {
        id: this.entity.id,
        x: this.entity.x,
        y: this.entity.y,
      });

      this.entity.scene?.managers.entities.remove(this.entity.id);
    });
  }

  private _cleanup(): void {
    if (!this.pipeline) return;

    const game = this.entity.scene?.game;
    if (!game) return;

    this.entity.resetPipeline();

    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    renderer.pipelines.remove(this.pipeline.name);
    this.pipeline = undefined;
  }
}
