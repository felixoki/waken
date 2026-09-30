import { AmbienceLayer, SurfaceName } from "@server/types";
import {
  CLIMATE_EASE,
  CLIMATE_RADIUS,
  FROST_EASE,
  FROST_OFF,
  FROST_ON,
  SNOW_COOLNESS,
  SURFACE_OFFSET,
} from "@server/globals";
import type { Scene } from "../scenes/Scene";
import type { AmbiencePipeline } from "../pipelines/Ambience";

export class ClimateManager {
  private snow = 0;
  private frosty = false;
  private chill = 0;

  constructor(
    private scene: Scene,
    private pipeline: AmbiencePipeline,
  ) {}

  get frost(): number {
    return this.chill;
  }

  update(delta: number): void {
    const player = this.scene.managers.players.player;
    const tiles = this.scene.tileManager;

    if (!player || !tiles || player.map !== this.scene.scene.key) {
      this.snow = 0;
      this.frosty = false;
      this.chill = 0;
    } else {
      const snow = tiles.exposure(
        SurfaceName.SNOW,
        player.x,
        player.y + SURFACE_OFFSET,
        CLIMATE_RADIUS,
      );

      this.snow += (snow - this.snow) * (1 - Math.exp(-delta / CLIMATE_EASE));

      if (snow >= FROST_ON) this.frosty = true;
      else if (snow <= FROST_OFF) this.frosty = false;

      const target = this.frosty ? 1 : 0;
      this.chill += (target - this.chill) * (1 - Math.exp(-delta / FROST_EASE));
    }

    const layer = this.pipeline.layer(AmbienceLayer.CLIMATE);

    layer.frost = this.chill;
    layer.coolness = this.snow * SNOW_COOLNESS;
  }
}
