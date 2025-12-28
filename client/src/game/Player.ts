import { ComponentName, Direction, StateName } from "@server/types";
import { AnimationComponent } from "./components/Animation";
import { Entity } from "./Entity";
import { InputManager } from "./managers/Input";
import { ANIMATIONS, EntityName } from "@server/configs";

export class Player extends Entity {
  public socketId: string;
  public isControllable: boolean;
  public inputManager?: InputManager;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    socketId: string,
    isControllable: boolean
  ) {
    super(scene, x, y, texture, id, name);

    this.socketId = socketId;
    this.isControllable = isControllable;

    if (this.isControllable) this.inputManager = new InputManager(this.scene);

    this.init();
  }

  init(): void {
    this.setScale(2);
    
    this.addComponent(
      new AnimationComponent(this, ANIMATIONS[EntityName.PLAYER])
    );
    const anim = this.getComponent<AnimationComponent>(ComponentName.ANIMATION);
    anim?.play(StateName.WALKING, Direction.UP);
  }
}
