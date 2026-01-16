import { Scene } from "./Scene";

export class HerbalistScene extends Scene {
  constructor() {
    super("herbalist");
  }

  create() {
    super.create();

    /**
     * We will replace this with a proper map later
     */
    this.add.rectangle(0, 0, 800, 600, 0x8b4513).setOrigin(0);
    this.cameraManager.setZoom(2);
  }
}
