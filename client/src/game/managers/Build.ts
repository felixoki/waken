import { ComponentName, EntityName, Event, SlotType } from "@server/types";
import { BUILD_MAPS, TILE_SIZE } from "@server/globals";
import { handlers } from "../handlers";
import EventBus from "../EventBus";
import type { MainScene } from "../scenes/Main";
import type { Scene } from "../scenes/Scene";
import type { Entity } from "../Entity";
import type { HotbarComponent } from "../components/Hotbar";

const VALID_TINT = 0x66ff66;
const INVALID_TINT = 0xff6666;

export class BuildManager {
  private main: MainScene;

  private active: EntityName | null = null;
  private scene: Scene | null = null;
  private ghost: Phaser.GameObjects.Sprite | null = null;
  private highlight: Phaser.GameObjects.Graphics | null = null;
  private pulse: Phaser.Tweens.Tween | null = null;
  private valid = false;

  constructor(main: MainScene) {
    this.main = main;

    EventBus.on(Event.BUILD_SELECT, (name: EntityName | null) => {
      this.active = name;
      this._destroyGhost();
    });
  }

  update(): void {
    const player = this.main.managers.players.player;
    const input = player?.inputManager;

    if (
      !this.active ||
      !player ||
      !BUILD_MAPS.has(player.map) ||
      !this._hammerEquipped(player)
    ) {
      input?.useLeftClick();
      input?.useRightClick();
      this._hide();
      return;
    }

    const scene = player.scene as Scene;
    const world = input?.getPointer() ?? { x: player.x, y: player.y };

    const x = Math.floor(world.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
    const y = Math.floor(world.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

    this._ensureVisuals(scene);
    if (!this.ghost || !this.highlight) return;

    this.valid = handlers.build.placeable(this.active, x, y, player, this.main);
    this.ghost.setTint(this.valid ? VALID_TINT : INVALID_TINT);

    this.ghost
      .setPosition(x, y)
      .setDepth(2000 + y)
      .setVisible(true);
    this.highlight
      .setPosition(x, y)
      .setDepth(2001 + y)
      .setVisible(true);

    if (input?.useRightClick()) {
      const id = handlers.build.target(world.x, world.y, player, this.main);

      if (id)
        this.main.managers.socket.emit(Event.BUILD_DESTROY, {
          map: player.map,
          id,
        });
        
      return;
    }

    if (input?.useLeftClick() && this.valid)
      this.main.managers.socket.emit(Event.BUILD_PLACE, {
        name: this.active,
        map: player.map,
        x,
        y,
      });
  }

  private _hammerEquipped(player: Entity): boolean {
    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();
    return (
      !!slot &&
      slot.type === SlotType.ENTITY &&
      slot.item.name === EntityName.HAMMER
    );
  }

  private _ensureVisuals(scene: Scene): void {
    if (this.scene !== scene) {
      this._destroyAll();
      this.scene = scene;
    }

    if (!this.highlight) this._buildHighlight(scene);
    if (!this.ghost && this.active) this._buildGhost(scene, this.active);
  }

  private _buildHighlight(scene: Scene): void {
    const S = 7;
    const L = 4;

    const g = scene.add.graphics();
    g.lineStyle(1.5, 0xffffff, 0.9);
    g.lineBetween(-S, -S, -S + L, -S);
    g.lineBetween(-S, -S, -S, -S + L);
    g.lineBetween(S, -S, S - L, -S);
    g.lineBetween(S, -S, S, -S + L);
    g.lineBetween(-S, S, -S + L, S);
    g.lineBetween(-S, S, -S, S - L);
    g.lineBetween(S, S, S - L, S);
    g.lineBetween(S, S, S, S - L);

    this.pulse = scene.tweens.add({
      targets: g,
      scale: { from: 0.96, to: 1.04 },
      duration: 600,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    this.highlight = g;
  }

  private _buildGhost(scene: Scene, name: EntityName): void {
    const key = handlers.build.ghostTexture(scene, name);
    if (!key) return;

    this.ghost = scene.add
      .sprite(0, 0, key)
      .setOrigin(0.5, 0.5)
      .setAlpha(0.5)
      .setVisible(false);
  }

  private _hide(): void {
    this.ghost?.setVisible(false);
    this.highlight?.setVisible(false);
    this.valid = false;
  }

  private _destroyGhost(): void {
    this.ghost?.destroy();
    this.ghost = null;
  }

  private _destroyAll(): void {
    this._destroyGhost();
    this.pulse?.remove();
    this.pulse = null;
    this.highlight?.destroy();
    this.highlight = null;
  }
}
