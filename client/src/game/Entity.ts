import {
  ComponentName,
  Direction,
  EffectName,
  Event,
  Input,
  MapName,
  SpellName,
  StateName,
  TameState,
} from "@server/types";
import { State } from "./state/State";
import { Component } from "./components/Component";
import { Effect } from "./effects/Effect";
import { EntityName } from "@server/types";
import { Scene } from "./scenes/Scene";
import { BehaviorQueue } from "./components/BehaviorQueue";
import { handlers } from "./handlers";
import {
  FLAT_DEPTH,
  INPUT_SEND_INTERVAL,
  SPEED_DEFAULT,
} from "@server/globals";
import { configs } from "@server/configs";

export class Entity extends Phaser.GameObjects.Sprite {
  public id: string;
  public map!: MapName;
  public facing: Direction;
  public moving: Direction[];
  public isLocked: boolean = false;
  public isStatic: boolean = false;
  public health: number = 100;
  public maxHealth: number = 100;
  public mana: number = 100;
  public maxMana: number = 100;
  public speed: number = SPEED_DEFAULT;
  public createdAt: number = 0;
  public target?: { x: number; y: number; id?: string };
  public spell: SpellName | null = null;
  public pointerdown: boolean = false;
  public knockback?: Phaser.Time.TimerEvent;
  public flash?: Phaser.Tweens.Tween;
  public z: number = 0;
  public clearance?: number;
  public depthOffset: number = 0;
  public tame: TameState = {};
  public bed?: string;
  public driftX: number = 0;
  public driftY: number = 0;

  protected lastInput: Partial<Input> | null = null;
  protected lastSentAt: number = 0;
  protected depthY: number = 0;

  public components = new Map<ComponentName, Component>();
  public effects = new Map<EffectName, Effect>();
  public states?: Map<StateName, State>;

  declare scene: Scene;
  declare state: StateName;
  declare name: EntityName;
  declare body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: EntityName,
    health: number,
    facing: Direction,
    moving: Direction[],
    states?: Map<StateName, State>,
  ) {
    super(scene, x, y, texture);

    this.id = id;
    this.setName(name);
    this.health = health;

    this.facing = facing;
    this.moving = moving;
    this.states = states;

    this._init();
  }

  private _init() {
    this.scene.add.existing(this);
    this.depthY = this.y;

    if (configs.entities[this.name as EntityName]?.flat)
      this.depthOffset = FLAT_DEPTH - 1000 - this.y;

    this.setDepth(1000 + this.y + this.depthOffset);
  }

  tick(): void {
    this.components.forEach((component) => {
      if (component.name !== ComponentName.BEHAVIOR_QUEUE) component.update();
    });
  }

  update(remoteInput?: Partial<Input>): void {
    const input = remoteInput || this._getInput();

    if (!input || this.isLocked) return;

    const prepared = { ...input, id: this.id, x: this.x, y: this.y };
    if (this.z <= 0 && handlers.water.swimming(this)) prepared.state = undefined;
    const { state } = handlers.state.resolve(prepared);

    if (input.facing) this.setFacing(input.facing);
    if (input.moving) this.setMoving(input.moving);
    if (input.target) this.setTarget(input.target);

    if (input.spell !== undefined) this.spell = input.spell;

    if (state !== this.state) this.transitionTo(state);
    else this.states?.get(this.state)?.update(this);

    if (remoteInput) handlers.interpolation.drift(this, input.x!, input.y!);

    const isAuthority = this.scene.managers.players?.player?.isAuthority;

    if (isAuthority && input && this._changed(input)) {
      this.lastInput = input;
      this.lastSentAt = this.scene.game.loop.time;
      this.scene.game.events.emit(Event.ENTITY_INPUT, input);
    }

    const depthY = Math.round(this.y);

    if (depthY !== this.depthY) {
      this.depthY = depthY;
      this.setDepth(1000 + this.y + this.depthOffset);
    }
  }

  protected _changed(input: Partial<Input>): boolean {
    if (input.state === StateName.CASTING) return true;

    const last = this.lastInput;
    if (!last) return true;

    if (
      input.facing !== last.facing ||
      input.state !== last.state ||
      (input.moving?.length ?? 0) !== (last.moving?.length ?? 0) ||
      (input.moving?.some((d, i) => d !== last.moving?.[i]) ?? false)
    )
      return true;

    if (
      input.x === last.x &&
      input.y === last.y &&
      input.target?.x === last.target?.x &&
      input.target?.y === last.target?.y
    )
      return false;

    return this._due();
  }

  protected _due(): boolean {
    return this.scene.game.loop.time - this.lastSentAt >= INPUT_SEND_INTERVAL;
  }

  protected _getInput(): Partial<Input> | null {
    const scene = this.scene as Scene;
    const isAuthority = scene.managers.players?.player?.isAuthority;

    if (!isAuthority) return null;
    if (!scene.managers.chunks?.isActive(this.map, this.x, this.y)) return null;

    const behavior = this.getComponent<BehaviorQueue>(
      ComponentName.BEHAVIOR_QUEUE,
    );

    const input = behavior?.update();

    if (!input) return null;

    return { ...input, id: this.id, x: this.x, y: this.y };
  }

  destroy(fromScene?: boolean): void {
    const state = this.states?.get(this.state);
    state?.exit(this);

    this.components.forEach((component) => component.detach());
    this.components.clear();

    this.effects.forEach((effect) => effect.detach());
    this.effects.clear();

    super.destroy(fromScene);
  }

  /**
   * State management
   */
  transitionTo(state: StateName): void {
    const prevState = this.states?.get(this.state);
    prevState?.exit(this);

    const nextState = this.states?.get(state);
    nextState?.enter(this);
  }

  /**
   * Component management
   */
  addComponent(component: Component): void {
    component.attach();
    this.components.set(component.name, component);
  }

  getComponent<T extends Component>(name: ComponentName): T | undefined {
    return this.components.get(name) as T | undefined;
  }

  hasComponent(name: ComponentName): boolean {
    return this.components.has(name);
  }

  removeComponent(name: ComponentName): void {
    const component = this.components.get(name);

    if (component) {
      component.detach();
      this.components.delete(name);
    }
  }

  /**
   * Effect management
   */
  addEffect(effect: Effect): void {
    const existing = this.effects.get(effect.name);
    if (existing) existing.detach();
    effect.attach();
    this.effects.set(effect.name, effect);
  }

  hasEffect(name: EffectName): boolean {
    return this.effects.has(name);
  }

  removeEffect(name: EffectName): void {
    const effect = this.effects.get(name);

    if (effect) {
      effect.detach();
      this.effects.delete(name);
    }
  }

  /**
   * Helpers
   */
  setFacing(facing: Direction | null | undefined): void {
    this.facing = facing || this.facing;
  }

  setMoving(moving: Direction[]): void {
    this.moving = moving;
  }

  setTarget(target: { x: number; y: number; id?: string }): void {
    this.target = target;
  }
}
