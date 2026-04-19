import {
  AmbienceConfig,
  ComponentName,
  MapName,
  PipelineName,
  TimePhase,
} from "@server/types";
import { MainScene } from "../scenes/Main";
import { configs } from "@server/configs";
import { AmbiencePipeline } from "../pipelines/Ambience";
import { PHASE_TRANSITION_DURATION } from "@server/globals";
import { LightComponent } from "../components/Light";

export class AmbienceManager {
  private scene: MainScene;
  private ambientColors = new Map<
    string,
    { r: number; g: number; b: number }
  >();

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  setPhase(phase: TimePhase, animate: boolean) {
    const preset = configs.time.phases[phase];

    const pipelines = this._getPipelines();
    pipelines.forEach(
      animate
        ? (p) => this._transitionTo(p, preset)
        : (p) => this._apply(p, preset),
    );

    const scenes = this._getOutdoorScenes();
    scenes.forEach((s) => {
      const color = Phaser.Display.Color.IntegerToColor(preset.ambient);

      if (animate) this._transitionAmbient(s, color);
      else {
        s.lights.setAmbientColor(preset.ambient);
        this.ambientColors.set(s.scene.key, {
          r: color.red,
          g: color.green,
          b: color.blue,
        });
      }
    });

    this._scaleLights(preset.lightIntensity, animate);
  }

  private _getOutdoorScenes(): Phaser.Scene[] {
    return this.scene.scene.manager
      .getScenes(false)
      .filter((s) => !configs.maps[s.scene.key as MapName]?.isIndoor);
  }

  private _getPipelines(): AmbiencePipeline[] {
    return this._getOutdoorScenes()
      .filter((s) => s.cameras.main)
      .map(
        (s) =>
          s.cameras.main.getPostPipeline(
            PipelineName.AMBIENCE,
          ) as AmbiencePipeline,
      )
      .flat()
      .filter(Boolean) as AmbiencePipeline[];
  }

  private _transitionAmbient(
    scene: Phaser.Scene,
    target: Phaser.Display.Color,
  ) {
    if (!this.ambientColors.has(scene.scene.key))
      this.ambientColors.set(scene.scene.key, { r: 255, g: 255, b: 255 });

    const state = this.ambientColors.get(scene.scene.key)!;

    this.scene.tweens.add({
      targets: state,
      r: target.red,
      g: target.green,
      b: target.blue,
      duration: PHASE_TRANSITION_DURATION,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        scene.lights.setAmbientColor(
          Phaser.Display.Color.GetColor(
            Math.round(state.r),
            Math.round(state.g),
            Math.round(state.b),
          ),
        );
      },
    });
  }

  private _transitionTo(pipeline: AmbiencePipeline, config: AmbienceConfig) {
    this.scene.tweens.add({
      targets: pipeline,
      coolness: config.coolness,
      saturation: config.saturation,
      contrast: config.contrast,
      "vignette.strength": config.vignette.strength,
      duration: PHASE_TRANSITION_DURATION,
      ease: "Sine.easeInOut",
    });
  }

  private _apply(pipeline: AmbiencePipeline, config: AmbienceConfig) {
    pipeline.setCoolness(config.coolness);
    pipeline.setSaturation(config.saturation);
    pipeline.setContrast(config.contrast);
    pipeline.setVignette(pipeline.vignette.radius, config.vignette.strength);
  }

  private _scaleLights(multiplier: number, animate: boolean) {
    const entities = this.scene.entityManager.entities;

    for (const [_, entity] of entities) {
      const component = entity.getComponent<LightComponent>(
        ComponentName.LIGHT,
      );
      if (!component) continue;

      const target = component.intensity * multiplier;

      if (animate)
        this.scene.tweens.add({
          targets: component.light,
          intensity: component.active ? target : 0,
          duration: PHASE_TRANSITION_DURATION,
          ease: "Sine.easeInOut",
        });
      else component.light.intensity = component.active ? target : 0;
    }
  }
}
