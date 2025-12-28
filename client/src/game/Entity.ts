import { ComponentName, StateName } from "@server/types";
import { State } from "./state/State";
import { Component } from "./components/Component";
import { handlers } from "./handlers";
import { EntityName } from "@server/configs";

export class Entity extends Phaser.GameObjects.Sprite {
  public id: string;
  
  public components = new Map<ComponentName, Component>();
  public states?: Map<StateName, State>;

  declare state: StateName;
  declare name: EntityName;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    states?: Map<StateName, State>
  ) {
    super(scene, x, y, texture);

    this.id = id;
    this.setName(name);
    this.states = states;

    this._init();
  }

  private _init() {
    this.scene.add.existing(this);
    this.scene.sys.updateList.add(this);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }

  /**
   * State management
   */
  transition(): void {
    const { state, needsUpdate } = handlers.state.resolve();

    if (state !== this.state) {
      const prevState = this.states?.get(this.state);
      prevState?.exit(this);

      this.setState(state);

      const nextState = this.states?.get(state);
      nextState?.enter(this);
    }

    if (needsUpdate) this.states?.get(this.state)?.update(this);
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
}
